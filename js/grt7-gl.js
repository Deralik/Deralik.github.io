/* GL renderer for the hero panes (shaders: js/grt-gl-shaders.js).
   The truth field is evaluated continuously per sample — analytic
   densities for the nebulae, trilinear vendored grids for the real
   volumes — so the GT side is not resolution-bound by any precomputed
   emission grid. The cache side marches the baked cache texture. Pass A
   accumulates the 1-spp estimator, pass B composites the seam, pass C
   full-marches the reference inset. Returns null when WebGL2 or float
   render targets are missing — the CPU grid path remains the fallback. */
window.GRT7GL = function () {
  const cv = document.createElement('canvas');
  const gl = cv.getContext('webgl2', { alpha: false, antialias: false });
  if (!gl || !gl.getExtension('EXT_color_buffer_float') || !window.GRTGLSL) return null;
  const { VS, FSA, FSB, FSC } = window.GRTGLSL;

  function sh(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('grt7-gl shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function prog(fs) {
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('grt7-gl link:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }
  const pA = prog(FSA),
    pB = prog(FSB),
    pC = prog(FSC);
  if (!pA || !pB || !pC) return null;
  const U = (p, n) => gl.getUniformLocation(p, n);

  function tex3(filter) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_3D, t);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, filter);
    for (const w of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R])
      gl.texParameteri(gl.TEXTURE_3D, w, gl.CLAMP_TO_EDGE);
    return t;
  }
  const S = {
    tCs: [tex3(gl.LINEAR), tex3(gl.LINEAR)],
    tci: 0,
    pend: null,
    upZ: 0,
    tD: tex3(gl.LINEAR),
    tA: tex3(gl.LINEAR),
    tLUT: gl.createTexture(),
    dims: null,
    acc: [null, null],
    fbo: [null, null],
    aw: 0,
    ah: 0,
    ai: 0,
    rgba: null,
    kind: 0,
  };
  gl.bindTexture(gl.TEXTURE_2D, S.tLUT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  /* cache-texture updates stream slab-wise into the BACK texture and
     flip when complete — no per-frame upload stall, no visible tear */
  function uploadC(CG) {
    S.pend = CG;
    S.upZ = 0;
  }
  function pumpUpload() {
    if (!S.pend) return;
    const [EX, EY, EZ] = S.dims,
      back = 1 - S.tci,
      zStep = Math.max(1, Math.ceil(EZ / 8)),
      z0 = S.upZ,
      z1 = Math.min(EZ, z0 + zStep),
      n = EX * EY * (z1 - z0);
    if (!S.rgba || S.rgba.length < n * 4) S.rgba = new Float32Array(n * 4);
    const R = S.rgba,
      CG = S.pend,
      base = EX * EY * z0;
    for (let i = 0; i < n; i++) {
      R[i * 4] = CG[(base + i) * 3];
      R[i * 4 + 1] = CG[(base + i) * 3 + 1];
      R[i * 4 + 2] = CG[(base + i) * 3 + 2];
      R[i * 4 + 3] = 1;
    }
    gl.bindTexture(gl.TEXTURE_3D, S.tCs[back]);
    gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, z0, EX, EY, z1 - z0, gl.RGBA, gl.FLOAT, R);
    S.upZ = z1;
    if (z1 >= EZ) {
      S.tci = back;
      S.pend = null;
    }
  }
  function accAlloc(w, h) {
    S.aw = w;
    S.ah = h;
    for (let i = 0; i < 2; i++) {
      if (S.acc[i]) for (const t of S.acc[i]) gl.deleteTexture(t);
      if (S.fbo[i]) gl.deleteFramebuffer(S.fbo[i]);
      /* two attachments per accumulation: R = raw, L = cache-terminated */
      const pair = [0, 1].map(() => {
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        /* fp32: a running mean in fp16 stalls past ~1000 spp (corrections
           drop below one ulp) and pixels random-walk — the long-hold
           "darker and blotchier over time" both panes showed */
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      });
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pair[0], 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, pair[1], 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      S.acc[i] = pair;
      S.fbo[i] = f;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  /* camera + field uniforms shared by the passes */
  function common(p, o) {
    gl.uniform3f(U(p, 'uEye'), o.eye[0], o.eye[1], o.eye[2]);
    gl.uniform3f(U(p, 'uFwd'), o.fwd[0], o.fwd[1], o.fwd[2]);
    gl.uniform3f(U(p, 'uRight'), o.rt[0], o.rt[1], o.rt[2]);
    gl.uniform3f(U(p, 'uUp'), o.up[0], o.up[1], o.up[2]);
    gl.uniform3f(U(p, 'uHe'), o.he[0], o.he[1], o.he[2]);
    gl.uniform3f(U(p, 'uCb0'), o.cb[0], o.cb[2], o.cb[4]);
    gl.uniform3f(U(p, 'uCb1'), o.cb[1], o.cb[3], o.cb[5]);
    gl.uniform1f(U(p, 'uF'), o.f);
  }
  function field(p, o) {
    gl.uniform1i(U(p, 'uKind'), S.kind);
    gl.uniform1f(U(p, 'uS'), o.S || 1);
    gl.uniform1f(U(p, 'uTf'), o.tf);
    gl.uniform1f(U(p, 'uInvG'), o.invG);
    gl.uniform1f(U(p, 'uKap'), o.kap || 0);
    gl.uniform2f(U(p, 'uWin'), o.win ? o.win[0] : 0, o.win ? o.win[1] : 1);
    gl.uniform1f(U(p, 'uWinId'), o.winId || 0);
    gl.uniform1f(U(p, 'uHasA'), o.hasA || 0);
    const Ls = o.lights || [];
    gl.uniform1f(U(p, 'uNL'), Ls.length);
    gl.uniform1f(U(p, 'uGs'), o.gs || 0.02);
    gl.uniform1f(U(p, 'uGk'), o.gk || 0.05);
    for (let l = 0; l < 3; l++) {
      const L = Ls[l] || [0, 0, 0, 0, 0, 0, 0];
      gl.uniform4f(U(p, 'uL' + l), L[0], L[1], L[2], L[3]);
      gl.uniform3f(U(p, 'uLC' + l), L[4], L[5], L[6]);
    }
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_3D, S.tD);
    gl.uniform1i(U(p, 'tD'), 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_3D, S.tA);
    gl.uniform1i(U(p, 'tA'), 3);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, S.tLUT);
    gl.uniform1i(U(p, 'tLUT'), 4);
  }

  return {
    cv,
    /* debug/gate: read one accumulation (0 = raw, 1 = cached) — the
       parity gate diffs them pixel-aligned on a frozen camera */
    readAcc(i) {
      const w = cv.width,
        h = cv.height,
        buf = new Float32Array(w * h * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, S.fbo[S.ai]);
      gl.readBuffer(gl.COLOR_ATTACHMENT0 + i);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, buf);
      gl.readBuffer(gl.COLOR_ATTACHMENT0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { w, h, buf };
    },
    /* per-dataset setup: cache-texture dims, the AO grid, and for the
       data volumes their scalar grid + a 256-entry scene-TF LUT */
    setVol(vol) {
      if (!S.dims || S.dims[0] !== vol.EX || S.dims[1] !== vol.EY || S.dims[2] !== vol.EZ) {
        S.dims = [vol.EX, vol.EY, vol.EZ];
        for (const t of S.tCs) {
          gl.bindTexture(gl.TEXTURE_3D, t);
          gl.texImage3D(
            gl.TEXTURE_3D,
            0,
            gl.RGBA16F,
            vol.EX,
            vol.EY,
            vol.EZ,
            0,
            gl.RGBA,
            gl.FLOAT,
            null,
          );
        }
        S.rgba = null;
        S.pend = null;
      }
      S.kind = vol.kind === 'butterfly' ? 0 : vol.kind === 'ring' ? 1 : 2;
      /* the light field is RGB (coloured scene lights); pad to RGBA */
      const n = vol.aoN,
        n3 = n * n * n,
        ao = new Float32Array(n3 * 4);
      for (let i = 0; i < n3; i++) {
        ao[i * 4] = vol.aoT[i * 3];
        ao[i * 4 + 1] = vol.aoT[i * 3 + 1];
        ao[i * 4 + 2] = vol.aoT[i * 3 + 2];
        ao[i * 4 + 3] = 1;
      }
      gl.bindTexture(gl.TEXTURE_3D, S.tA);
      gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA16F, n, n, n, 0, gl.RGBA, gl.FLOAT, ao);
      if (S.kind === 2) {
        /* RG: R = the scalar (colour lookup), G = alpha — pre-classified
           at full res when the vendor carries it, else from the LUT */
        const n2 = vol.dgU8.length,
          rg = new Uint8Array(n2 * 2);
        for (let i = 0; i < n2; i++) {
          rg[i * 2] = vol.dgU8[i];
          let a;
          if (vol.dgAU8) a = vol.dgAU8[i];
          else {
            const u = vol.dgU8[i] / 255,
              T = vol.T;
            let av = vol.lut1(u, T.ap, T.av);
            if (T.fl) av = Math.max(av, T.fl(u));
            a = Math.min(255, (av * 255 + 0.5) | 0);
          }
          rg[i * 2 + 1] = a;
        }
        gl.bindTexture(gl.TEXTURE_3D, S.tD);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage3D(
          gl.TEXTURE_3D,
          0,
          gl.RG8,
          vol.nx,
          vol.ny,
          vol.nz,
          0,
          gl.RG,
          gl.UNSIGNED_BYTE,
          rg,
        );
        const T = vol.T,
          lut = new Float32Array(256 * 4);
        for (let i = 0; i < 256; i++) {
          const u = i / 255,
            c = vol.lut3(u, T.cp, T.cc);
          let a = vol.lut1(u, T.ap, T.av);
          if (T.fl) a = Math.max(a, T.fl(u));
          lut[i * 4] = c[0];
          lut[i * 4 + 1] = c[1];
          lut[i * 4 + 2] = c[2];
          lut[i * 4 + 3] = a;
        }
        gl.bindTexture(gl.TEXTURE_2D, S.tLUT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 256, 1, 0, gl.RGBA, gl.FLOAT, lut);
      } else {
        /* keep the samplers valid for the analytic path */
        gl.bindTexture(gl.TEXTURE_3D, S.tD);
        gl.texImage3D(
          gl.TEXTURE_3D,
          0,
          gl.R8,
          1,
          1,
          1,
          0,
          gl.RED,
          gl.UNSIGNED_BYTE,
          new Uint8Array(1),
        );
        gl.bindTexture(gl.TEXTURE_2D, S.tLUT);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA16F,
          1,
          1,
          0,
          gl.RGBA,
          gl.FLOAT,
          new Float32Array(4),
        );
      }
      if (S.aw) {
        for (const f of S.fbo) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, f);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    },
    uploadC,
    draw(o) {
      pumpUpload();
      const w = Math.max(8, o.w | 0),
        h = Math.max(8, o.h | 0);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      if (S.aw !== w || S.ah !== h) accAlloc(w, h);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      const ni = 1 - S.ai;

      /* A: both estimators into the two progressive accumulations */
      gl.viewport(0, 0, w, h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, S.fbo[ni]);
      gl.useProgram(pA);
      common(pA, o);
      field(pA, o);
      gl.uniform2f(U(pA, 'uRes'), w, h);
      gl.uniform2f(U(pA, 'uOff'), 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_3D, S.tCs[S.tci]);
      gl.uniform1i(U(pA, 'tC'), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, S.acc[S.ai][0]);
      gl.uniform1i(U(pA, 'tPrevR'), 1);
      gl.activeTexture(gl.TEXTURE5);
      gl.bindTexture(gl.TEXTURE_2D, S.acc[S.ai][1]);
      gl.uniform1i(U(pA, 'tPrevL'), 5);
      gl.uniform1f(U(pA, 'uSeed'), o.seed % 997);
      gl.uniform1f(U(pA, 'uN'), Math.max(1, o.spp || 1));
      gl.uniform1f(U(pA, 'uCbr'), o.cbr);
      gl.uniform1f(U(pA, 'uTau'), 0.15);
      gl.uniform1f(U(pA, 'uFrame'), (o.seed | 0) % 24);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      /* B: the seam — tone the two accumulations */
      gl.useProgram(pB);
      gl.uniform2f(U(pB, 'uRes'), w, h);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, S.acc[ni][0]);
      gl.uniform1i(U(pB, 'tAccR'), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, S.acc[ni][1]);
      gl.uniform1i(U(pB, 'tAccL'), 1);
      gl.uniform1f(U(pB, 'uSu'), o.su);
      gl.uniform1f(U(pB, 'uExpo'), o.expo);
      gl.uniform1f(U(pB, 'uTone'), o.tone || 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      /* C: the reference inset — the truth field fully marched */
      if (o.inset) {
        const [ix, iy, iw2, ih2] = o.inset; /* device px, y from the top */
        const vy = h - iy - ih2;
        gl.viewport(ix, vy, iw2, ih2);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(ix, vy, iw2, ih2);
        gl.useProgram(pC);
        common(pC, o);
        field(pC, o);
        gl.uniform2f(U(pC, 'uRes'), iw2, ih2);
        gl.uniform2f(U(pC, 'uOff'), ix, vy);
        gl.uniform1f(U(pC, 'uExpo'), o.expo);
        gl.uniform1f(U(pC, 'uTone'), o.tone || 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disable(gl.SCISSOR_TEST);
      }
      S.ai = ni;
    },
  };
};
