/* 7a — the hero. One estimator, one resolution, one fixed
   probe-calibrated exposure (the research renderer's display curve).
   BOTH panes take one sample per pixel per frame of the same
   emission–absorption integral (the medium is known — transmittance is
   deterministic, only radiance is sampled) and accumulate while the
   view holds still, resetting with motion. Right: the raw estimator —
   full-ray samples, high variance. Left: the same estimator with early
   termination into the cache — a short real prefix, then the cache
   supplies the remainder (never its splats; one global brightness
   scalar, the research renderer's own control). Single cached frames
   are already dense; both sides converge toward the reference, apart
   from the cache's residual. The meter is render-space PSNR vs the
   fully-marched reference. */
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
      this.orbitOn = true;
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
          this.uY += (e.clientX - px2) * 0.005;
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
    /* a TRUE orbit sphere around the volume's own centre (the star for
       the nebulae, the density centroid for the data volumes): pitch
       changes direction only, never the distance */
    eyeAt(a, p) {
      p = p || 0;
      const R = (this.vol && this.vol.orb) || 2.1,
        c = (this.vol && this.vol.ctr) || [0, 0, 0],
        hr = Math.cos(p);
      return [c[0] + R * hr * Math.cos(a), c[1] + R * Math.sin(p), c[2] + R * hr * Math.sin(a)];
    }
    eyeCur() {
      return this.eyeAt(this.oa + this.uY, this.uP + 0.13);
    }
    /* pause/resume every automatic motion: the main orbit, the snap-back,
       and the cache view's own slow turn */
    setOrbit(on) {
      this.orbitOn = on;
      this.cam.auto = on ? 0.12 : 0;
    }
    /* background pre-build IN THE WORKER: switching datasets should not
       hitch, and the pre-build itself must not freeze the page */
    prewarm(kind) {
      if (this.vols[kind] || this._warming === kind) return;
      this._warming = kind;
      R7.buildVolAsync(kind).then((v) => {
        if (!this.vols[kind]) this.vols[kind] = v;
        this._warming = null;
      });
    }
    setVol(kind) {
      this.kind = kind;
      this.field = null;
      /* the D0 card pre-builds and pre-trains butterfly (mkButterfly) —
         adopt its volume AND its field: no start delay, and the card's
         training carries straight into the hero */
      if (kind === 'butterfly' && !this.vols.butterfly && window.__grtBfly)
        this.vols.butterfly = window.__grtBfly.vol;
      this.vol =
        this.vols[kind] ||
        (this.vols[kind] =
          kind === 'super' && window.GRT_SUPERNOVA
            ? new DataVol('super', 33, window.GRT_SUPERNOVA)
            : window.GRTNEB && window.GRTNEB[kind]
              ? new GaiaVol(kind, 33)
              : new NebVol(kind, 33));
      if (this.vol._fresh) this.vol._fresh = false;
      else this.vol.rebuild();
      const n = NDEF[kind];
      if (this.o.nEl) this.o.nEl.value = n;
      this.st = this.vol._st520 || this.vol.stipple(520);
      this.field =
        kind === 'butterfly' &&
        window.__grtBfly &&
        window.__grtBfly.vol === this.vol &&
        window.__grtBfly.field.N === n
          ? window.__grtBfly.field
          : new CField(this.vol, n, 9, KO[kind]);
      this.anim = new RayAnim(this.vol, this.field, 83);
      this.anim.eyeRef = () => this.eyeCur();
      this.anim.lights = () => (this.vol.lightsNow ? this.vol.lightsNow() : null);
      if (this.acc) this.acc.fill(0);
      if (this.accL) this.accL.fill(0);
      const R3 = this.vol.EX * this.vol.EY * this.vol.EZ * 3;
      if (!this.CG || this.CG.length !== R3) {
        this.CG = new Float32Array(R3);
        this.CGb = new Float32Array(R3);
      }
      /* the pane fills through the sliced bake (≤14 frames) instead of
         one synchronous full bake — no long task at dataset entry */
      this.CG.fill(0);
      this._bkPh = 0;
      this._bkN = (this._bkN | 0) + 1;
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
      /* no synchronous full bake: clear and let the sliced bake refill
         over the next cycle — reset is instant */
      this.CG.fill(0);
      this._bkPh = 0;
      this._bkN = (this._bkN | 0) + 1;
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
        this.accL = new Float32Array(RW * RH * 3);
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
        AL = this.accL,
        D2 = this.czd.data,
        M = 16,
        cbr = this.cbr || 1,
        spp = this._spp || 1;
      /* display: nebulae keep the paper curve 1-exp(-e·L); data volumes
   use the research reference-figure pipeline (Reinhard then sRGB) */
      const srgb = (x) => {
        const m = x / (1 + x);
        return m <= 0.0031308 ? 12.92 * m : 1.055 * Math.pow(m, 1 / 2.4) - 0.055;
      };
      const crv = v.tone ? (x) => srgb(x) : (x) => 1 - Math.exp(-x);
      const tone = (r, g, b, out, q) => {
        out[q] = 10 + 245 * crv(expo * Math.max(0, r));
        out[q + 1] = 13 + 242 * crv(expo * Math.max(0, g));
        out[q + 2] = 17 + 238 * crv(expo * Math.max(0, b));
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
            const dt2 = (t1 - t0) / M,
              kap = v.kap || 0;
            /* one shared sample: static per-pixel stratum offset rotated
               by the frame index; every stratum visited in M held frames */
            const so = (i2 * 7 + j2 * 13) % M,
              strides = [1, 5, 7, 11, 13, 17, 19, 23],
              stride = strides[(i2 * 31 + j2 * 17) % 8],
              st = (so + stride * this.frameN) % M,
              tt = t0 + (st + Math.random()) * dt2;
            /* one fine march: T at the sample, total optical depth, and
               the interpolated tau0 crossing (continuous — no banding) */
            let tau = 0,
              Tt = 1,
              sTerm = t1,
              gotT = false,
              gotS = false;
            if (kap) {
              const MQ = 16,
                dq = (t1 - t0) / MQ,
                jq = Math.random();
              for (let k = 0; k < MQ; k++) {
                const tk = t0 + (k + jq) * dq;
                if (!gotT && tk > tt) {
                  Tt = Math.exp(-tau);
                  gotT = true;
                }
                const dtau = kap * v.dget(e[0] + dx * tk, e[1] + dy * tk, e[2] + dz * tk) * dq;
                if (!gotS && tau + dtau > 0.15) {
                  sTerm =
                    tk -
                    0.5 * dq +
                    dq * Math.min(1, Math.max(0, (0.15 - tau) / Math.max(dtau, 1e-6)));
                  gotS = true;
                }
                tau += dtau;
              }
              if (!gotT) Tt = Math.exp(-tau);
            }
            /* raw estimator (right) */
            {
              const p0 = e[0] + dx * tt,
                p1 = e[1] + dy * tt,
                p2 = e[2] + dz * tt;
              const i3 = Math.max(0, Math.min(X1, ((p0 + hx) * kx) | 0)),
                j3 = Math.max(0, Math.min(Y1, ((p1 + hy) * ky) | 0)),
                k3 = Math.max(0, Math.min(Z1, ((p2 + hz) * kz) | 0));
              const o2 = ((k3 * EY + j3) * EX + i3) * 3,
                w2 = (t1 - t0) * Tt;
              er = E[o2] * w2;
              eg = E[o2 + 1] * w2;
              eb = E[o2 + 2] * w2;
            }
            /* cached estimator (left): continuous policy — the cache
               carries fraction w of the sample, the shared sample the rest */
            const w = Math.min(1, tau / 0.15);
            let cr2 = 0,
              cg2 = 0,
              cb2 = 0;
            if (gotS) {
              let Ts = Math.exp(-0.15);
              const dts = (t1 - sTerm) / 12,
                jc = Math.random();
              for (let k = 0; k < 12; k++) {
                const tk = sTerm + (k + jc) * dts,
                  x = e[0] + dx * tk,
                  y = e[1] + dy * tk,
                  z = e[2] + dz * tk;
                if (kap) Ts *= Math.exp(-kap * v.dget(x, y, z) * dts);
                const i3 = Math.max(0, Math.min(X1, ((x + hx) * kx) | 0)),
                  j3 = Math.max(0, Math.min(Y1, ((y + hy) * ky) | 0)),
                  k3 = Math.max(0, Math.min(Z1, ((z + hz) * kz) | 0));
                const o3 = ((k3 * EY + j3) * EX + i3) * 3;
                cr2 += C[o3] * cbr * Ts * dts;
                cg2 += C[o3 + 1] * cbr * Ts * dts;
                cb2 += C[o3 + 2] * cbr * Ts * dts;
              }
            }
            const fr = 1 - w + w * (tt < sTerm ? 1 : 0);
            ar = er * fr + w * cr2;
            ag = eg * fr + w * cg2;
            ab = eb * fr + w * cb2;
          }
          A[o] += (er - A[o]) / spp;
          A[o + 1] += (eg - A[o + 1]) / spp;
          A[o + 2] += (eb - A[o + 2]) / spp;
          AL[o] += (ar - AL[o]) / spp;
          AL[o + 1] += (ag - AL[o + 1]) / spp;
          AL[o + 2] += (ab - AL[o + 2]) / spp;
          tone(A[o], A[o + 1], A[o + 2], D, q);
          tone(AL[o], AL[o + 1], AL[o + 2], D2, q);
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
      if (this.frameN % 30 === 8) {
        /* the calibration pair measures WHAT THE PANE DISPLAYS: one march
           per ray computing the full truth, the truth prefix, and the
           cache suffix under the same termination policy — cbr is the
           usage-weighted match of cache suffix to truth suffix, and the
           meter is the displayed pane's PSNR vs the reference */
        this.pairMarch(96, 64);
        const TF = this.pTf,
          TP = this.pTp,
          CS = this.pCs,
          PW = this.pW;
        let st = 0,
          sc = 0;
        for (let px2 = 0; px2 < PW.length; px2++) {
          const w = PW[px2];
          for (let c = 0; c < 3; c++) {
            const q = px2 * 3 + c;
            st += w * (TF[q] - TP[q]);
            sc += w * CS[q];
          }
        }
        const cbrT = Math.max(0.15, Math.min(2.5, st / Math.max(sc, 1e-6)));
        this.cbr = this._ps === undefined ? cbrT : this.cbr * 0.6 + 0.4 * cbrT;
        let se = 0;
        for (let px2 = 0; px2 < PW.length; px2++) {
          const w = PW[px2];
          for (let c = 0; c < 3; c++) {
            const q = px2 * 3 + c;
            const disp = (1 - w) * TF[q] + w * (TP[q] + this.cbr * CS[q]);
            const d = TF[q] - disp;
            se += d * d;
          }
        }
        const ps = 10 * Math.log10(1 / Math.max(1e-6, se / TF.length));
        this._ps = this._ps === undefined ? ps : this._ps * 0.8 + 0.2 * ps;
        this.meter.push(this._ps);
      }
      /* held-still trim: the CPU pair approximates the GPU panes; when the
         view is held long enough for parity to be visible, calibrate the
         brightness control against the ACTUAL accumulations */
      if (this.glr && this._spp > 90 && this.frameN % 60 === 0) {
        const A = this.glr.readAcc(0),
          B = this.glr.readAcc(1);
        let sa = 1e-9,
          sb = 1e-9;
        for (let i = 0; i < A.buf.length; i += 16) {
          sa += A.buf[i] + A.buf[i + 1] + A.buf[i + 2];
          sb += B.buf[i] + B.buf[i + 1] + B.buf[i + 2];
        }
        const g = Math.max(0.8, Math.min(1.25, Math.pow(sa / sb, 0.5)));
        this.cbr = Math.max(0.1, Math.min(2.5, this.cbr * g));
      }
    }
    /* one march per ray: truth full (pTf), truth prefix before the tau0
       crossing (pTp), cache suffix after it (pCs), and the policy weight
       w = min(1, tau/tau0) (pW) */
    pairMarch(W, H) {
      const v = this.vol,
        M = 22,
        TAU0 = 0.15;
      if (!this.pTf || this.pTf.length !== W * H * 3) {
        this.pTf = new Float32Array(W * H * 3);
        this.pTp = new Float32Array(W * H * 3);
        this.pCs = new Float32Array(W * H * 3);
        this.pW = new Float32Array(W * H);
      }
      const EX = v.EX,
        EY = v.EY,
        EZ = v.EZ,
        hx = v.he[0],
        hy = v.he[1],
        hz = v.he[2],
        kap = v.kap || 0,
        useGrid = true /* post-coherence the grid IS the analytic field
          discretized — the cheap prior; the held-still readback trims
          the final scale against the true panes */,
        G = v.grid,
        C = this.CG;
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
          let tfr = 0,
            tfg = 0,
            tfb = 0,
            tpr = 0,
            tpg = 0,
            tpb = 0,
            csr = 0,
            csg = 0,
            csb = 0,
            tau = 0,
            T = 1,
            crossed = false;
          if (t1 > t0) {
            const dt = (t1 - t0) / M;
            for (let k = 0; k < M; k++) {
              const tk = t0 + (k + 0.5) * dt,
                x = e[0] + dx * tk,
                y = e[1] + dy * tk,
                z = e[2] + dz * tk;
              /* exact per-segment compositing — stable at thick κ */
              let fac = dt;
              if (kap) {
                const st = kap * v.dget(x, y, z) * dt;
                T = Math.exp(-tau);
                fac = st > 1e-5 ? ((1 - Math.exp(-st)) / st) * dt : dt;
                tau += st;
              }
              let er2, eg2, eb2;
              if (useGrid) {
                const i3 = Math.max(0, Math.min(X1, ((x + hx) * kx) | 0)),
                  j3 = Math.max(0, Math.min(Y1, ((y + hy) * ky) | 0)),
                  k3 = Math.max(0, Math.min(Z1, ((z + hz) * kz) | 0));
                const o3 = ((k3 * EY + j3) * EX + i3) * 3;
                er2 = G[o3];
                eg2 = G[o3 + 1];
                eb2 = G[o3 + 2];
              } else {
                const c2 = v.emitAt(x, y, z);
                er2 = c2[0];
                eg2 = c2[1];
                eb2 = c2[2];
              }
              tfr += er2 * T * fac;
              tfg += eg2 * T * fac;
              tfb += eb2 * T * fac;
              if (!crossed && tau > TAU0) crossed = true;
              if (!crossed) {
                tpr += er2 * T * fac;
                tpg += eg2 * T * fac;
                tpb += eb2 * T * fac;
              } else {
                const i3 = Math.max(0, Math.min(X1, ((x + hx) * kx) | 0)),
                  j3 = Math.max(0, Math.min(Y1, ((y + hy) * ky) | 0)),
                  k3 = Math.max(0, Math.min(Z1, ((z + hz) * kz) | 0));
                const o3 = ((k3 * EY + j3) * EX + i3) * 3;
                csr += C[o3] * T * fac;
                csg += C[o3 + 1] * T * fac;
                csb += C[o3 + 2] * T * fac;
              }
            }
          }
          const o = (j2 * W + i2) * 3;
          this.pTf[o] = tfr;
          this.pTf[o + 1] = tfg;
          this.pTf[o + 2] = tfb;
          this.pTp[o] = tpr;
          this.pTp[o + 1] = tpg;
          this.pTp[o + 2] = tpb;
          this.pCs[o] = csr;
          this.pCs[o + 1] = csg;
          this.pCs[o + 2] = csb;
          this.pW[j2 * W + i2] = Math.min(1, tau / TAU0);
        }
      }
    }
    insetMarch(GR, lin, img, W2, H2) {
      const W = W2 || 176,
        H = H2 || 123,
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
            const dt = (t1 - t0) / M,
              kap = v.kap || 0;
            let T = 1;
            for (let k = 0; k < M; k++) {
              const tk = t0 + (k + 0.5) * dt,
                x = e[0] + dx * tk,
                y = e[1] + dy * tk,
                z = e[2] + dz * tk;
              /* exact per-segment compositing — stable at thick κ */
              let fac = dt,
                Tn = 1;
              if (kap) {
                const st = kap * v.dget(x, y, z) * dt;
                Tn = Math.exp(-st);
                fac = st > 1e-5 ? ((1 - Tn) / st) * dt : dt;
              }
              if (GR) {
                const i3 = Math.max(0, Math.min(X1, ((x + hx) * kx) | 0)),
                  j3 = Math.max(0, Math.min(Y1, ((y + hy) * ky) | 0)),
                  k3 = Math.max(0, Math.min(Z1, ((z + hz) * kz) | 0));
                const o3 = ((k3 * EY + j3) * EX + i3) * 3;
                ar += GR[o3] * T * fac;
                ag += GR[o3 + 1] * T * fac;
                ab += GR[o3 + 2] * T * fac;
              } else {
                /* GR = null → the CONTINUOUS truth (what the panes show) */
                const c = v.emitAt(x, y, z);
                ar += c[0] * T * fac;
                ag += c[1] * T * fac;
                ab += c[2] * T * fac;
              }
              T *= Tn;
            }
          }
          const o = (j2 * W + i2) * 3;
          lin[o] = ar;
          lin[o + 1] = ag;
          lin[o + 2] = ab;
          if (data) {
            const srgb = (x) => {
              const m = x / (1 + x);
              return m <= 0.0031308 ? 12.92 * m : 1.055 * Math.pow(m, 1 / 2.4) - 0.055;
            };
            const crv = v.tone ? srgb : (x) => 1 - Math.exp(-x);
            const q = (j2 * W + i2) * 4;
            data[q] = 10 + 245 * crv(expo * Math.max(0, ar));
            data[q + 1] = 13 + 242 * crv(expo * Math.max(0, ag));
            data[q + 2] = 17 + 238 * crv(expo * Math.max(0, ab));
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
      if (!this.cam.dr)
        this.cam.auto += ((this.orbitOn ? 0.12 : 0) - this.cam.auto) * Math.min(1, dt * 1.2);
      this.cam.step(dt);
      const B = 120;
      F.step(B, t);
      if (dt < 0.022) F.step(B, t);
      /* cache pane source: sliced re-bake, 1/14 of the gaussians per frame,
   swapped in whole — the pane lags training by ≤14 frames, never tears */
      {
        const NB = Math.ceil(F.N / 14),
          ph = this._bkPh | 0;
        if (ph === 0) this.CGb.fill(0);
        F.bakeSlice(this.CGb, this.vol, ph * NB, Math.min(F.N, (ph + 1) * NB));
        if (ph === 13) {
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
        this.vol.tf = v2 / 6.28;
        this.gtDirty = true;
        this._azT = t;
      }
      if (this.pendingLi !== undefined) {
        const v3 = this.pendingLi;
        this.pendingLi = undefined;
        this.vol.lightAz = v3;
        this.gtDirty = true;
        this._azT = t;
      }
      /* rebuild is ~75ms — fire once the slider rests, not while it moves */
      if (this.gtDirty && t - (this._azT || 0) > 0.12) {
        this.vol.rebuild();
        F.refreshTruth();
        this.gtDirty = false;
        this._glVol = null;
        this._spp = 1;
      }
      const held = this.imgDrag || t < this.holdUntil,
        off = Math.abs(this.uY) + Math.abs(this.uP) > 0.012;
      /* paused orbit = a fully still stage: no auto-advance, and a
         dragged view STAYS where the user left it (no snap-back) */
      if (!held && this.orbitOn) {
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
      this.view.setEye(eye, this.vol.ctr);
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
          tone: this.vol.tone || 0,
          spp: this._spp,
          S: this.vol.S || 1,
          tf: this.vol.tf,
          invG: 1 / (this.vol.gmax || 1),
          kap: this.vol.kap || 0,
          win: this.vol.win ? this.vol.win() : null,
          winId: !this.vol.win || Math.abs(this.vol.tf - 0.5) < 0.02 ? 1 : 0,
          hasA: this.vol.dgAU8 ? 1 : 0,
          lights: this.vol.lightsNow ? this.vol.lightsNow() : null,
          gs: this.vol.nx ? (2 * this.vol.he[0]) / this.vol.nx : 0.02,
          gk: (this.vol.T && this.vol.T.gk) || 0.05,
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
      g.fillText(GRT.elide(g, 'WITH THE CACHE — 1 SPP', iw * 0.48), x0 + 8, y0 + ih - 10);
      const wl = 'WITHOUT — 1 SPP';
      g.fillText(wl, x0 + iw - 8 - g.measureText(wl).width, y0 + ih - 10);
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
      /* the scene's lights, at their live orbit positions — the slider
         moves these markers the moment it moves */
      if (this.vol.lightsNow) {
        const Ls = this.vol.lightsNow() || [];
        g.font = '500 8.5px ' + this.mono;
        for (const L of Ls) {
          const q = px([L[0], L[1], L[2]]),
            qx = Math.max(rx + 12, Math.min(rx + rw - 12, q[0])),
            qy = Math.max(wy + 24, Math.min(wy + wh - 12, q[1]));
          GRT.star(
            g,
            qx,
            qy,
            4.5,
            `rgb(${(L[4] * 235) | 0},${(L[5] * 225) | 0},${(L[6] * 205) | 0})`,
          );
          g.fillStyle = this.cab;
          g.fillText('LIGHT', Math.min(qx + 8, rx + rw - 38), qy + 3);
        }
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
      g.fillText('CACHE VIEW', rx + 6, wy + 14);
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
  /* the heavy voxel work runs in a worker (js/grt-volworker.js); the
     main thread constructs the instance and injects the finished
     arrays — no rebuild, no freeze */
  const VW = { q: [], w: null };
  R7.buildVolAsync = (kind) =>
    new Promise((res) => {
      if (!window.Worker) {
        const v =
          kind === 'super' && window.GRT_SUPERNOVA
            ? new DataVol('super', 33, window.GRT_SUPERNOVA)
            : window.GRTNEB && window.GRTNEB[kind]
              ? new GaiaVol(kind, 33)
              : new NebVol(kind, 33);
        v.rebuild();
        return res(v);
      }
      if (!VW.w) {
        VW.w = new Worker('js/grt-volworker.js');
        VW.w.onmessage = (e) => {
          const j = VW.q.shift(),
            P = e.data;
          const v =
            P.kind === 'super' && window.GRT_SUPERNOVA
              ? new DataVol('super', 33, window.GRT_SUPERNOVA)
              : window.GRTNEB && window.GRTNEB[P.kind]
                ? new GaiaVol(P.kind, 33)
                : new NebVol(P.kind, 33);
          for (const k of [
            'D',
            'DR',
            'grid',
            'gmax',
            'cDe',
            'cAo',
            'cSt',
            'aoT',
            'aoN',
            'cb',
            'expo',
            'ctr',
          ])
            v[k] = P[k];
          const un = (f, w) => {
            const out = [];
            for (let i = 0; i < f.length; i += w) out.push(Array.from(f.subarray(i, i + w)));
            return out;
          };
          v._S = un(P.S3, 3);
          v._st520 = un(P.T520, 4);
          v._st240 = un(P.T240, 4);
          v._fresh = true; /* fully built — setVol skips the re-shade */
          j.res(v);
          if (VW.q.length) VW.w.postMessage(VW.q[0].kind);
        };
      }
      VW.q.push({ kind, res });
      if (VW.q.length === 1) VW.w.postMessage(kind);
    });
  /* shared butterfly (the D0 card's cache view; the hero adopts it in
     setVol — one volume, one field, trained continuously across
     depths). Async: the card shows the pre-generated placeholder until
     this resolves. */
  R7.mkButterfly = async () => {
    if (window.__grtBfly) return window.__grtBfly;
    const vol = await R7.buildVolAsync('butterfly');
    if (window.__grtBfly) return window.__grtBfly;
    /* shape-fitting runs in idle chunks — no single long task */
    const field = new CField(vol, NDEF.butterfly, 9, { ...KO.butterfly, deferFit: true });
    const idle = (fn) =>
      new Promise((r) =>
        window.requestIdleCallback
          ? requestIdleCallback(
              () => {
                fn();
                r();
              },
              { timeout: 600 },
            )
          : setTimeout(() => {
              fn();
              r();
            }, 16),
      );
    const CH = 3000;
    for (let a = 0; a < field.N; a += CH) await idle(() => field.fitSlice(a, a + CH));
    await idle(() => field.finishFit());
    window.__grtBfly = { vol, field };
    return window.__grtBfly;
  };
  window.GRT7A = R7;
})();
