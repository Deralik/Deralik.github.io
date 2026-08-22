/* 7a — the hero. One integrator, one resolution, one fixed
   probe-calibrated exposure (the research renderer's display curve).
   Right of the seam: an unbiased 1-spp-per-frame estimate of the
   emission integral — accumulating while the view holds still and
   resetting with motion, the research renderer's own accumulation
   semantics; the noise is the estimator's variance. Left: a full march
   of the field the cache believes (its gaussians baked to a grid —
   never its splats) under one global cache-brightness scalar; the blur
   is its genuine residual, fading as it trains. The meter is
   render-space PSNR vs the fully-marched reference, on shared rays. */
(() => {
  const { fit, loop, tok, star } = GRT;
  const { Cam2 } = GRT2;
  const { RayAnim, CamView } = GRT6;
  const { NebVol, DataVol, GaiaVol, CField, Meter, frustum } = GRT7;
  const KO = {
    butterfly: {
      s0: 0.026,
      sv: 0.009,
      lsMin: -4.5,
      lsMax: -2.4,
      sMul: 0.85,
      relocLs: Math.log(0.03),
      ad: true,
    },
    ring: {
      s0: 0.026,
      sv: 0.009,
      lsMin: -4.5,
      lsMax: -2.4,
      sMul: 0.85,
      relocLs: Math.log(0.03),
      ad: true,
    },
    super: {
      s0: 0.026,
      sv: 0.009,
      lsMin: -4.5,
      lsMax: -2.5,
      sMul: 0.86,
      relocLs: Math.log(0.03),
      ad: true,
    },
    mech: {
      s0: 0.02,
      sv: 0.007,
      lsMin: -4.8,
      lsMax: -2.6,
      sMul: 0.82,
      relocLs: Math.log(0.024),
      ad: true,
    },
    crab: {
      s0: 0.038,
      sv: 0.014,
      lsMin: -4.0,
      lsMax: -1.8,
      sMul: 0.88,
      relocLs: Math.log(0.048),
    },
    bh: { s0: 0.024, sv: 0.009, lsMin: -4.6, lsMax: -2.5, sMul: 0.78, relocLs: Math.log(0.03) },
  };
  const NDEF = {
    butterfly: 12000,
    ring: 12000,
    super: 12000,
    mech: 13000,
    crab: 3000,
    bh: 4200,
  };
  class R7 {
    constructor(cv, o = {}) {
      this.cv = cv;
      this.o = o;
      this.az = 0.9;
      this.vols = {};
      this.cam = new Cam2(cv, 0.65, 0.28, 4.6);
      this.cam.auto = 0.12;
      this._img = null;
      this.now = 0;
      this.cam.gate = (e) => this.inImg(e);
      this.oa = 0.9;
      this.uY = 0;
      this.uP = 0;
      this.imgDrag = false;
      this.holdUntil = -9;
      this.su = 0.5;
      this.seamU = 0.5;
      this.seamUntil = -9;
      this.seamDrag = false;
      this.nzc = null;
      this.CG = null;
      this.view = new CamView(this.eyeAt(this.oa), 1.05);
      this.frameN = 0;
      this.meter = new Meter(150);
      this.field = null;
      this.ric = document.createElement('canvas');
      this.ric.width = 176;
      this.ric.height = 123;
      this.rig = this.ric.getContext('2d');
      this.rid = this.rig.createImageData(176, 123);
      this.rtl = new Float32Array(176 * 123 * 3);
      this.rcl = new Float32Array(176 * 123 * 3);
      this.retok();
      this.warm = GRT.figWarm;
      let px2, py2;
      cv.addEventListener('pointerdown', (e) => {
        if (this.nearSeam(e)) {
          this.seamDrag = true;
          cv.setPointerCapture(e.pointerId);
          return;
        }
        if (!this.inImg(e)) return;
        this.imgDrag = true;
        px2 = e.clientX;
        py2 = e.clientY;
        cv.setPointerCapture(e.pointerId);
        cv.style.cursor = 'grabbing';
      });
      cv.addEventListener('pointermove', (e) => {
        const b = cv.getBoundingClientRect(),
          mx = e.clientX - b.left;
        if (this.seamDrag) {
          const R = this._img;
          if (R) this.seamU = Math.max(0.15, Math.min(0.85, (mx - R[0]) / R[2]));
          this.seamUntil = this.now + 4;
          return;
        }
        if (this.imgDrag) {
          this.uY -= (e.clientX - px2) * 0.005;
          this.uP = Math.max(-1.05, Math.min(1.05, this.uP + (e.clientY - py2) * 0.004));
          px2 = e.clientX;
          py2 = e.clientY;
          return;
        }
        cv.style.cursor = this.nearSeam(e) ? 'col-resize' : 'grab';
      });
      const up = () => {
        if (this.seamDrag) {
          this.seamDrag = false;
          this.seamUntil = this.now + 4;
        }
        if (this.imgDrag) {
          this.imgDrag = false;
          this.holdUntil = this.now + 1.0;
          this.cv.style.cursor = 'grab';
        }
      };
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
      this.setVol('butterfly');
      loop(cv, (t, dt) => this.frame(t, dt));
    }
    inImg(e) {
      const b = this.cv.getBoundingClientRect(),
        mx = e.clientX - b.left,
        my = e.clientY - b.top,
        R = this._img;
      return !!(R && mx >= R[0] && mx <= R[0] + R[2] && my >= R[1] && my <= R[1] + R[3]);
    }
    nearSeam(e) {
      const b = this.cv.getBoundingClientRect(),
        mx = e.clientX - b.left,
        my = e.clientY - b.top,
        R = this._img;
      return !!(
        R &&
        my >= R[1] &&
        my <= R[1] + R[3] &&
        Math.abs(mx - (R[0] + this.su * R[2])) < 12
      );
    }
    eyeAt(a, p) {
      p = p || 0;
      const R = (this.vol && this.vol.orb) || 2.1,
        hr = Math.cos(p);
      return [
        R * hr * Math.cos(a),
        0.5 + 0.28 * Math.sin(0.6 * a) + R * Math.sin(p),
        R * hr * Math.sin(a),
      ];
    }
    eyeCur() {
      return this.eyeAt(this.oa + this.uY, this.uP);
    }
    setLight() {
      this.vol.light = [1.3 * Math.cos(this.az), 1.05, 1.3 * Math.sin(this.az)];
    }
    setVol(kind) {
      this.kind = kind;
      this.field = null;
      this.vol =
        this.vols[kind] ||
        (this.vols[kind] =
          kind === 'super' && window.GRT_SUPERNOVA
            ? new DataVol('super', 33, window.GRT_SUPERNOVA)
            : kind === 'mech' && window.GRT_MECHHAND
              ? new DataVol('mech', 33, window.GRT_MECHHAND)
              : window.GRTNEB && window.GRTNEB[kind]
                ? new GaiaVol(kind, 33)
                : new NebVol(kind, 33));
      if (this.vol.em < 0.99) this.setLight();
      this.vol.rebuild();
      const n = NDEF[kind];
      if (this.o.nEl) this.o.nEl.value = n;
      this.st = this.vol.stipple(520);
      this.field = new CField(this.vol, n, 9, KO[kind]);
      this.anim = new RayAnim(this.vol, this.field, 83);
      this.anim.eyeRef = () => this.eyeCur();
      if (this.o.azl)
        this.o.azl.textContent = this.vol.em >= 0.99 ? 'Transfer function' : 'Light azimuth';
      if (this.acc) this.acc.fill(0);
      const R3 = this.vol.EX * this.vol.EY * this.vol.EZ * 3;
      if (!this.CG || this.CG.length !== R3) {
        this.CG = new Float32Array(R3);
        this.CGb = new Float32Array(R3);
      }
      this.field.bakeTo(this.CG, this.vol);
      this._bkPh = 0;
      this.gtDirty = false;
      this.cbr = 1;
      this._spp = 1;
      this._ps = undefined;
      this.meter.hist = [];
    }
    /* reset must re-seed the cache pane too, or the sliced bake mixes old
   and new gaussians for a few frames */
    resetField() {
      this.field.alloc(this.field.N);
      this.field.bakeTo(this.CG, this.vol);
      this._bkPh = 0;
    }
    retok() {
      this.cw = tok('--well');
      this.cab = tok('--absence');
      this.conw = tok('--onwell');
      this.mono = tok('--mono');
    }
    march(iw, ih, t) {
      /* ONE resolution, ONE integrator, ONE exposure for both panes.
   Right: a real 1-spp/frame estimate of the emission integral, accumulated
   in LINEAR radiance, toned at display with the research renderer's curve
   1-exp(-e·L) at the volume's fixed probe exposure. Left: the same march
   over the CACHE'S FIELD (gaussians baked to a grid) — a render of what
   the cache believes, never its splats. The visible differences are
   genuine: estimator variance right, the cache's residual left. */
      const RW = this.RW || (this.RW = 176),
        RH = Math.max(24, Math.round((RW * ih) / iw));
      if (!this.nzc || this.nzW !== RW || this.nzH !== RH) {
        this.nzW = RW;
        this.nzH = RH;
        this.nzc = document.createElement('canvas');
        this.nzc.width = RW;
        this.nzc.height = RH;
        this.nzg = this.nzc.getContext('2d');
        this.nzd = this.nzg.createImageData(RW, RH);
        this.czc = document.createElement('canvas');
        this.czc.width = RW;
        this.czc.height = RH;
        this.czg = this.czc.getContext('2d');
        this.czd = this.czg.createImageData(RW, RH);
        this.acc = new Float32Array(RW * RH * 3);
      }
      const v = this.vol,
        E = v.grid,
        C = this.CG,
        expo = v.expo;
      const EX = v.EX,
        EY = v.EY,
        EZ = v.EZ,
        hx = v.he[0],
        hy = v.he[1],
        hz = v.he[2];
      const kx = (0.5 * EX) / hx,
        ky = (0.5 * EY) / hy,
        kz = (0.5 * EZ) / hz,
        X1 = EX - 1,
        Y1 = EY - 1,
        Z1 = EZ - 1;
      const cb = v.cb || [-hx, hx, -hy, hy, -hz, hz],
        L0 = cb[0],
        L1 = cb[1],
        P0 = cb[2],
        P1 = cb[3],
        N0 = cb[4],
        N1 = cb[5];
      const f = this.view.f,
        e = this.view.eye,
        fw = this.view.fwd,
        rt = this.view.right,
        up = this.view.up;
      const D = this.nzd.data,
        A = this.acc,
        D2 = this.czd.data,
        M = 16,
        cbr = this.cbr || 1,
        spp = this._spp || 1;
      /* the research renderer's display curve: 1-exp(-exposure·L), no gamma */
      const tone = (r, g, b, out, q) => {
        out[q] = 10 + 245 * (1 - Math.exp(-expo * Math.max(0, r)));
        out[q + 1] = 13 + 242 * (1 - Math.exp(-expo * Math.max(0, g)));
        out[q + 2] = 17 + 238 * (1 - Math.exp(-expo * Math.max(0, b)));
        out[q + 3] = 255;
      };
      for (let j2 = 0; j2 < RH; j2++) {
        const vy = (ih / 2 - ((j2 + 0.5) / RH) * ih) / (ih * f);
        for (let i2 = 0; i2 < RW; i2++) {
          const vx = (((i2 + 0.5) / RW) * iw - iw / 2) / (ih * f);
          let dx = fw[0] + vx * rt[0] + vy * up[0],
            dy = fw[1] + vx * rt[1] + vy * up[1],
            dz = fw[2] + vx * rt[2] + vy * up[2];
          const nn = 1 / Math.hypot(dx, dy, dz);
          dx *= nn;
          dy *= nn;
          dz *= nn;
          /* clip to the data's content box — every step lands in content */
          const ax = (L0 - e[0]) / dx,
            bx2 = (L1 - e[0]) / dx,
            ay = (P0 - e[1]) / dy,
            by = (P1 - e[1]) / dy,
            az = (N0 - e[2]) / dz,
            bz = (N1 - e[2]) / dz;
          const t0 = Math.max(Math.min(ax, bx2), Math.min(ay, by), Math.min(az, bz), 0);
          const t1 = Math.min(Math.max(ax, bx2), Math.max(ay, by), Math.max(az, bz));
          const o = (j2 * RW + i2) * 3,
            q = (j2 * RW + i2) * 4;
          let er = 0,
            eg = 0,
            eb = 0,
            ar = 0,
            ag = 0,
            ab = 0;
          if (t1 > t0) {
            const dt = (t1 - t0) / M;
            /* right: one jittered stratified sample — unbiased, real variance */
            const tt = t0 + ((Math.random() * M) | 0) * dt + Math.random() * dt;
            const p0 = e[0] + dx * tt,
              p1 = e[1] + dy * tt,
              p2 = e[2] + dz * tt;
            {
              const i3 = Math.max(0, Math.min(X1, ((p0 + hx) * kx) | 0)),
                j3 = Math.max(0, Math.min(Y1, ((p1 + hy) * ky) | 0)),
                k3 = Math.max(0, Math.min(Z1, ((p2 + hz) * kz) | 0));
              const o2 = ((k3 * EY + j3) * EX + i3) * 3,
                w = dt * M;
              er = E[o2] * w;
              eg = E[o2 + 1] * w;
              eb = E[o2 + 2] * w;
            }
            /* left: full march of the cache's field */
            for (let k = 0; k < M; k++) {
              const tk = t0 + (k + 0.5) * dt,
                x = e[0] + dx * tk,
                y = e[1] + dy * tk,
                z = e[2] + dz * tk;
              const i3 = Math.max(0, Math.min(X1, ((x + hx) * kx) | 0)),
                j3 = Math.max(0, Math.min(Y1, ((y + hy) * ky) | 0)),
                k3 = Math.max(0, Math.min(Z1, ((z + hz) * kz) | 0));
              const o3 = ((k3 * EY + j3) * EX + i3) * 3;
              ar += C[o3] * dt;
              ag += C[o3 + 1] * dt;
              ab += C[o3 + 2] * dt;
            }
          }
          A[o] += (er - A[o]) / spp;
          A[o + 1] += (eg - A[o + 1]) / spp;
          A[o + 2] += (eb - A[o + 2]) / spp;
          tone(A[o], A[o + 1], A[o + 2], D, q);
          tone(ar * cbr, ag * cbr, ab * cbr, D2, q);
        }
      }
      this.nzg.putImageData(this.nzd, 0, 0);
      this.czg.putImageData(this.czd, 0, 0);
    }
    /* reference inset + render-space PSNR + the cache-brightness scalar —
   shared by the GL and CPU pane paths */
    insetTick() {
      /* CPU-path display inset: the truth grid, fully marched (the GL
         path draws its own continuous inset in pass C) */
      if (!this.glr && this.frameN % 4 === 0)
        this.insetMarch(this.vol.grid, this.rtl, this.rid);
      /* render-space PSNR: cache march vs truth march, linear, same rays,
         one shared camera — grid vs grid on both paths */
      if (this.frameN % 24 === 8) {
        if (this.glr) this.insetMarch(this.vol.grid, this.rtl, null);
        this.insetMarch(this.CG, this.rcl, null);
        const T = this.rtl,
          Q = this.rcl;
        let st = 0,
          sc = 0;
        for (let k = 0; k < T.length; k++) {
          st += T[k];
          sc += Q[k];
        }
        /* the research renderer's own cache-brightness control, measured live:
   ONE global scalar matching the cache march to the reference march */
        this.cbr =
          this.cbr * 0.85 + 0.15 * Math.max(0.5, Math.min(2.2, st / Math.max(sc, 1e-6)));
        let se = 0;
        for (let k = 0; k < T.length; k++) {
          const d = T[k] - Q[k] * this.cbr;
          se += d * d;
        }
        const ps = 10 * Math.log10(1 / Math.max(1e-6, se / T.length));
        this._ps = this._ps === undefined ? ps : this._ps * 0.8 + 0.2 * ps;
        this.meter.push(this._ps);
      }
    }
    insetMarch(GR, lin, img) {
      const W = 176,
        H = 123,
        v = this.vol,
        expo = v.expo,
        M = 22;
      const EX = v.EX,
        EY = v.EY,
        EZ = v.EZ,
        hx = v.he[0],
        hy = v.he[1],
        hz = v.he[2];
      const kx = (0.5 * EX) / hx,
        ky = (0.5 * EY) / hy,
        kz = (0.5 * EZ) / hz,
        X1 = EX - 1,
        Y1 = EY - 1,
        Z1 = EZ - 1;
      const cb = v.cb || [-hx, hx, -hy, hy, -hz, hz],
        L0 = cb[0],
        L1 = cb[1],
        P0 = cb[2],
        P1 = cb[3],
        N0 = cb[4],
        N1 = cb[5];
      const f = this.view.f,
        e = this.view.eye,
        fw = this.view.fwd,
        rt = this.view.right,
        up = this.view.up;
      const data = img ? img.data : null;
      for (let j2 = 0; j2 < H; j2++) {
        const vy = (H / 2 - (j2 + 0.5)) / (H * f);
        for (let i2 = 0; i2 < W; i2++) {
          const vx = (i2 + 0.5 - W / 2) / (H * f);
          let dx = fw[0] + vx * rt[0] + vy * up[0],
            dy = fw[1] + vx * rt[1] + vy * up[1],
            dz = fw[2] + vx * rt[2] + vy * up[2];
          const nn = 1 / Math.hypot(dx, dy, dz);
          dx *= nn;
          dy *= nn;
          dz *= nn;
          const ax = (L0 - e[0]) / dx,
            bx2 = (L1 - e[0]) / dx,
            ay = (P0 - e[1]) / dy,
            by = (P1 - e[1]) / dy,
            az = (N0 - e[2]) / dz,
            bz = (N1 - e[2]) / dz;
          const t0 = Math.max(Math.min(ax, bx2), Math.min(ay, by), Math.min(az, bz), 0);
          const t1 = Math.min(Math.max(ax, bx2), Math.max(ay, by), Math.max(az, bz));
          let ar = 0,
            ag = 0,
            ab = 0;
          if (t1 > t0) {
            const dt = (t1 - t0) / M;
            for (let k = 0; k < M; k++) {
              const tk = t0 + (k + 0.5) * dt,
                x = e[0] + dx * tk,
                y = e[1] + dy * tk,
                z = e[2] + dz * tk;
              const i3 = Math.max(0, Math.min(X1, ((x + hx) * kx) | 0)),
                j3 = Math.max(0, Math.min(Y1, ((y + hy) * ky) | 0)),
                k3 = Math.max(0, Math.min(Z1, ((z + hz) * kz) | 0));
              const o3 = ((k3 * EY + j3) * EX + i3) * 3;
              ar += GR[o3] * dt;
              ag += GR[o3 + 1] * dt;
              ab += GR[o3 + 2] * dt;
            }
          }
          const o = (j2 * W + i2) * 3;
          lin[o] = ar;
          lin[o + 1] = ag;
          lin[o + 2] = ab;
          if (data) {
            const q = (j2 * W + i2) * 4;
            data[q] = 10 + 245 * (1 - Math.exp(-expo * Math.max(0, ar)));
            data[q + 1] = 13 + 242 * (1 - Math.exp(-expo * Math.max(0, ag)));
            data[q + 2] = 17 + 238 * (1 - Math.exp(-expo * Math.max(0, ab)));
            data[q + 3] = 255;
          }
        }
      }
      if (img) this.rig.putImageData(img, 0, 0);
    }
    frame(t, dt) {
      const f = fit(this.cv);
      if (!f) return;
      this.retok();
      const { g, w, h } = f;
      this.frameN++;
      this.now = t;
      const F = this.field;
      g.fillStyle = this.cw;
      g.fillRect(0, 0, w, h);
      if (!F) return;
      if (!this.cam.dr) this.cam.auto += (0.12 - this.cam.auto) * Math.min(1, dt * 1.2);
      this.cam.step(dt);
      const B = 120;
      F.step(B, t);
      if (dt < 0.022) F.step(B, t);
      /* cache pane source: sliced re-bake, 1/10 of the gaussians per frame,
   swapped in whole — the pane lags training by ≤10 frames, never tears */
      {
        const NB = Math.ceil(F.N / 10),
          ph = this._bkPh | 0;
        if (ph === 0) this.CGb.fill(0);
        F.bakeSlice(this.CGb, this.vol, ph * NB, Math.min(F.N, (ph + 1) * NB));
        if (ph === 9) {
          const t2 = this.CG;
          this.CG = this.CGb;
          this.CGb = t2;
          this._bkPh = 0;
          this._bkN = (this._bkN | 0) + 1;
        } else this._bkPh = ph + 1;
      }
      if (this.pendingAz !== undefined) {
        const v2 = this.pendingAz;
        this.pendingAz = undefined;
        if (this.vol.tfr !== false) {
          if (this.vol.em >= 0.99) this.vol.tf = v2 / 6.28;
          else {
            this.az = v2;
            this.setLight();
          }
          this.gtDirty = true;
          this._azT = t;
        }
      }
      /* rebuild is ~75ms — fire once the slider rests, not while it moves */
      if (this.gtDirty && t - (this._azT || 0) > 0.25) {
        this.vol.rebuild();
        F.refreshTruth();
        this.gtDirty = false;
        this._glVol = null;
        this._spp = 1;
      }
      if (this.frameN % 60 === 0) F.refreshTruth();
      const held = this.imgDrag || t < this.holdUntil,
        off = Math.abs(this.uY) + Math.abs(this.uP) > 0.012;
      if (!held) {
        if (off) {
          const k = Math.exp(-2.4 * dt);
          this.uY *= k;
          this.uP *= k;
        } else {
          this.uY = this.uP = 0;
          this.oa += dt * 0.06;
        }
      }
      const eye = this.eyeCur();
      this.view.setEye(eye);
      /* the estimator accumulates only while the view holds still and resets
   with motion — the research renderer's frame-accumulation semantics */
      {
        const em2 = this._lastEye,
          mv =
            !em2 ||
            Math.abs(eye[0] - em2[0]) + Math.abs(eye[1] - em2[1]) + Math.abs(eye[2] - em2[2]) >
              1e-5;
        this._lastEye = eye;
        this._spp = mv ? 1 : Math.min(4096, (this._spp || 0) + 1);
      }
      this.anim.maybeFire(t, eye);
      this.anim.update(t);
      this.su =
        this.seamDrag || t < this.seamUntil ? this.seamU : 0.5 + 0.33 * Math.sin(t * 0.22);
      /* ≤560px: mobile is its own layout — render above, world below, meter last —
   never a squeezed desktop */
      const stack = w < 560;
      let x0, y0, iw, ih, rx, rw, wy, wh;
      if (stack) {
        x0 = 8;
        y0 = 10;
        iw = w - 16;
        ih = Math.round(h * 0.42);
        rx = 4;
        rw = w - 8;
        wy = y0 + ih + 26;
        wh = h - wy - 88;
      } else {
        const split = w * 0.55;
        x0 = 12;
        y0 = 12;
        iw = split - 24;
        ih = h - 46;
        rx = split + 6;
        rw = w - rx - 6;
        wy = 0;
        wh = h - 130;
      }
      this._img = [x0, y0, iw, ih];
      const bx = x0 + this.su * iw;
      /* panes: GPU when WebGL2+float buffers exist — full pane resolution,
   trilinear grids, same two integrals; else the CPU march */
      if (!this._glT) {
        this._glT = 1;
        try {
          this.glr = window.GRT7GL ? window.GRT7GL() : null;
        } catch (e) {
          this.glr = null;
        }
      }
      g.imageSmoothingEnabled = true;
      if (this.glr) {
        if (this._glVol !== this.vol) {
          this.glr.setVol(this.vol);
          this._glVol = this.vol;
          this._glCB = -1;
        }
        if (this._glCB !== (this._bkN | 0)) {
          this.glr.uploadC(this.CG);
          this._glCB = this._bkN | 0;
        }
        const dpr = Math.min(1.25, window.devicePixelRatio || 1);
        this.glr.draw({
          w: iw * dpr,
          h: ih * dpr,
          eye: this.view.eye,
          fwd: this.view.fwd,
          rt: this.view.right,
          up: this.view.up,
          f: this.view.f,
          he: this.vol.he,
          cb: this.vol.cb || [-1, 1, -1, 1, -1, 1],
          su: this.su,
          seed: this.frameN,
          cbr: this.cbr || 1,
          expo: this.vol.expo,
          spp: this._spp,
          S: this.vol.S || 1,
          tf: this.vol.tf,
          invG: 1 / (this.vol.gmax || 1),
          inset: (() => {
            const iv2 = w < 560 ? [104, 74] : [176, 123];
            return [
              Math.round((iw - iv2[0] - 12) * dpr),
              Math.round(10 * dpr),
              Math.round(iv2[0] * dpr),
              Math.round(iv2[1] * dpr),
            ];
          })(),
        });
        /* zero-copy: the GL canvas sits UNDER this one as a positioned layer;
   this canvas clears a window over the pane and draws the UI on top
   (blitting a WebGL canvas through 2d stalls the GPU) */
        const gc = this.glr.cv;
        if (!gc.parentNode) {
          const par = this.cv.parentElement;
          if (par) {
            if (!par.style.position) par.style.position = 'relative';
            gc.style.position = 'absolute';
            gc.style.pointerEvents = 'none';
            gc.style.zIndex = '0';
            this.cv.style.position = 'relative';
            this.cv.style.zIndex = '1';
            par.insertBefore(gc, this.cv);
          }
        }
        const st2 = x0 + 'px|' + y0 + 'px|' + iw + 'px|' + ih + 'px';
        if (this._glSt !== st2) {
          this._glSt = st2;
          gc.style.left = x0 + 'px';
          gc.style.top = y0 + 'px';
          gc.style.width = iw + 'px';
          gc.style.height = ih + 'px';
        }
        g.clearRect(x0, y0, iw, ih);
      } else {
        this.march(iw, ih, t);
        g.save();
        g.beginPath();
        g.rect(bx, y0, x0 + iw - bx, ih);
        g.clip();
        g.drawImage(this.nzc, x0, y0, iw, ih);
        g.restore();
        g.save();
        g.beginPath();
        g.rect(x0, y0, bx - x0, ih);
        g.clip();
        g.drawImage(this.czc, x0, y0, iw, ih);
        g.restore();
      }
      this.insetTick();
      g.strokeStyle = GRT.alpha(GRT.figPaper, 0.65);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(bx + 0.5, y0);
      g.lineTo(bx + 0.5, y0 + ih);
      g.stroke();
      g.fillStyle = GRT.alpha(GRT.figPaper, 0.65);
      g.fillRect(bx - 4, y0 + ih / 2 - 9, 9, 18);
      g.fillStyle = GRT.figWell;
      g.fillRect(bx - 1.5, y0 + ih / 2 - 5, 1, 10);
      g.fillRect(bx + 1.5, y0 + ih / 2 - 5, 1, 10);
      g.strokeStyle = GRT.alpha(GRT.figPaper, 0.25);
      g.strokeRect(x0 + 0.5, y0 + 0.5, iw - 1, ih - 1);
      const iv = stack ? [104, 74] : [176, 123];
      /* GL path renders the inset itself (pass C, through the cleared
         window); the CPU path blits its grid march */
      if (!this.glr) g.drawImage(this.ric, x0 + iw - iv[0] - 12, y0 + 10, iv[0], iv[1]);
      g.strokeRect(x0 + iw - iv[0] - 12.5, y0 + 9.5, iv[0] + 1, iv[1] + 1);
      g.fillStyle = this.cab;
      g.font = '500 8.5px ' + this.mono;
      g.fillText(
        GRT.elide(g, 'REFERENCE — FULL MARCH', iv[0] + 10),
        x0 + iw - iv[0] - 12,
        y0 + iv[1] + 23,
      );
      g.fillText(
        this.imgDrag
          ? 'CAMERA — IN YOUR HAND'
          : held || off
            ? 'CAMERA — RETURNING TO ORBIT'
            : 'CAMERA — ORBITING',
        x0 + 8,
        y0 + 16,
      );
      g.fillText(
        GRT.elide(
          g,
          stack
            ? 'WITH THE CACHE — NOISE-FREE'
            : 'WITH THE CACHE — RAYS END IN ITS FIELD, NOISE-FREE',
          iw * 0.48,
        ),
        x0 + 8,
        y0 + ih - 10,
      );
      const wl = GRT.elide(
        g,
        stack
          ? 'WITHOUT — 1 SPP'
          : 'WITHOUT — 1 SPP/FRAME · ' +
              (this._spp > 1 ? this._spp + ' HELD' : 'RESETS WITH MOTION'),
        iw * 0.48,
      );
      g.fillText(wl, x0 + iw - 8 - g.measureText(wl).width, y0 + ih - 10);
      g.fillText(
        GRT.elide(
          g,
          'THE RENDER — DRAG THE SEAM TO COMPARE · DRAG ELSEWHERE TO MOVE THE CAMERA',
          iw,
        ),
        x0,
        y0 + ih + 14,
      );
      const pr = this.cam.proj(),
        S = Math.min(rw, wh) * 0.6,
        cx = rx + rw / 2,
        cy = wy + wh * 0.52,
        px = (p) => {
          const q = pr(p);
          return [cx + q[0] * S, cy - q[1] * S, q[2]];
        };
      g.save();
      g.beginPath();
      g.rect(rx, wy, rw, wh);
      g.clip();
      /* heavy static layer (stars, splat cloud) at 30Hz; live parts 60 */
      const rwi = Math.max(1, rw | 0),
        whi = Math.max(1, wh | 0);
      if (!this.wlc || this.wlc.width !== rwi || this.wlc.height !== whi) {
        this.wlc = document.createElement('canvas');
        this.wlc.width = rwi;
        this.wlc.height = whi;
        this.wlg = this.wlc.getContext('2d');
        this._wl = 0;
      }
      if (this.frameN & 1 || !this._wl) {
        const wg = this.wlg,
          pxL = (p) => {
            const q = pr(p);
            return [cx - rx + q[0] * S, cy - wy - q[1] * S, q[2]];
          };
        wg.clearRect(0, 0, rwi, whi);
        for (const s of this.st) {
          const p = pxL(s);
          wg.globalAlpha = 0.04 + 0.1 * s[3];
          wg.fillStyle = GRT.figPaper;
          wg.fillRect(p[0], p[1], 1.3, 1.3);
        }
        wg.globalAlpha = 1;
        F.draw(wg, pxL, S, t);
        this._wl = 1;
      }
      g.drawImage(this.wlc, rx, wy);
      this.anim.draw(g, px, S, t, false, this.conw, this.warm, 'TRAINING RAY');
      if (this.vol.em < 0.99) {
        this.anim.drawNees(g, px, this.vol.light, t, this.warm);
        const lp = px(this.vol.light);
        star(g, lp[0], lp[1], 6, this.warm);
      }
      const ep = px(eye);
      g.strokeStyle = this.conw;
      g.lineWidth = 1.2;
      g.strokeRect(ep[0] - 4, ep[1] - 4, 8, 8);
      frustum(
        g,
        px,
        eye,
        this.view,
        iw / 2 / (ih * 1.05),
        0.5 / 1.05,
        1.55,
        GRT.alpha(GRT.figPaper, 0.2),
      );
      g.fillStyle = this.cab;
      g.font = '500 8.5px ' + this.mono;
      g.fillText('CAMERA', Math.min(ep[0] - 6, rx + rw - 48), ep[1] + 17);
      if (this.anim.stats) g.fillText(GRT.elide(g, this.anim.stats, rw - 12), rx + 6, wy + 14);
      g.fillText(
        GRT.elide(
          g,
          'THE WORLD — THE CACHE AS SOFT SPLATS · TOUCHED GAUSSIANS FLASH · GRAB TO TURN',
          rw - 12,
        ),
        rx + 6,
        wy + wh - 8,
      );
      g.restore();
      this.meter.draw(
        g,
        rx + 6,
        wy + wh + 10,
        rw - 12,
        66,
        'THE RENDER — CACHE VS REFERENCE PSNR · HIGHER IS BETTER',
        this.mono,
        (v) => v.toFixed(1) + ' dB',
      );
      const ui = this.o.ui;
      if (ui && this.frameN % 10 === 0)
        ui.textContent = 'iter ' + F.iter + ' · ' + F.N + ' gaussians · ' + this.kind;
    }
  }
  window.GRT7A = R7;
})();
