/* GRT cache field — the gaussian mixture that trains live against a
   volume's radiance: SGD colour/position/size updates over spatially
   binned lookups, relocation, the grid bake for the cache pane, and the
   world-view splat draw. Aggregated into window.GRT7 by js/grt7-core.js. */
window.GRTFIELD = (() => {
  const { rng } = GRT;
  const SIZES = {
    s0: 0.052,
    sv: 0.018,
    lsMin: -3.66,
    lsMax: -1.55,
    sMul: 0.92,
    relocLs: Math.log(0.06),
  };
  const EXPL = new Float32Array(257);
  for (let i = 0; i <= 256; i++) EXPL[i] = Math.exp((-0.5 * i * 6.25) / 256);
  /* CField — gaussians that learn RGB radiance. Soft splats only (no outlines);
   a gaussian flashes when a training sample updates it. */
  function makeBase() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d'),
      gr = g.createRadialGradient(32, 32, 1, 32, 32, 31);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.42, 'rgba(255,255,255,.42)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(32, 32, 31, 0, 6.283);
    g.fill();
    return c;
  }
  class CField {
    constructor(vol, N, seed, opts) {
      this.vol = vol;
      this.opt = opts || SIZES;
      this.rand = rng(seed || 17);
      /* pools sample by DENSITY: the cache is only queried where the
   medium terminates rays, so gaussians live in the dust — a radiance
   pool dragged them into the glow halo, bloating kernel sizes and
   spilling energy box-wide */
      this.S = vol._S || vol.samples(3400);
      vol._S = null; /* one use — refreshes must resample */
      this.buildLit();
      /* dark pool: uniform in the box, no rejection — the field must learn its
   ZEROS too, or gaussian tails leave untrained haze where the truth is
   black (the pane marches through empty space; the training samples
   otherwise never land there) */
      this.dark = [];
      const nd = Math.round(1400 * vol.he[0] * vol.he[1] * vol.he[2]);
      for (let i = 0; i < nd; i++)
        this.dark.push([
          (this.rand() * 2 - 1) * vol.he[0],
          (this.rand() * 2 - 1) * vol.he[1],
          (this.rand() * 2 - 1) * vol.he[2],
        ]);
      this.relocOn = true;
      this.wmax = 0.3;
      this.base = makeBase();
      this.tintC = new Map();
      this.alloc(N);
    }
    buildLit() {
      this.lit = [];
      for (const p of this.S) {
        const c = this.vol.gtc(p),
          lu = (c[0] + c[1] + c[2]) / 3;
        const th = this.vol.litThin ? this.vol.litThin(p) : 1;
        if (lu > 0.04 && this.rand() < th * Math.min(1, lu * lu * 4)) this.lit.push(p);
      }
      if (!this.lit.length) this.lit = this.S;
    }
    /* derive kernel sizes from the content's own spacing at this N —
       sizes shrink as gaussians are added, so capacity buys sharpness
       (opts.ad enables it; fixed-size figures keep their opts) */
    sizeInit() {
      const S = this.S,
        M = Math.min(100, S.length);
      let acc = 0;
      for (let a = 0; a < M; a++) {
        const p = S[(this.rand() * S.length) | 0];
        let best = 1e9;
        for (let j = 0; j < S.length; j++) {
          const q = S[j];
          if (q === p) continue;
          const d2 = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
          if (d2 < best) best = d2;
        }
        acc += Math.sqrt(best);
      }
      const spacing = (acc / M) * Math.cbrt(S.length / this.N);
      const s0 = Math.max(0.014, Math.min(0.05, 1.15 * spacing));
      this.s0d = s0;
      this.svd = 0.35 * s0;
      this.lsMinD = Math.log(0.55 * s0);
      this.lsMaxD = Math.log(2.2 * s0);
      this.relocLsD = Math.log(0.9 * s0);
    }
    alloc(N) {
      this.N = N;
      if (this.opt.ad) this.sizeInit();
      this.gx = new Float32Array(N);
      this.gy = new Float32Array(N);
      this.gz = new Float32Array(N);
      this.ls = new Float32Array(N);
      this.cr = new Float32Array(N);
      this.cg = new Float32Array(N);
      this.cb = new Float32Array(N);
      /* ANISOTROPIC kernels (the research method's representation): a
         per-gaussian orthonormal frame (row-major 3×3) + three shape
         ratios, geo-normalized to 1 so exp(ls) stays the trained scale.
         Identity frame + unit ratios ≡ the old isotropic math exactly —
         the fixed-size panel figures keep their proven numerics. */
      this.eR = new Float32Array(N * 9);
      this.bR = new Float32Array(N * 3).fill(1);
      this.bMx = new Float32Array(N).fill(1);
      for (let i = 0; i < N; i++) {
        this.eR[i * 9] = 1;
        this.eR[i * 9 + 4] = 1;
        this.eR[i * 9 + 8] = 1;
      }
      this.pulse = new Float32Array(N).fill(-9);
      this.cs = 1;
      for (let i = 0; i < N; i++) this.seed(i);
      if (this.opt.ad) {
        this.buildSBins();
        /* deferFit: the caller runs fitSlice()/finishFit() across idle
           chunks instead of one long task (the D0 background build) */
        if (!this.opt.deferFit) for (let i = 0; i < N; i++) this.covFit(i);
      }
      this.finishFit();
      this.iter = 0;
      this.loss = 1;
    }
    fitSlice(a, b) {
      if (!this.opt.ad || !this.sbOff) return;
      const e = Math.min(this.N, b);
      for (let i = a; i < e; i++) this.covFit(i);
    }
    finishFit() {
      this.bMaxG = 1;
      for (let i = 0; i < this.N; i++) if (this.bMx[i] > this.bMaxG) this.bMaxG = this.bMx[i];
      this.hb(this.N);
      this.buildBins();
      this.normInit();
    }
    /* sample bins over the pool — covFit's neighbour queries */
    buildSBins() {
      const he = this.vol.he,
        rq = (this.sbC = Math.max(0.03, 2.2 * (this.s0d || 0.03)));
      const nx = (this.sbx = Math.max(1, Math.ceil((2 * he[0]) / rq))),
        ny = (this.sby = Math.max(1, Math.ceil((2 * he[1]) / rq))),
        nz = (this.sbz = Math.max(1, Math.ceil((2 * he[2]) / rq)));
      const M = nx * ny * nz,
        cnt = new Int32Array(M),
        S = this.S,
        cell = new Int32Array(S.length);
      for (let i = 0; i < S.length; i++) {
        const p = S[i],
          cx = Math.min(nx - 1, Math.max(0, ((p[0] + he[0]) / rq) | 0)),
          cy = Math.min(ny - 1, Math.max(0, ((p[1] + he[1]) / rq) | 0)),
          cz = Math.min(nz - 1, Math.max(0, ((p[2] + he[2]) / rq) | 0)),
          c = (cz * ny + cy) * nx + cx;
        cell[i] = c;
        cnt[c]++;
      }
      const off = (this.sbOff = new Int32Array(M + 1));
      for (let c = 0; c < M; c++) off[c + 1] = off[c] + cnt[c];
      const idx = (this.sbIdx = new Int32Array(S.length));
      cnt.set(off.subarray(0, M));
      for (let i = 0; i < S.length; i++) idx[cnt[cell[i]]++] = i;
    }
    /* eigen-decompose a symmetric 3×3 (cyclic Jacobi) — returns
       {v: row-major eigenvectors, l: eigenvalues} */
    eig3(a00, a01, a02, a11, a12, a22) {
      const A = [a00, a01, a02, a01, a11, a12, a02, a12, a22],
        V = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      for (let sweep = 0; sweep < 8; sweep++) {
        let offd = Math.abs(A[1]) + Math.abs(A[2]) + Math.abs(A[5]);
        if (offd < 1e-12) break;
        for (const [p, q] of [
          [0, 1],
          [0, 2],
          [1, 2],
        ]) {
          const apq = A[p * 3 + q];
          if (Math.abs(apq) < 1e-14) continue;
          const app = A[p * 3 + p],
            aqq = A[q * 3 + q],
            th = 0.5 * Math.atan2(2 * apq, aqq - app),
            c = Math.cos(th),
            s = Math.sin(th);
          for (let k = 0; k < 3; k++) {
            const akp = A[k * 3 + p],
              akq = A[k * 3 + q];
            A[k * 3 + p] = c * akp - s * akq;
            A[k * 3 + q] = s * akp + c * akq;
          }
          for (let k = 0; k < 3; k++) {
            const apk = A[p * 3 + k],
              aqk = A[q * 3 + k];
            A[p * 3 + k] = c * apk - s * aqk;
            A[q * 3 + k] = s * apk + c * aqk;
            const vpk = V[p * 3 + k],
              vqk = V[q * 3 + k];
            V[p * 3 + k] = c * vpk - s * vqk;
            V[q * 3 + k] = s * vpk + c * vqk;
          }
        }
      }
      return { v: V, l: [A[0], A[4], A[8]] };
    }
    /* fit the kernel's SHAPE to the local sample covariance: thin shells
       and filaments get flattened/elongated kernels (constant volume —
       ratios geo-normalize to 1, so the trained scale is untouched) */
    covFit(i) {
      if (!this.sbOff) return;
      const he = this.vol.he,
        rq = this.sbC,
        x = this.gx[i],
        y = this.gy[i],
        z = this.gz[i];
      const cx0 = Math.max(0, ((x - rq + he[0]) / rq) | 0),
        cx1 = Math.min(this.sbx - 1, ((x + rq + he[0]) / rq) | 0),
        cy0 = Math.max(0, ((y - rq + he[1]) / rq) | 0),
        cy1 = Math.min(this.sby - 1, ((y + rq + he[1]) / rq) | 0),
        cz0 = Math.max(0, ((z - rq + he[2]) / rq) | 0),
        cz1 = Math.min(this.sbz - 1, ((z + rq + he[2]) / rq) | 0);
      const iw = 1 / (0.5 * rq * rq);
      let sw = 0,
        mx = 0,
        my = 0,
        mz = 0;
      const px = [],
        py = [],
        pz = [],
        pw = [];
      for (let cz = cz0; cz <= cz1; cz++)
        for (let cy = cy0; cy <= cy1; cy++) {
          const row = (cz * this.sby + cy) * this.sbx;
          for (let cx = cx0; cx <= cx1; cx++) {
            const c = row + cx;
            for (let u = this.sbOff[c]; u < this.sbOff[c + 1]; u++) {
              const p = this.S[this.sbIdx[u]],
                dx = p[0] - x,
                dy = p[1] - y,
                dz = p[2] - z,
                d2 = dx * dx + dy * dy + dz * dz;
              if (d2 > rq * rq) continue;
              const w = Math.exp(-d2 * iw);
              px.push(dx);
              py.push(dy);
              pz.push(dz);
              pw.push(w);
              sw += w;
              mx += w * dx;
              my += w * dy;
              mz += w * dz;
            }
          }
        }
      const o9 = i * 9,
        o3 = i * 3;
      if (px.length < 8 || sw < 1e-6) {
        this.eR[o9] = 1;
        this.eR[o9 + 1] = 0;
        this.eR[o9 + 2] = 0;
        this.eR[o9 + 3] = 0;
        this.eR[o9 + 4] = 1;
        this.eR[o9 + 5] = 0;
        this.eR[o9 + 6] = 0;
        this.eR[o9 + 7] = 0;
        this.eR[o9 + 8] = 1;
        this.bR[o3] = this.bR[o3 + 1] = this.bR[o3 + 2] = 1;
        this.bMx[i] = 1;
        return;
      }
      mx /= sw;
      my /= sw;
      mz /= sw;
      let c00 = 0,
        c01 = 0,
        c02 = 0,
        c11 = 0,
        c12 = 0,
        c22 = 0;
      for (let k = 0; k < px.length; k++) {
        const w = pw[k],
          dx = px[k] - mx,
          dy = py[k] - my,
          dz = pz[k] - mz;
        c00 += w * dx * dx;
        c01 += w * dx * dy;
        c02 += w * dx * dz;
        c11 += w * dy * dy;
        c12 += w * dy * dz;
        c22 += w * dz * dz;
      }
      const e = this.eig3(c00 / sw, c01 / sw, c02 / sw, c11 / sw, c12 / sw, c22 / sw);
      let s0 = Math.sqrt(Math.max(e.l[0], 1e-10)),
        s1 = Math.sqrt(Math.max(e.l[1], 1e-10)),
        s2 = Math.sqrt(Math.max(e.l[2], 1e-10));
      /* geo-normalize, then cap ELONGATION at 1.25 — flattening is free
         (smaller kernels) but elongation inflates every neighbour query,
         and perf pays for the widest gaussian in the field */
      const smax = Math.max(s0, s1, s2),
        fl = smax / 3.5;
      s0 = Math.max(s0, fl);
      s1 = Math.max(s1, fl);
      s2 = Math.max(s2, fl);
      const geo = Math.cbrt(s0 * s1 * s2);
      s0 = Math.min(1.25, Math.max(0.45, s0 / geo));
      s1 = Math.min(1.25, Math.max(0.45, s1 / geo));
      s2 = Math.min(1.25, Math.max(0.45, s2 / geo));
      const g2 = Math.cbrt(s0 * s1 * s2);
      s0 /= g2;
      s1 /= g2;
      s2 /= g2;
      /* eigenvector ROWS map world → local */
      for (let k = 0; k < 9; k++) this.eR[o9 + k] = e.v[k];
      this.bR[o3] = s0;
      this.bR[o3 + 1] = s1;
      this.bR[o3 + 2] = s2;
      this.bMx[i] = Math.max(s0, s1, s2);
      if (this.bMx[i] > (this.bMaxG || 1)) this.bMaxG = this.bMx[i];
    }
    /* spatial bins over the he box, rebuilt as positions drift — one() and
   predC() visit only nearby gaussians instead of all N */
    buildBins() {
      const he = this.vol.he;
      let mx = -99;
      for (let i = 0; i < this.N; i++) if (this.ls[i] > mx) mx = this.ls[i];
      this.qR = 2.6 * Math.exp(mx) * (this.bMaxG || 1);
      /* cell ≈ query radius, so a lookup touches ~27 cells of local
         gaussians instead of a fixed coarse grid */
      const C = (this.binC = Math.max(0.05, Math.min(0.25, 1.1 * this.qR)));
      const nx = (this.bnx = Math.max(1, Math.ceil((2 * he[0]) / C)));
      const ny = (this.bny = Math.max(1, Math.ceil((2 * he[1]) / C)));
      const nz = (this.bnz = Math.max(1, Math.ceil((2 * he[2]) / C)));
      const M = nx * ny * nz,
        cnt = new Int32Array(M);
      if (!this.bCell || this.bCell.length !== this.N) this.bCell = new Int32Array(this.N);
      const cell = this.bCell;
      for (let i = 0; i < this.N; i++) {
        const cx = Math.min(nx - 1, Math.max(0, ((this.gx[i] + he[0]) / C) | 0));
        const cy = Math.min(ny - 1, Math.max(0, ((this.gy[i] + he[1]) / C) | 0));
        const cz = Math.min(nz - 1, Math.max(0, ((this.gz[i] + he[2]) / C) | 0));
        const c = (cz * ny + cy) * nx + cx;
        cell[i] = c;
        cnt[c]++;
      }
      const off = (this.bOff = new Int32Array(M + 1));
      for (let c = 0; c < M; c++) off[c + 1] = off[c] + cnt[c];
      if (!this.bIdx || this.bIdx.length !== this.N) this.bIdx = new Int32Array(this.N);
      cnt.set(off.subarray(0, M));
      for (let i = 0; i < this.N; i++) this.bIdx[cnt[cell[i]]++] = i;
    }
    /* the field is a SUM: seeding every gaussian at the full local colour
   overshoots by the overlap count (~10-30×). Measure it, scale once —
   the field starts at the right energy and SGD only shapes structure. */
    normInit() {
      let m = 0,
        n = 0;
      for (let k = 0; k < 80; k++) {
        const p = this.S[(this.rand() * this.S.length) | 0],
          pc = this.predC(p),
          tc = this.vol.gtc(p);
        const tl = tc[0] + tc[1] + tc[2];
        if (tl > 0.05) {
          m += (pc[0] + pc[1] + pc[2]) / tl;
          n++;
        }
      }
      const s = n ? 1 / Math.max(1, m / n) : 1;
      if (s < 1)
        for (let i = 0; i < this.N; i++) {
          this.cr[i] *= s;
          this.cg[i] *= s;
          this.cb[i] *= s;
        }
      this.cs = s;
      this.vg = Math.min(14, 1 / Math.max(s, 0.07));
      /* dim/reloc thresholds and display gain follow the colour scale */
      let ml = 0;
      for (let i = 0; i < this.N; i++) ml += (this.cr[i] + this.cg[i] + this.cb[i]) / 3;
      ml /= this.N;
      this.dimT = Math.max(0.0015, 0.12 * ml);
      /* colour ceiling in the field's own units: the absolute clamp of 2
         is ~40× the working scale — a gaussian stuck there IS a bright
         blob. Cap at a small multiple of the mean instead. */
      this.cMax = Math.min(2, Math.max(0.04, 14 * ml));
    }
    seed(i) {
      const p = this.S.length ? this.S[(this.rand() * this.S.length) | 0] : [0, 0, 0];
      this.gx[i] = p[0];
      this.gy[i] = p[1];
      this.gz[i] = p[2];
      this.ls[i] = Math.log(
        (this.s0d || this.opt.s0) + (this.svd || this.opt.sv) * this.rand(),
      );
      const c = this.vol.gtc(p),
        s = this.cs,
        fl = Math.max(0.002, 0.02 * s);
      this.cr[i] = Math.max(fl, c[0] * s);
      this.cg[i] = Math.max(fl, c[1] * s);
      this.cb[i] = Math.max(fl, c[2] * s);
    }
    relocSeed(i) {
      /* land on an UNDER-COVERED lit point: piling onto covered spots
         (the star attracts every relocation once it enters the lit
         pool) overloads its bin cells — capacity belongs at the
         residual */
      let p = this.lit[(this.rand() * this.lit.length) | 0];
      for (let a = 0; a < 4; a++) {
        const tc0 = this.vol.gtc(p),
          pc0 = this.predC(p),
          tl = (tc0[0] + tc0[1] + tc0[2]) / 3,
          pl = (pc0[0] + pc0[1] + pc0[2]) / 3;
        if (pl < 0.8 * tl) break;
        p = this.lit[(this.rand() * this.lit.length) | 0];
      }
      this.gx[i] = p[0] + 0.04 * (this.rand() - 0.5);
      this.gy[i] = p[1] + 0.04 * (this.rand() - 0.5);
      this.gz[i] = p[2] + 0.04 * (this.rand() - 0.5);
      this.ls[i] = this.relocLsD || this.opt.relocLs;
      /* colour = the RESIDUAL at the landing point, not the full local
         target — injecting full brightness on top of existing coverage
         piles local hot spots that a global scalar can never fix */
      const c = this.vol.gtc(p),
        pc = this.predC(p);
      this.cr[i] = Math.min(this.cMax || 2, Math.max(0.002, (c[0] - pc[0]) * 0.9));
      this.cg[i] = Math.min(this.cMax || 2, Math.max(0.002, (c[1] - pc[1]) * 0.9));
      this.cb[i] = Math.min(this.cMax || 2, Math.max(0.002, (c[2] - pc[2]) * 0.9));
      if (this.opt.ad) this.covFit(i);
    }
    hb(N) {
      this.hI = new Int32Array(N);
      this.hG = new Float32Array(N);
      this.hQ = new Float32Array(N);
      this.hX = new Float32Array(N);
      this.hY = new Float32Array(N);
      this.hZ = new Float32Array(N);
      this.hS = new Float32Array(N);
    }
    setN(n, now) {
      if (n === this.N) return;
      const cp = (a, M) => {
        const b = new Float32Array(M);
        b.set(a.subarray(0, Math.min(a.length, M)));
        return b;
      };
      const N0 = this.N;
      this.N = n;
      this.gx = cp(this.gx, n);
      this.gy = cp(this.gy, n);
      this.gz = cp(this.gz, n);
      this.ls = cp(this.ls, n);
      this.cr = cp(this.cr, n);
      this.cg = cp(this.cg, n);
      this.cb = cp(this.cb, n);
      const pu = new Float32Array(n).fill(-9);
      pu.set(this.pulse.subarray(0, Math.min(N0, n)));
      this.pulse = pu;
      const cpe = (a, M2) => {
        const b = new Float32Array(M2);
        b.set(a.subarray(0, Math.min(a.length, M2)));
        return b;
      };
      this.eR = cpe(this.eR, n * 9);
      this.bR = cpe(this.bR, n * 3);
      this.bMx = cpe(this.bMx, n);
      for (let i = N0; i < n; i++) {
        this.eR[i * 9] = this.eR[i * 9 + 4] = this.eR[i * 9 + 8] = 1;
        this.bR[i * 3] = this.bR[i * 3 + 1] = this.bR[i * 3 + 2] = 1;
        this.bMx[i] = 1;
        this.seed(i);
        if (this.opt.ad) this.covFit(i);
        this.pulse[i] = now || 0;
      }
      this.hb(n);
      this.buildBins();
    }
    refreshTruth() {
      this.S = this.vol.samples(3400);
      this.buildLit();
      if (this.opt.ad) this.buildSBins();
    }
    /* bin-range helper: cell index bounds around (x,y,z) at radius qR */
    brange(x, y, z) {
      const he = this.vol.he,
        C = this.binC,
        R = this.qR;
      return [
        Math.max(0, ((x - R + he[0]) / C) | 0),
        Math.min(this.bnx - 1, ((x + R + he[0]) / C) | 0),
        Math.max(0, ((y - R + he[1]) / C) | 0),
        Math.min(this.bny - 1, ((y + R + he[1]) / C) | 0),
        Math.max(0, ((z - R + he[2]) / C) | 0),
        Math.min(this.bnz - 1, ((z + R + he[2]) / C) | 0),
      ];
    }
    predC(p) {
      let r = 0,
        g = 0,
        b = 0;
      const [x0, x1, y0, y1, z0, z1] = this.brange(p[0], p[1], p[2]),
        off = this.bOff,
        idx = this.bIdx,
        nx = this.bnx,
        ny = this.bny;
      for (let cz = z0; cz <= z1; cz++)
        for (let cy = y0; cy <= y1; cy++) {
          const row = (cz * ny + cy) * nx;
          for (let cx = x0; cx <= x1; cx++) {
            const c = row + cx;
            for (let u = off[c]; u < off[c + 1]; u++) {
              const i = idx[u];
              const dx = p[0] - this.gx[i],
                dy = p[1] - this.gy[i],
                dz = p[2] - this.gz[i],
                sg = Math.exp(this.ls[i]),
                rr = 2.6 * sg * this.bMx[i],
                d2 = dx * dx + dy * dy + dz * dz;
              if (d2 > rr * rr) continue;
              const o9 = i * 9,
                o3 = i * 3,
                E = this.eR,
                B2 = this.bR,
                u0 = (E[o9] * dx + E[o9 + 1] * dy + E[o9 + 2] * dz) / (sg * B2[o3]),
                u1 = (E[o9 + 3] * dx + E[o9 + 4] * dy + E[o9 + 5] * dz) / (sg * B2[o3 + 1]),
                u2 = (E[o9 + 6] * dx + E[o9 + 7] * dy + E[o9 + 8] * dz) / (sg * B2[o3 + 2]);
              const q = u0 * u0 + u1 * u1 + u2 * u2;
              if (q < 11) {
                const G = q < 9 ? EXPL[((q * 256) / 9) | 0] : Math.exp(-0.5 * q);
                r += this.cr[i] * G;
                g += this.cg[i] * G;
                b += this.cb[i] * G;
              }
            }
          }
        }
      return [r, g, b];
    }
    pred(p) {
      const c = this.predC(p);
      return (c[0] + c[1] + c[2]) / 3;
    }
    one(x, y, z, dk, now, flash, out) {
      const tc = this.vol.gtc([x, y, z]);
      let pr = 0,
        pg = 0,
        pb = 0,
        sw = 0,
        nh = 0;
      const [x0, x1, y0, y1, z0, z1] = this.brange(x, y, z),
        off = this.bOff,
        idx = this.bIdx,
        bnx = this.bnx,
        bny = this.bny;
      for (let cz = z0; cz <= z1; cz++)
        for (let cy = y0; cy <= y1; cy++) {
          const row = (cz * bny + cy) * bnx;
          for (let cx = x0; cx <= x1; cx++) {
            const cc = row + cx;
            for (let u = off[cc]; u < off[cc + 1]; u++) {
              const i = idx[u];
              const dx = x - this.gx[i],
                dy = y - this.gy[i],
                dz = z - this.gz[i],
                s = Math.exp(this.ls[i]),
                r = 2.6 * s * this.bMx[i],
                d2 = dx * dx + dy * dy + dz * dz;
              if (d2 > r * r) continue;
              const o9 = i * 9,
                o3 = i * 3,
                E = this.eR,
                B2 = this.bR,
                s0 = s * B2[o3],
                s1 = s * B2[o3 + 1],
                s2 = s * B2[o3 + 2],
                u0 = (E[o9] * dx + E[o9 + 1] * dy + E[o9 + 2] * dz) / s0,
                u1 = (E[o9 + 3] * dx + E[o9 + 4] * dy + E[o9 + 5] * dz) / s1,
                u2 = (E[o9 + 6] * dx + E[o9 + 7] * dy + E[o9 + 8] * dz) / s2;
              const q = u0 * u0 + u1 * u1 + u2 * u2;
              if (q > 11) continue;
              const G = q < 9 ? EXPL[((q * 256) / 9) | 0] : Math.exp(-0.5 * q);
              sw += G;
              pr += this.cr[i] * G;
              pg += this.cg[i] * G;
              pb += this.cb[i] * G;
              /* position-step direction = Σ⁻¹·d, stored in world frame */
              const w0 = u0 / s0,
                w1 = u1 / s1,
                w2 = u2 / s2;
              this.hI[nh] = i;
              this.hG[nh] = G;
              this.hQ[nh] = q;
              this.hX[nh] = E[o9] * w0 + E[o9 + 3] * w1 + E[o9 + 6] * w2;
              this.hY[nh] = E[o9 + 1] * w0 + E[o9 + 4] * w1 + E[o9 + 7] * w2;
              this.hZ[nh] = E[o9 + 2] * w0 + E[o9 + 5] * w1 + E[o9 + 8] * w2;
              nh++;
            }
          }
        }
      const er = pr - tc[0],
        eg = pg - tc[1],
        eb = pb - tc[2],
        eL = (er + eg + eb) / 3;
      /* normalize every step by the local weight sum: the SUM's correction
         is then bounded by the learning rate no matter how many gaussians
         pile onto a point. Unnormalized updates diverge exactly where
         relocation concentrates capacity (the ring's bright segments) —
         the clamp at zero rectifies the oscillation into a brightness
         ratchet. */
      const nrm = 1 / Math.max(1, sw);
      for (let h = 0; h < nh; h++) {
        const i = this.hI[h],
          G = this.hG[h],
          lum = (this.cr[i] + this.cg[i] + this.cb[i]) / 3,
          wG = lum * G,
          k = dk * 0.05 * eL * wG * nrm;
        this.cr[i] -= dk * 0.5 * er * G * nrm;
        this.cg[i] -= dk * 0.5 * eg * G * nrm;
        this.cb[i] -= dk * 0.5 * eb * G * nrm;
        const cm = this.cMax || 2;
        if (this.cr[i] < 0) this.cr[i] = 0;
        else if (this.cr[i] > cm) this.cr[i] = cm;
        if (this.cg[i] < 0) this.cg[i] = 0;
        else if (this.cg[i] > cm) this.cg[i] = cm;
        if (this.cb[i] < 0) this.cb[i] = 0;
        else if (this.cb[i] > cm) this.cb[i] = cm;
        this.gx[i] -= k * this.hX[h];
        this.gy[i] -= k * this.hY[h];
        this.gz[i] -= k * this.hZ[h];
        this.ls[i] -= dk * 0.08 * eL * wG * nrm * this.hQ[h];
        const lmn = this.lsMinD || this.opt.lsMin,
          lmx = this.lsMaxD || this.opt.lsMax;
        if (this.ls[i] < lmn) this.ls[i] = lmn;
        else if (this.ls[i] > lmx) this.ls[i] = lmx;
        if (flash && G > 0.35) {
          this.pulse[i] = now;
          out && out.add(i);
        }
      }
      return er * er + eg * eg + eb * eb;
    }
    step(B, now) {
      let L = 0;
      const dk = 1 / (1 + this.iter / 2200);
      if (this.iter % 30 === 0) this.buildBins();
      for (let b = 0; b < B; b++) {
        const u = this.rand(),
          pool = u < 0.5 ? this.lit : u < 0.75 ? this.S : this.dark,
          p = pool[(this.rand() * pool.length) | 0];
        L += this.one(
          p[0] + 0.05 * (this.rand() - 0.5),
          p[1] + 0.05 * (this.rand() - 0.5),
          p[2] + 0.05 * (this.rand() - 0.5),
          dk,
          now,
          false,
        );
      }
      this.loss = this.loss * 0.96 + 0.04 * (L / B);
      this.iter++;
      if (this.relocOn)
        for (let k = 0; k < 8; k++) {
          const i = (this.rand() * this.N) | 0,
            lum = (this.cr[i] + this.cg[i] + this.cb[i]) / 3,
            dT = this.dimT || 0.03;
          if (lum < dT && this.rand() < 0.35) {
            this.relocSeed(i);
            this.pulse[i] = now;
          } else if (lum < 1.6 * dT) {
            this.gx[i] += 0.006 * (this.rand() - 0.5);
            this.gy[i] += 0.006 * (this.rand() - 0.5);
            this.gz[i] += 0.006 * (this.rand() - 0.5);
          }
        }
    }
    micro(p, now, out) {
      const dk = 0.4 / (1 + this.iter / 2200);
      for (let k = 0; k < 8; k++)
        this.one(
          p[0] + 0.06 * (this.rand() - 0.5),
          p[1] + 0.06 * (this.rand() - 0.5),
          p[2] + 0.06 * (this.rand() - 0.5),
          dk,
          now,
          true,
          out,
        );
    }
    tint(r, g, b) {
      const q =
        Math.min(4, (r * 4.99) | 0) * 25 +
        Math.min(4, (g * 4.99) | 0) * 5 +
        Math.min(4, (b * 4.99) | 0);
      let c = this.tintC.get(q);
      if (c) return c;
      c = document.createElement('canvas');
      c.width = c.height = 64;
      const cg = c.getContext('2d');
      cg.drawImage(this.base, 0, 0);
      cg.globalCompositeOperation = 'source-in';
      cg.fillStyle = `rgb(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0})`;
      cg.fillRect(0, 0, 64, 64);
      this.tintC.set(q, c);
      return c;
    }
    sprFor(r, g, b) {
      const mx = Math.max(r, g, b, 1e-4);
      return this.tint(Math.min(1, r / mx), Math.min(1, g / mx), Math.min(1, b / mx));
    }
    /* splat gaussians [a,b) into grid E (dims/he from vol). Sliced so the
   per-frame cost stays bounded; exp via LUT, 2.5σ cutoff. */
    bakeSlice(E, vol, a, b) {
      const EX = vol.EX,
        EY = vol.EY,
        EZ = vol.EZ,
        he = vol.he;
      const wx = (2 * he[0]) / EX,
        wy = (2 * he[1]) / EY,
        wz = (2 * he[2]) / EZ,
        Q = 9,
        QS = 256 / Q;
      for (let i = a; i < b; i++) {
        const cr = this.cr[i],
          cg = this.cg[i],
          cb = this.cb[i];
        if ((cr + cg + cb) / 3 < Math.min(0.008, (this.dimT || 0.008) * 0.25)) continue;
        const sg = Math.exp(this.ls[i]),
          o9 = i * 9,
          o3 = i * 3,
          eA = this.eR,
          bA = this.bR,
          a00 = eA[o9] / (sg * bA[o3]),
          a01 = eA[o9 + 1] / (sg * bA[o3]),
          a02 = eA[o9 + 2] / (sg * bA[o3]),
          a10 = eA[o9 + 3] / (sg * bA[o3 + 1]),
          a11 = eA[o9 + 4] / (sg * bA[o3 + 1]),
          a12 = eA[o9 + 5] / (sg * bA[o3 + 1]),
          a20 = eA[o9 + 6] / (sg * bA[o3 + 2]),
          a21 = eA[o9 + 7] / (sg * bA[o3 + 2]),
          a22 = eA[o9 + 8] / (sg * bA[o3 + 2]),
          b0 = bA[o3],
          b1 = bA[o3 + 1],
          b2 = bA[o3 + 2],
          exx =
            3 *
            sg *
            Math.sqrt(
              eA[o9] * eA[o9] * b0 * b0 +
                eA[o9 + 3] * eA[o9 + 3] * b1 * b1 +
                eA[o9 + 6] * eA[o9 + 6] * b2 * b2,
            ),
          exy =
            3 *
            sg *
            Math.sqrt(
              eA[o9 + 1] * eA[o9 + 1] * b0 * b0 +
                eA[o9 + 4] * eA[o9 + 4] * b1 * b1 +
                eA[o9 + 7] * eA[o9 + 7] * b2 * b2,
            ),
          exz =
            3 *
            sg *
            Math.sqrt(
              eA[o9 + 2] * eA[o9 + 2] * b0 * b0 +
                eA[o9 + 5] * eA[o9 + 5] * b1 * b1 +
                eA[o9 + 8] * eA[o9 + 8] * b2 * b2,
            );
        const vx = ((this.gx[i] / he[0] + 1) / 2) * EX,
          vy = ((this.gy[i] / he[1] + 1) / 2) * EY,
          vz = ((this.gz[i] / he[2] + 1) / 2) * EZ;
        let rx = Math.max(1.2, exx / wx),
          ry = Math.max(1.2, exy / wy),
          rz = Math.max(1.2, exz / wz);
        const v3 = rx * ry * rz;
        if (v3 > 700) {
          const sc = Math.cbrt(700 / v3);
          rx *= sc;
          ry *= sc;
          rz *= sc;
        }
        const x0 = Math.max(0, Math.ceil(vx - rx)),
          x1 = Math.min(EX - 1, Math.floor(vx + rx));
        const y0 = Math.max(0, Math.ceil(vy - ry)),
          y1 = Math.min(EY - 1, Math.floor(vy + ry));
        const z0 = Math.max(0, Math.ceil(vz - rz)),
          z1 = Math.min(EZ - 1, Math.floor(vz + rz));
        for (let z = z0; z <= z1; z++)
          for (let y = y0; y <= y1; y++) {
            const dz = (z + 0.5 - vz) * wz,
              dy = (y + 0.5 - vy) * wy,
              base = (z * EY + y) * EX;
            for (let x = x0; x <= x1; x++) {
              const dx = (x + 0.5 - vx) * wx,
                q0 = a00 * dx + a01 * dy + a02 * dz,
                q1 = a10 * dx + a11 * dy + a12 * dz,
                q2 = a20 * dx + a21 * dy + a22 * dz,
                q = q0 * q0 + q1 * q1 + q2 * q2;
              if (q >= Q) continue;
              const G = EXPL[(q * QS) | 0],
                o = (base + x) * 3;
              E[o] += cr * G;
              E[o + 1] += cg * G;
              E[o + 2] += cb * G;
            }
          }
      }
    }
    bakeTo(E, vol) {
      E.fill(0);
      this.bakeSlice(E, vol, 0, this.N);
    }
    draw(g, px, S, now) {
      g.globalCompositeOperation = 'lighter';
      /* at high N, draw every 2nd splat — the cloud stays dense and the
         layer redraw stays inside the frame budget */
      const step = this.N > 14000 ? 3 : this.N > 9000 ? 2 : 1;
      for (let i = 0; i < this.N; i += step) {
        const lum = (this.cr[i] + this.cg[i] + this.cb[i]) / 3,
          pb = this.pulse[i] > 0 ? Math.exp(-(now - this.pulse[i]) * 2.5) : 0,
          a = Math.min(0.85, lum * (this.vg || 1) * 1.35 + 0.5 * pb);
        if (a < 0.04) continue;
        const p = px([this.gx[i], this.gy[i], this.gz[i]]),
          sz = Math.exp(this.ls[i]) * p[2] * S * this.opt.sMul * (1 + 0.4 * pb);
        g.globalAlpha = a;
        g.drawImage(
          this.sprFor(this.cr[i], this.cg[i], this.cb[i]),
          p[0] - sz,
          p[1] - sz,
          sz * 2,
          sz * 2,
        );
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
    }
  }
  return { CField, SIZES };
})();
