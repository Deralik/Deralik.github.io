/* cINR figures — shared by mocks and (later) the skeleton port.
   window.CINR = { bunny, pipeline, cacheView, fpsPanel, rankPanel, DSN, T, DS, SZ }
   All colours read from the theme tokens at draw time; no literals except
   inside the bunny's shading ramp, which quotes k-figures.js geometry
   verbatim (owner 2026-08-15: copy K's motion; only the ground changed). */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CS = () => getComputedStyle(document.documentElement);
  const V = (n) => CS().getPropertyValue(n).trim();
  const paOf = (el) => {
    const v = getComputedStyle(el).getPropertyValue('--pa').trim();
    return v || V('--acc');
  };
  const RO = (el, fn) => {
    if (window.ResizeObserver) new ResizeObserver(() => fn()).observe(el);
  };
  const rgb = (n) => {
    const h = V(n).replace('#', '');
    const x =
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h;
    return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16));
  };

  /* ── the K bunny, verbatim behaviour: gentle sway, inertial drag ──────── */
  const N0 = 12,
    N1 = 24,
    N2 = 48,
    NS = [N0, N1, N2];
  const idx = (n, i, j, k) => (i * n + j) * n + k,
    cc = (n, i) => -1 + (2 * (i + 0.5)) / n;
  const L2 = (() => {
    const G = window.BUNNY_GRID;
    if (!G || G.n !== N2) {
      console.error('cinr-figs: bunny-grid.js missing');
      return null;
    }
    const bin = atob(G.b64),
      o = new Uint8Array(N2 * N2 * N2);
    for (let q = 0; q < o.length; q++) if (bin.charCodeAt(q >> 3) & (1 << (q & 7))) o[q] = 1;
    return o;
  })();
  let SH, CEN, RAD, L0g;
  if (L2) {
    const coarsen = (src, n) => {
      const m = n / 2,
        out = new Uint8Array(m * m * m);
      for (let i = 0; i < m; i++)
        for (let j = 0; j < m; j++)
          for (let k = 0; k < m; k++) {
            let v = 0;
            for (let a = 0; a < 2; a++)
              for (let b = 0; b < 2; b++)
                for (let c = 0; c < 2; c++) v |= src[idx(n, i * 2 + a, j * 2 + b, k * 2 + c)];
            out[idx(m, i, j, k)] = v;
          }
      return out;
    };
    const L1 = coarsen(L2, N2);
    L0g = coarsen(L1, N1);
    const inner = (o, n) => {
      const a = new Uint8Array(o.length);
      for (let i = 1; i < n - 1; i++)
        for (let j = 1; j < n - 1; j++)
          for (let k = 1; k < n - 1; k++) {
            if (!o[idx(n, i, j, k)]) continue;
            if (
              o[idx(n, i - 1, j, k)] &&
              o[idx(n, i + 1, j, k)] &&
              o[idx(n, i, j - 1, k)] &&
              o[idx(n, i, j + 1, k)] &&
              o[idx(n, i, j, k - 1)] &&
              o[idx(n, i, j, k + 1)]
            )
              a[idx(n, i, j, k)] = 1;
          }
      return a;
    };
    const crust = (o, n) => {
      const i2 = inner(inner(o, n), n),
        s = new Uint8Array(o.length);
      for (let q = 0; q < o.length; q++) s[q] = o[q] && !i2[q] ? 1 : 0;
      return s;
    };
    SH = [crust(L0g, N0), crust(L1, N1), crust(L2, N2)];
    let lo = [9, 9, 9],
      hi = [-9, -9, -9];
    for (let i = 0; i < N2; i++)
      for (let j = 0; j < N2; j++)
        for (let k = 0; k < N2; k++)
          if (L2[idx(N2, i, j, k)]) {
            const p = [cc(N2, i), cc(N2, j), cc(N2, k)],
              h = 1 / N2;
            for (let a = 0; a < 3; a++) {
              if (p[a] - h < lo[a]) lo[a] = p[a] - h;
              if (p[a] + h > hi[a]) hi[a] = p[a] + h;
            }
          }
    CEN = [0, 1, 2].map((a) => (lo[a] + hi[a]) / 2);
    RAD = 0.1;
    for (let i = 0; i < N2; i++)
      for (let j = 0; j < N2; j++)
        for (let k = 0; k < N2; k++)
          if (L2[idx(N2, i, j, k)]) {
            const x = cc(N2, i) - CEN[0],
              y = cc(N2, j) - CEN[1],
              z = cc(N2, k) - CEN[2];
            RAD = Math.max(RAD, Math.hypot(x, z) + 1 / N2, Math.abs(y) + 1 / N2);
          }
  }
  const VTX = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, -1, 1],
    [-1, -1, 1],
    [-1, 1, -1],
    [1, 1, -1],
    [1, 1, 1],
    [-1, 1, 1],
  ];
  const FACES = [
    [4, 5, 6, 7, 0, 1, 0],
    [0, 3, 2, 1, 0, -1, 0],
    [1, 2, 6, 5, 1, 0, 0],
    [0, 4, 7, 3, -1, 0, 0],
    [3, 7, 6, 2, 0, 0, 1],
    [0, 1, 5, 4, 0, 0, -1],
  ];
  const LIT = (() => {
    const l = [0.3, 0.88, 0.4],
      m = Math.hypot(...l);
    return l.map((v) => v / m);
  })();
  const CAMZ = 3.05,
    PITCH = 0.34,
    BASEYAW = 0.55;
  const mix = (a, b, t) =>
    `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
  const mix2 = (a, b, t) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];

  function bunny(cv, opts) {
    const emitOn = !!(opts && opts.onBricks);
    let emitTick = 0;
    /* 'card' (D0): fixed LoD, cache muted — the same render, settings locked.
     'demo': emission feeds the cache map, LoD control live. */
    let mode = (opts && opts.mode) || 'demo';
    if (!L2) return;
    /* focus rule: ONE bunny computes at a time — the last one touched
     (the demo slot by default: it feeds the cache map). Others freeze. */
    if (emitOn || !window.__cinrFocus) window.__cinrFocus = cv;
    cv.addEventListener('pointerenter', () => {
      window.__cinrFocus = cv;
    });
    let drewOnce = false;
    const ctx = cv.getContext('2d');
    const Z0 = (opts && opts.initZoom) || 1;
    const st = {
      drag: 0,
      dy: 0,
      zoom: Z0,
      zoomT: 0,
      lodBias: (opts && opts.initLod) || 0,
      down: false,
      px: 0,
      py: 0,
      rel: 0,
      last: 0,
      t0: performance.now(),
      vis: true,
    };
    let W = 0,
      H = 0,
      dpr = 1;
    function size() {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(devicePixelRatio || 1, 1.25);
      W = r.width;
      H =
        r.height; /* ponytail: 1.25 DPR cap — CPU march cost scales with pixels; raise if 2× displays warrant */
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* a buffer reset wipes the frame; repaint NOW — during depth morphs the
       slot resizes every frame, so this is what keeps the glide live-rendered */
      if (drewOnce)
        try {
          draw(performance.now());
        } catch (e) {}
    }
    /* debounced: during depth morphs the slot resizes every frame — refit
     once the box settles; mid-morph, CSS stretches the last buffer */
    const sizeSoon = () => {
      clearTimeout(st._szq);
      st._szq = setTimeout(size, 90);
    };
    size();
    addEventListener('resize', sizeSoon);
    RO(cv, sizeSoon);
    /* coarse pointers keep vertical page scroll; horizontal drag still turns */
    cv.style.touchAction = matchMedia('(pointer:coarse)').matches ? 'pan-y' : 'none';
    cv.style.cursor = 'grab';
    cv.addEventListener('pointercancel', () => {
      st.down = false;
    });
    cv.addEventListener('pointerdown', (e) => {
      st.down = true;
      st.zooming = e.button === 2;
      st.rel = 0;
      st.px = e.clientX;
      st.py = e.clientY;
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', (e) => {
      if (!st.down) return;
      if (st.zooming) {
        /* right-drag: up = closer, down = farther */
        st.zoom = Math.max(0.6, Math.min(2.2, st.zoom * Math.exp((st.py - e.clientY) * 0.006)));
        st.zoomT = performance.now();
      } else {
        st.drag += (e.clientX - st.px) * 0.008;
        st.dy = Math.max(-1.35, Math.min(0.85, st.dy + (e.clientY - st.py) * 0.006));
      }
      st.px = e.clientX;
      st.py = e.clientY;
    });
    const up = () => {
      if (st.down) {
        st.down = false;
        st.rel = performance.now();
      }
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    /* left-drag turns; right-drag zooms (wheel stays with the page);
     double-click resets pose+zoom. Zooming in refines bricks — the LoD
     bands follow the camera, so the cache fills with fine bricks. */
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    cv.addEventListener('dblclick', () => {
      st.zoom = Z0;
      st.drag = 0;
      st.dy = 0;
      st.zoomT = performance.now();
    });
    new IntersectionObserver(
      (es) => {
        st.vis = es[0].isIntersecting;
      },
      { rootMargin: '120px' },
    ).observe(cv);
    let tick = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (!W) size();
      if (opts && opts.onState) {
        const run =
          !RM && st.vis && !!W && !st.paused && !window.__morph && window.__cinrFocus === cv;
        if (run !== st.lastRun) {
          st.lastRun = run;
          try {
            opts.onState(run);
          } catch (e) {}
        }
      }
      if (!st.vis || !W) return;
      if (window.__morph && drewOnce) return; /* hold the frame; the morph stretches it */
      const focused = window.__cinrFocus === cv;
      if (st.paused && drewOnce && !st.down && now - st.zoomT > 400)
        return; /* Animation · off — direct drags still draw */
      if (RM && drewOnce && !st.down && now - st.zoomT > 400) return;
      if (!focused && drewOnce && !st.down) return; /* frozen frame */
      /* sway runs at half rate; dragging and inertial settle at full rate */
      const busy =
        st.down ||
        now - st.zoomT < 300 ||
        (st.rel && (Math.abs(st.drag) > 0.002 || Math.abs(st.dy) > 0.002));
      if (!busy && tick++ & 1) return;
      try {
        draw(now);
        drewOnce = true;
      } catch (e) {}
    }
    /* reusable buffers — no per-frame allocation */
    let buf = new Float64Array(0),
      ord = [],
      bn = 0;
    const FOGB = 12,
      shadeLUT = new Array(6 * (FOGB + 1));
    function draw(now) {
      const t = (now - st.t0) / 1000,
        dt = st.last ? Math.min(0.1, (now - st.last) / 1000) : 0.016;
      st.last = now;
      if (!st.down && st.rel && now - st.rel > 340 && (st.drag || st.dy)) {
        const k = Math.pow(0.05, dt);
        st.drag *= k;
        st.dy *= k;
        if (Math.abs(st.drag) < 0.002 && Math.abs(st.dy) < 0.002) {
          st.drag = 0;
          st.dy = 0;
          st.rel = 0;
        }
      }
      const yaw = BASEYAW + (RM ? 0 : 0.175 * Math.sin(t * 0.3)) + st.drag,
        pitch = PITCH + st.dy;
      const c = Math.cos(yaw),
        s = Math.sin(yaw),
        cp = Math.cos(pitch),
        sp = Math.sin(pitch);
      const rot = (x, y, z) => {
        const X = c * x + s * z,
          Zr = -s * x + c * z;
        return [X, cp * y - sp * Zr, sp * y + cp * Zr];
      };
      const scale = ((Math.min(0.42 * H, 0.44 * W) * (CAMZ - RAD)) / (1.9 * RAD)) * st.zoom,
        f = 1.9,
        cx = W / 2,
        cy = H / 2;
      const zk = (st.zoom - 1) * 0.5 + (mode === 'card' ? 0 : st.lodBias),
        CT2 = 0.32 - zk,
        CT1 = -0.28 - zk;
      ctx.clearRect(0, 0, W, H);
      const PAPER = rgb(mode === 'card' ? '--band1' : (opts && opts.ground) || '--paper'),
        INKC = rgb('--ink'),
        MID = rgb('--absence');
      const rn = FACES.map((F) => rot(F[4], F[5], F[6]));
      const rv = [0, 1, 2].map((L) => {
        const h = 1 / NS[L];
        return VTX.map((v) => rot(v[0] * h, v[1] * h, v[2] * h));
      });
      /* shade LUT: 6 faces × fog bands, built once per frame */
      for (let fi = 0; fi < 6; fi++) {
        const li =
          0.3 +
          0.62 * Math.max(0, rn[fi][0] * LIT[0] + rn[fi][1] * LIT[1] + rn[fi][2] * LIT[2]);
        const base = mix2(INKC, MID, li);
        for (let fb = 0; fb <= FOGB; fb++)
          shadeLUT[fi * (FOGB + 1) + fb] = mix(base, PAPER, (fb / FOGB) * 0.62);
      }
      /* gather visible bricks into the flat buffer: x,y,z,d,L,key stride 6 */
      let w = 0;
      const need = SH[2].length; /* upper bound is fine; grow once */
      if (buf.length < need * 6) buf = new Float64Array(need * 6);
      for (let i = 0; i < N0; i++)
        for (let j = 0; j < N0; j++)
          for (let k = 0; k < N0; k++) {
            if (!L0g[idx(N0, i, j, k)]) continue;
            const cz = rot(cc(N0, i) - CEN[0], cc(N0, j) - CEN[1], cc(N0, k) - CEN[2])[2];
            const L = cz > CT2 ? 2 : cz > CT1 ? 1 : 0,
              m = 1 << L,
              n = NS[L];
            for (let a2 = 0; a2 < m; a2++)
              for (let b2 = 0; b2 < m; b2++)
                for (let e = 0; e < m; e++) {
                  const I = i * m + a2,
                    J = j * m + b2,
                    K = k * m + e;
                  if (!SH[L][idx(n, I, J, K)]) continue;
                  const p = rot(cc(n, I) - CEN[0], cc(n, J) - CEN[1], cc(n, K) - CEN[2]);
                  const dd0 = CAMZ - p[2],
                    sxc = cx + ((f * p[0]) / dd0) * scale,
                    syc = cy - ((f * p[1]) / dd0) * scale;
                  if (sxc < -44 || sxc > W + 44 || syc < -44 || syc > H + 44)
                    continue; /* offscreen at this zoom */
                  buf[w] = p[0];
                  buf[w + 1] = p[1];
                  buf[w + 2] = p[2];
                  buf[w + 3] = CAMZ - p[2];
                  buf[w + 4] = L;
                  buf[w + 5] = emitOn ? ((L * 64 + I) * 64 + J) * 64 + K : 0;
                  w += 6;
                }
          }
      bn = w / 6;
      if (ord.length !== bn) {
        ord.length = bn;
        for (let q = 0; q < bn; q++) ord[q] = q * 6;
      } else for (let q = 0; q < bn; q++) ord[q] = q * 6;
      ord.sort((x, y) => buf[y + 3] - buf[x + 3]);
      if (emitOn && mode === 'demo' && (emitTick++ & 1) === 0) {
        const em = new Float64Array(bn * 3);
        let w2 = 0;
        for (let q = 0; q < bn; q++) {
          const o = ord[q];
          em[w2++] = buf[o + 5];
          em[w2++] = buf[o + 4];
          em[w2++] = buf[o + 3];
        }
        opts.onBricks(em);
      }
      const ACC =
        emitOn && mode === 'demo' && opts.fresh && opts.anyFresh && opts.anyFresh()
          ? paOf(cv)
          : null;
      for (let q = 0; q < bn; q++) {
        const o = ord[q],
          X = buf[o],
          Y = buf[o + 1],
          Z = buf[o + 2],
          d = buf[o + 3],
          L = buf[o + 4];
        const corners = rv[L];
        const fb = Math.max(0, Math.min(FOGB, Math.round((((d - 2.15) * 0.55) / 0.62) * FOGB)));
        const fr = ACC && opts.fresh(buf[o + 5]);
        for (let fi = 0; fi < 6; fi++) {
          if (rn[fi][2] <= 0.02) continue;
          ctx.fillStyle = shadeLUT[fi * (FOGB + 1) + fb];
          ctx.beginPath();
          for (let vi = 0; vi < 4; vi++) {
            const v2 = corners[FACES[fi][vi]],
              dd = CAMZ - (Z + v2[2]);
            const sx = cx + ((f * (X + v2[0])) / dd) * scale,
              sy = cy - ((f * (Y + v2[1])) / dd) * scale;
            vi ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
          if (fr) {
            ctx.strokeStyle = ACC;
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(frame);
    return {
      toggle() {
        st.paused = !st.paused;
        if (!st.paused) {
          st.last = 0;
          window.__cinrFocus = cv;
        }
        if (opts && opts.onState) opts.onState(!st.paused);
        return !st.paused;
      },
      setMode(m) {
        if (m !== mode) {
          mode = m;
          st.zoomT = performance.now();
        }
      },
      reset() {
        st.zoom = Z0;
        st.drag = 0;
        st.dy = 0;
        st.rel = 0;
        st.zoomT = performance.now();
      },
      setLod(b) {
        st.lodBias = b;
        st.zoomT = performance.now();
      },
      getView() {
        return { zoom: st.zoom, lod: st.lodBias };
      },
      running() {
        return !st.paused;
      },
    };
  }

  /* ── the method figure, abstract v3 (owner 2026-08-15): three washes —
      HPC (the dataset), async (handler + INR + the cache itself), the
      rendering loop (renderer + cache manager, its only interface to the
      cache). Data → INR runs along the bottom, broken by a small square:
      the compressed model — fully clear of the request handler. ──────── */
  function pipeline(cv) {
    const ctx = cv.getContext('2d');
    function draw() {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      /* the figure is authored in a fixed 1165-wide space; scale down to fit
       narrower docs so the rendering loop never clips away */
      const fig = Math.min(1, r.width / 1165);
      ctx.setTransform(dpr * fig, 0, 0, dpr * fig, 0, 0);
      const W = Math.max(r.width, 1165),
        H = r.height / fig,
        mono = V('--mono');
      const ink = V('--ink'),
        prose = V('--prose'),
        abs = V('--absence'),
        mat = V('--mat');
      ctx.clearRect(0, 0, W, H);
      ctx.font = '400 9.5px ' + mono;
      const T = (x, y, s, col, align) => {
        ctx.fillStyle = col;
        ctx.textAlign = align || 'center';
        ctx.fillText(s, x, y);
        ctx.textAlign = 'left';
      };
      const box = (x, y, w, h, title) => {
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x, y, w, h);
        ctx.lineWidth = 1;
        if (title) T(x + w / 2, y + h / 2 + 3.5, title, ink);
      };
      const seg = (x0, y0, x1, y1, dash) => {
        ctx.strokeStyle = abs;
        if (dash) ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
      };
      const circ = (x, y, n) => {
        ctx.font = '500 9.5px ' + mono;
        const w2 = ctx.measureText(n).width;
        ctx.fillStyle = V('--paper');
        ctx.fillRect(x - w2 / 2 - 5, y - 8, w2 + 10, 16);
        ctx.fillStyle = mat;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x - w2 / 2 - 5, y - 8, w2 + 10, 16);
        ctx.globalAlpha = 1;
        T(x, y + 3, n, prose);
        ctx.font = '400 9.5px ' + mono;
      };
      function arr(x0, y0, x1, y1, dash) {
        seg(x0, y0, x1, y1, dash);
        const a2 = Math.atan2(y1 - y0, x1 - x0);
        ctx.fillStyle = abs;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - 6 * Math.cos(a2 - 0.42), y1 - 6 * Math.sin(a2 - 0.42));
        ctx.lineTo(x1 - 6 * Math.cos(a2 + 0.42), y1 - 6 * Math.sin(a2 + 0.42));
        ctx.fill();
      }
      /* three washes, stepped values */
      ctx.fillStyle = mat;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(20, 46, 170, 200);
      ctx.globalAlpha = 1;
      ctx.fillStyle = V('--hair');
      ctx.globalAlpha = 0.8;
      ctx.fillRect(220, 46, 525, 200);
      ctx.globalAlpha = 1;
      ctx.fillStyle = V('--band1');
      ctx.fillRect(785, 82, 380, 118);
      ctx.font = '500 9.5px ' + mono;
      T(28, 60, 'HPC — IN SITU', abs, 'left');
      T(228, 60, 'ASYNC — IN THE BACKGROUND', abs, 'left');
      T(1160, 96, 'THE RENDERING LOOP — EVERY FRAME', abs, 'right');
      ctx.font = '400 9.5px ' + mono;
      /* the dataset, its own machine */
      const S = 96,
        vx = 48,
        vy = 84;
      ctx.fillStyle = mat;
      ctx.fillRect(vx, vy, S, S);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(vx, vy, S, S);
      ctx.lineWidth = 1;
      T(vx + S / 2, vy + S + 16, 'the dataset', prose);
      /* data → INR along the bottom, broken by the compressed model */
      seg(96, 206, 96, 224);
      seg(96, 224, 190, 224);
      ctx.fillStyle = ink;
      ctx.fillRect(196, 219, 10, 10);
      arr(212, 224, 234, 224);
      circ(146, 246, '1');
      /* async cluster: handler, INR, and the cache itself */
      box(240, 70, 170, 44, 'request handler');
      box(240, 186, 170, 46, 'INR — the model, resident');
      const cx2 = 550,
        cw = 180,
        sh2 = 26,
        ys = [78, 110, 142];
      const names = ['coarse', 'mid', 'fine'],
        divs = [3, 6, 12];
      ys.forEach((y, i) => {
        ctx.fillStyle = mat;
        ctx.globalAlpha = 0.75;
        ctx.fillRect(cx2, y, cw, sh2);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx2, y, cw, sh2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = abs;
        ctx.globalAlpha = 0.35;
        for (let t2 = 1; t2 < divs[i]; t2++) {
          const x = cx2 + (t2 / divs[i]) * cw;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + sh2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        T(cx2 + cw - 8, y + sh2 / 2 + 3.5, names[i], prose, 'right');
      });
      T(cx2 + cw / 2, 64, 'multi-resolution cache', prose);
      arr(566, 160, 566, 86);
      circ(530, 123, '3');
      /* async ring */
      arr(544, 91, 416, 91);
      circ(478, 91, '4');
      arr(325, 118, 325, 182);
      circ(325, 150, '5');
      seg(414, 209, 620, 209);
      arr(620, 209, 620, 172);
      circ(505, 209, '6');
      /* the rendering loop: renderer ⇄ cache manager ⇄ cache */
      box(805, 108, 150, 62, 'cache manager');
      box(1035, 108, 110, 62, 'renderer');
      arr(1029, 127, 961, 127);
      arr(961, 152, 1029, 152);
      circ(995, 140, '2');
      arr(799, 127, 736, 127);
      arr(736, 152, 799, 152);
      /* true miss — rare, dashed, renderer → INR direct */
      seg(1090, 174, 1090, 268, true);
      seg(1090, 268, 325, 268, true);
      arr(325, 268, 325, 238, true);
      circ(710, 268, '7');
    }
    draw();
    addEventListener('resize', draw);
    RO(cv, draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    return { redraw: draw };
  }

  /* ── the cache, seen: a front-view map of the volume; every resident
      brick a square at true relative size and position. Faithful to the
      mechanism: fixed capacity; the coarsest level preloads and stays
      (so every region always has a fallback → no true miss after
      preload); requested-but-missing bricks are ranked nearest-first and
      decoded a few per frame; eviction happens ONLY under capacity
      pressure — the least-recently-touched fine brick makes room.
      Browser cost: emits arrive at half frame rate as one flat array;
      ranking is a top-k pass, not a sort; the wanted queue is rebuilt
      from each emit (nothing stale accumulates); fresh-flash lookups
      short-circuit unless something landed in the last 350 ms. ───────── */
  function cacheView(cv) {
    const ctx = cv.getContext('2d');
    let ORDER = 'rank';
    const TOT = SH
      ? SH.map((s) => {
          let c = 0;
          for (let q = 0; q < s.length; q++) c += s[q];
          return c;
        })
      : [0, 0, 0];
    const PRE = [];
    if (SH) {
      const n = NS[0];
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
          for (let k = 0; k < n; k++)
            if (SH[0][(i * n + j) * n + k]) PRE.push((i * 64 + j) * 64 + k);
    }
    /* capacity: all of coarse + ~a third of the finer bricks — smaller than
     the scan, so pressure is real and eviction is visible */
    const TOTAL = TOT[0] + TOT[1] + TOT[2];
    let CAP = Math.max(PRE.length + 30, Math.round(0.45 * TOTAL));
    let preI = 0,
      lastInsert = -1e9,
      lastDraw = 0;
    const resident = new Map();
    let W = 0,
      H = 0,
      dpr = 1;
    function size() {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      const d2 = Math.min(devicePixelRatio || 1, 2);
      if (W === r.width && H === r.height && dpr === d2) return;
      dpr = d2;
      W = r.width;
      H = r.height;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now()); /* repaint immediately — no blank flash mid-morph */
    }
    size();
    addEventListener('resize', size);
    if (window.ResizeObserver) new ResizeObserver(size).observe(cv);
    function evictOne(now) {
      /* LRU among fine-then-mid; coarse never leaves.
      Admission rule: a brick touched this last second is still in view —
      not evictable. Returns false when nothing may leave, so a stable
      view stops all insert/evict churn (and its per-frame cost). */
      let bk = -1,
        bt = Infinity;
      for (const [k, v] of resident) {
        if (v.L === 0) continue;
        const t2 = v.last - (v.L === 2 ? 1e7 : 0);
        if (t2 < bt) {
          bt = t2;
          bk = k;
        }
      }
      if (bk < 0) return false;
      if (now - resident.get(bk).last < 1000) return false;
      resident.delete(bk);
      return true;
    }
    function feed(em) {
      if (!W) size();
      if (!W) return;
      const now = performance.now();
      /* touch residents; gather wanted-but-missing with a top-k pass */
      const K = RM ? 1e9 : 4;
      const top = [];
      for (let i = 0; i < em.length; i += 3) {
        const k = em[i],
          r = resident.get(k);
        if (r) {
          r.last = now;
          continue;
        }
        const L = em[i + 1],
          d = em[i + 2];
        /* rank: during preload coarser-first; after it, nearest to the eye
         wins outright — so fine visibly lands where the view looks.
         fifo: index order — the cache fills in sheets from one corner,
         the behaviour the scheduling fix replaced */
        const score = (preI < PRE.length ? L * 1e3 : 0) + (ORDER === 'rank' ? d : k * 1e-5);
        if (top.length < K) top.push({ k, L, score });
        else {
          let wi = 0;
          for (let t2 = 1; t2 < top.length; t2++) if (top[t2].score > top[wi].score) wi = t2;
          if (score < top[wi].score) top[wi] = { k, L, score };
        }
      }
      /* preload sweep: the coarsest level, first second */
      let preAdded = false;
      if (preI < PRE.length) {
        let m = RM ? PRE.length : Math.max(6, Math.ceil(PRE.length / 45));
        while (m-- > 0 && preI < PRE.length) {
          const k = PRE[preI++];
          if (!resident.has(k)) {
            resident.set(k, {
              L: 0,
              I: Math.floor(k / 4096) % 64,
              J: Math.floor(k / 64) % 64,
              t: now,
              last: now,
            });
            lastInsert = now;
            preAdded = true;
          }
        }
      }
      top.sort((x, y) => x.score - y.score);
      let changed = preAdded;
      for (const c of top) {
        if (resident.size >= CAP && !evictOne(now)) break;
        if (resident.size >= CAP) break;
        resident.set(c.k, {
          L: c.L,
          I: Math.floor(c.k / 4096) % 64,
          J: Math.floor(c.k / 64) % 64,
          t: now,
          last: now,
        });
        lastInsert = now;
        changed = true;
      }
      /* redraw only when residency changed or a flash is live */
      if (changed || now - lastInsert < 400 || now - lastDraw > 600) {
        lastDraw = now;
        draw(now);
      }
    }
    function draw(now) {
      const ink = V('--ink'),
        abs = V('--absence'),
        acc = paOf(cv),
        hair = V('--hair'),
        prose = V('--prose'),
        mono = V('--mono');
      ctx.clearRect(0, 0, W, H);
      ctx.font = '400 9.5px ' + mono;
      /* the map sizes to its box: square grows to 300; the occupancy bar
       moves below the square when the right side is too narrow for it */
      /* one column: square, occupancy bar under it, captions under that */
      const M = Math.min(300, H - 69, W - 14),
        x0 = Math.max(6, Math.round((W - M) / 2)),
        y0 = Math.max(6, (H - M - 55) / 2);
      ctx.strokeStyle = hair;
      ctx.strokeRect(x0 + 0.5, y0 + 0.5, M, M);
      const AL = [0.2, 0.42, 0.68],
        cnt = [0, 0, 0];
      const byL = [[], [], []];
      for (const v of resident.values()) {
        byL[v.L].push(v);
        cnt[v.L]++;
      }
      const freshOn = now - lastInsert < 350;
      for (let L = 0; L < 3; L++) {
        const n = NS[L],
          cs2 = M / n;
        for (const v of byL[L]) {
          const x = x0 + (v.I / n) * M,
            y = y0 + M - ((v.J + 1) / n) * M;
          ctx.fillStyle = ink;
          ctx.globalAlpha = AL[L];
          ctx.fillRect(x, y, cs2, cs2);
          ctx.globalAlpha = 1;
          if (freshOn && now - v.t < 350) {
            ctx.strokeStyle = acc;
            ctx.strokeRect(x + 0.5, y + 0.5, cs2 - 1, cs2 - 1);
          }
        }
      }
      const total = cnt[0] + cnt[1] + cnt[2];
      /* the caption block anchors independently of the centered square so
       long lines never clip: left-shift until the longest line fits */
      const cap =
        'coarse ' +
        cnt[0] +
        ' · mid ' +
        cnt[1] +
        ' · fine ' +
        cnt[2] +
        ' — ' +
        total +
        ' / ' +
        CAP +
        ' slots';
      const capW = ctx.measureText(cap).width;
      const bx = Math.max(6, Math.min(x0, W - 14 - capW)),
        bw = Math.min(M, W - bx - 14),
        by = y0 + M + 22,
        bh = 14;
      ctx.fillStyle = V('--mat');
      ctx.fillRect(bx, by, bw, bh);
      let fx = bx;
      for (let L = 0; L < 3; L++) {
        let w2 = total ? (cnt[L] / CAP) * bw : 0;
        if (fx + w2 > bx + bw) w2 = Math.max(0, bx + bw - fx);
        ctx.fillStyle = ink;
        ctx.globalAlpha = AL[L];
        ctx.fillRect(fx, by, w2, bh);
        ctx.globalAlpha = 1;
        fx += w2;
      }
      if (freshOn) {
        ctx.fillStyle = acc;
        ctx.fillRect(Math.max(bx, fx - 3), by, 3, bh);
      }
      ctx.fillStyle = prose;
      ctx.fillText('cache occupancy', bx, by - 9);
      ctx.fillStyle = abs;
      ctx.fillText(cap, bx, by + bh + 17);
    }
    return {
      feed,
      setCap(frac) {
        CAP = Math.max(PRE.length + 30, Math.round(frac * TOTAL));
        const now = performance.now();
        while (resident.size > CAP && evictOne(now));
        draw(now);
      },
      setOrder(o) {
        ORDER = o;
        resident.clear();
        preI = 0;
        lastInsert = performance.now();
        draw(lastInsert);
      },
      clear() {
        resident.clear();
        preI = 0;
        lastInsert = performance.now();
        draw(lastInsert);
      },
      anyFresh: () => performance.now() - lastInsert < 350,
      fresh: (k) => {
        const r = resident.get(k);
        return !!r && performance.now() - r.t < 350;
      },
    };
  }

  /* ── real per-run traces (cinr-trace.js, extracted from the paper's own
      figure exports): three shared-scale panels of average RM FPS over
      the first minute, and the priority-ranking on/off comparison. ──── */
  const DSN = {
    magnetic: 0,
    chameleon: 1,
    beechnut: 2,
    fialka: 3,
    flower: 4,
    heatrelease: 5,
    scrambler: 6,
    richtmyer: 7,
    miranda: 8,
  };
  function axPlot(cv, draw2) {
    const ctx = cv.getContext('2d');
    function draw() {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw2(ctx, r.width, r.height);
    }
    draw();
    addEventListener('resize', draw);
    if (window.ResizeObserver) new ResizeObserver(draw).observe(cv);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    return { redraw: draw };
  }
  function axes(ctx, W, H, ymax, yticks) {
    const mono = V('--mono'),
      ink = V('--ink'),
      hair = V('--hair'),
      abs = V('--absence');
    const padL = 34,
      padR = 8,
      padT = 10,
      padB = 22;
    const X = (t) => padL + (t / 67) * (W - padL - padR),
      Y = (v) => padT + (1 - v / ymax) * (H - padT - padB);
    ctx.font = '400 9.5px ' + mono;
    for (const v of yticks) {
      ctx.strokeStyle = v ? hair : ink;
      ctx.lineWidth = v ? 1 : 1.2;
      ctx.beginPath();
      ctx.moveTo(padL, Y(v) + 0.5);
      ctx.lineTo(W - padR, Y(v) + 0.5);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = abs;
      ctx.textAlign = 'right';
      ctx.fillText('' + v, padL - 5, Y(v) + 3);
      ctx.textAlign = 'left';
    }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(padL + 0.5, padT - 2);
    ctx.lineTo(padL + 0.5, Y(0) + 0.5);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = abs;
    ctx.fillText('FPS', 10, padT + 2);
    for (const t of [0, 20, 40, 60]) {
      ctx.textAlign = 'center';
      ctx.fillText('' + t, X(t), H - 8);
      ctx.textAlign = 'left';
    }
    ctx.fillText('sec', W - padR - 20, H - 8);
    return { X, Y };
  }
  function rankPanel(cv) {
    return axPlot(cv, (ctx, W, H) => {
      const TR = window.CINRTRACE;
      if (!TR || !TR.pri) return;
      let mx = 0;
      for (const nm in TR.pri) {
        if (nm === 't') continue;
        for (const k2 of ['on', 'off']) for (const v of TR.pri[nm][k2]) if (v > mx) mx = v;
      }
      const step = mx > 160 ? 100 : mx > 80 ? 50 : 20,
        ymax = mx * 1.15;
      const tk = [];
      for (let v = 0; v <= ymax; v += step) tk.push(v);
      const { X, Y } = axes(ctx, W, H, ymax, tk);
      const t = TR.pri.t;
      const trace = (v, close) => {
        for (let i = 0; i < t.length; i++) {
          const x = X(Math.max(0, t[i])),
            y = Y(Math.max(0, v[i]));
          i || close ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
      };
      for (const nm in TR.pri) {
        if (nm === 't') continue;
        const col = DS(DSN[nm]),
          on = TR.pri[nm].on,
          off = TR.pri[nm].off;
        /* the wash: the gap the ranking buys, filled faintly */
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.11;
        ctx.beginPath();
        trace(on, false);
        for (let i = t.length - 1; i >= 0; i--)
          ctx.lineTo(X(Math.max(0, t[i])), Y(Math.max(0, off[i])));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        trace(on, false);
        ctx.stroke();
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        trace(off, false);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }
  function fpsPanel(cv, key) {
    return axPlot(cv, (ctx, W, H) => {
      const TR = window.CINRTRACE;
      if (!TR) return;
      const { X, Y } = axes(ctx, W, H, 260, [0, 100, 200]);
      const t = TR.fps.t;
      for (const nm in DSN) {
        const v = TR.fps[key][nm];
        if (!v) continue;
        ctx.strokeStyle = DS(DSN[nm]);
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        for (let i = 0; i < t.length; i++) {
          const x = X(Math.max(0, t[i])),
            y = Y(Math.max(0, v[i]));
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    });
  }
  /* ── the general result: per-dataset gain, both modes, means derived ──── */
  const T = [
    ['Magnetic', 174.8, 36.3, 9.4, 5.5, [2048, 2048, 2048]],
    ['Chameleon', 212.3, 43.0, 20.6, 11.0, [2048, 2048, 2160]],
    ['Beechnut', 47.3, 9.5, 11.7, 5.3, [2048, 2048, 3092]],
    ['Fialka', 33.2, 6.6, 5.3, 2.5, [3272, 3786, 1986]],
    ['Flower', 56.4, 14.0, 1.7, 0.8, [3652, 3234, 3828]],
    ['Heatrelease', 79.9, 24.3, 4.6, 3.7, [4608, 1280, 3412]],
    ['Scrambler', 21.1, 3.3, 2.9, 1.2, [4354, 3870, 2612]],
    ['Richtmyer', 90.3, 21.9, 6.4, 2.1, [4096, 4096, 3840]],
    ['Miranda', 67.4, 17.9, 13.1, 8.9, [4096, 4096, 4096]],
    ['DNS', 91.8, 14.3, 20.5, 10.6, [10240, 7680, 1536]],
  ];
  /* bytes: float32 grids; DNS is the paper's double-precision case study */
  const SZ = (r, i) => {
    const b = r[5][0] * r[5][1] * r[5][2] * (r[0] === 'DNS' ? 8 : 4);
    return b >= 0.95e12 ? (b / 1e12).toFixed(2) + ' TB' : Math.round(b / 1e9) + ' GB';
  };
  const rm = T.map((r) => r[1] / r[2]),
    pt = T.map((r) => r[3] / r[4]);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const DS = (i) => {
    const g = (n) => parseFloat(V(n));
    const l = g('--ds-l') || 0.52,
      c = g('--ds-c') || 0.11,
      h0 = g('--ds-h0') || 20,
      hs = g('--ds-hstep') || 36;
    return 'oklch(' + l + ' ' + c + ' ' + ((i * hs + h0) % 360) + ')';
  };
  window.CINR = { bunny, pipeline, cacheView, fpsPanel, rankPanel, DSN, T, DS, SZ };
})();
