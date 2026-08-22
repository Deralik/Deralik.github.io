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
      this.S = vol.samples(3400);
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
        if (lu > 0.04 && this.rand() < Math.min(1, lu * lu * 4)) this.lit.push(p);
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
      this.pulse = new Float32Array(N).fill(-9);
      this.cs = 1;
      for (let i = 0; i < N; i++) this.seed(i);
      this.hb(N);
      this.buildBins();
      this.normInit();
      this.iter = 0;
      this.loss = 1;
    }
    /* spatial bins over the he box, rebuilt as positions drift — one() and
   predC() visit only nearby gaussians instead of all N */
    buildBins() {
      const he = this.vol.he;
      let mx = -99;
      for (let i = 0; i < this.N; i++) if (this.ls[i] > mx) mx = this.ls[i];
      this.qR = 3 * Math.exp(mx);
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
      const p = this.vol.shellInit();
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
      const p = this.lit[(this.rand() * this.lit.length) | 0];
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
      for (let i = N0; i < n; i++) {
        this.seed(i);
        this.pulse[i] = now || 0;
      }
      this.hb(n);
      this.buildBins();
    }
    refreshTruth() {
      this.S = this.vol.samples(3400);
      this.buildLit();
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
                rr = 3 * sg,
                d2 = dx * dx + dy * dy + dz * dz;
              if (d2 > rr * rr) continue;
              const q = d2 / (sg * sg);
              if (q < 11) {
                const G = Math.exp(-0.5 * q);
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
                r = 3 * s,
                d2 = dx * dx + dy * dy + dz * dz;
              if (d2 > r * r) continue;
              const q = d2 / (s * s);
              if (q > 11) continue;
              const G = Math.exp(-0.5 * q);
              sw += G;
              pr += this.cr[i] * G;
              pg += this.cg[i] * G;
              pb += this.cb[i] * G;
              this.hI[nh] = i;
              this.hG[nh] = G;
              this.hQ[nh] = q;
              this.hX[nh] = dx;
              this.hY[nh] = dy;
              this.hZ[nh] = dz;
              this.hS[nh] = s;
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
          s = this.hS[h],
          lum = (this.cr[i] + this.cg[i] + this.cb[i]) / 3,
          wG = lum * G,
          k = (dk * 0.05 * eL * wG * nrm) / (s * s);
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
        const sg = Math.exp(this.ls[i]);
        const vx = ((this.gx[i] / he[0] + 1) / 2) * EX,
          vy = ((this.gy[i] / he[1] + 1) / 2) * EY,
          vz = ((this.gz[i] / he[2] + 1) / 2) * EZ;
        let rx = Math.max(1.2, (3 * sg) / wx),
          ry = Math.max(1.2, (3 * sg) / wy),
          rz = Math.max(1.2, (3 * sg) / wz);
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
        const s2 = sg * sg;
        for (let z = z0; z <= z1; z++)
          for (let y = y0; y <= y1; y++) {
            const dz = (z + 0.5 - vz) * wz,
              dy = (y + 0.5 - vy) * wy,
              base = (z * EY + y) * EX;
            for (let x = x0; x <= x1; x++) {
              const dx = (x + 0.5 - vx) * wx,
                q = (dx * dx + dy * dy + dz * dz) / s2;
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
