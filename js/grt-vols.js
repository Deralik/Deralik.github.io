/* GRT volumes — the datasets the hero renders and their shared radiance
   pipeline: NebVol (procedural, incl. the panel figure's crab), GaiaVol
   (nebula density models + their shader's dust and glow), DataVol (the
   vendored real volumes + their scene transfer functions). Aggregated
   into window.GRT7 by js/grt7-core.js. */
window.GRTVOLS = (() => {
  const { rng } = GRT;
  const sq = (v) => v * v;
  /* NebVol — procedural emissive volumes (the panel figure's crab, plus
   legacy kinds) and the shared radiance pipeline all volumes inherit. */
  const PAL = {
    crab: [
      [0.45, 0.62, 1],
      [0.88, 0.84, 0.72],
      [1, 0.45, 0.3],
    ],
  };
  const EM = { butterfly: 1, ring: 1, crab: 0.45 };
  class NebVol {
    constructor(kind, seed) {
      this.kind = kind;
      this.r = rng(seed || 7);
      this.he = [1, 1, 1];
      this.EX = this.EY = this.EZ = 56;
      this.orb = 2.1;
      this.grid = new Float32Array(this.EX * this.EY * this.EZ * 3);
      this.expo = 1;
      this.tone = 0; /* 0 = paper curve; 1 = Reinhard+sRGB (data vols) */
      this.gmax = 1;
      this.light = [1.15, 1.05, 0.45];
      this.pal = PAL[kind];
      this.em = EM[kind];
      this.tf = 0.5;
      this.knots = [];
      const nk = kind === 'crab' ? 14 : kind === 'helix' ? 10 : 0;
      for (let i = 0; i < nk; i++) {
        const th = this.r() * 6.283,
          ph = Math.acos(2 * this.r() - 1),
          rr = kind === 'crab' ? 0.3 + 0.55 * this.r() : 0.48 + 0.22 * this.r();
        const kx = rr * Math.sin(ph) * Math.cos(th),
          ky = kind === 'helix' ? (this.r() - 0.5) * 0.4 : rr * Math.cos(ph),
          kz = rr * Math.sin(ph) * Math.sin(th);
        this.knots.push([kx, ky, kz, 0.07 + 0.06 * this.r(), 0.5 + 0.5 * this.r()]);
      }
      this.lobes = [];
      this.wisps = [];
      if (kind === 'burst') {
        this.lobes.push([0, 0.16, 0, 0.34, 1]);
        for (let i = 0; i < 9; i++) {
          const th = this.r() * 6.283,
            ph = Math.acos(2 * this.r() - 1),
            rr = 0.3;
          this.lobes.push([
            rr * Math.sin(ph) * Math.cos(th) * 1.25,
            rr * Math.cos(ph) * 0.8 + 0.18,
            rr * Math.sin(ph) * Math.sin(th) * 1.25,
            0.15 + 0.13 * this.r(),
            0.65 + 0.4 * this.r(),
          ]);
        }
        for (let i = 0; i < 3; i++)
          this.wisps.push([(this.r() - 0.5) * 0.55, (this.r() - 0.5) * 0.55, this.r() * 6]);
      }
    }
    sig(x, y, z) {
      const K = this.kind;
      let s = 0;
      if (K === 'helix') {
        const ys = y * 1.25,
          rr = Math.hypot(x, z),
          a = Math.atan2(z, x);
        const sp = 0.55 + 0.45 * Math.sin(9 * a + 2.2 * Math.sin(3 * a + ys * 2));
        s =
          Math.exp(-sq((rr - 0.58) / 0.18)) * Math.exp(-sq(ys / 0.3)) * (0.5 + 0.5 * sp) +
          0.34 * Math.exp(-sq(rr / 0.45)) * Math.exp(-sq(ys / 0.36)) +
          0.22 * Math.exp(-sq(rr / 0.52)) * Math.exp(-sq((Math.abs(ys) - 0.58) / 0.22)) +
          0.06 * Math.exp(-sq(Math.hypot(x, ys, z) / 0.95));
        for (const k of this.knots)
          s += k[4] * Math.exp(-(sq(x - k[0]) + sq(ys - k[1]) + sq(z - k[2])) / (k[3] * k[3]));
        s -= 0.07;
      } else if (K === 'crab') {
        const e = Math.hypot(x * 1.05, y * 1.15, z);
        if (e > 1.15) return 0;
        const w1 =
          Math.sin(8.3 * x + 5.1 * y - 2) +
          Math.sin(7.4 * y + 6.2 * z + 1) +
          Math.sin(9.1 * z + 6.8 * x - 3);
        s =
          0.6 * Math.exp(-sq(e / 0.6)) +
          Math.max(0, Math.abs(w1) - 1.05) * 1.3 * Math.exp(-sq((e - 0.6) / 0.34));
        for (const k of this.knots)
          s += k[4] * Math.exp(-(sq(x - k[0]) + sq(y - k[1]) + sq(z - k[2])) / (k[3] * k[3]));
        s -= 0.04;
      } else if (K === 'tornado') {
        const u = (y + 1) / 2,
          R = 0.09 + 0.4 * Math.pow(Math.max(0, u), 1.7) + 0.05 * Math.sin(6.2 * u + 1.3);
        const cx2 = 0.16 * Math.sin(1.9 * y + 0.6),
          cz2 = 0.13 * Math.sin(1.6 * y - 1.1),
          dx = x - cx2,
          dz = z - cz2,
          d = Math.hypot(dx, dz),
          a = Math.atan2(dz, dx);
        s =
          Math.exp(-sq(d / Math.max(0.05, R))) *
          (0.62 + 0.38 * Math.sin(3 * a + 8.5 * y + 2 * Math.sin(2 * a))) *
          (0.75 + 0.3 * Math.sin(11 * x + 9 * y) * Math.sin(10 * z - 7 * y)) *
          Math.exp(-Math.pow(Math.abs(y), 8));
        s = s * 1.15 - 0.13;
      } else if (K === 'bh') {
        const rr = Math.hypot(x, z),
          r3 = Math.hypot(x, y, z);
        if (r3 < 0.16) return 0;
        const a = Math.atan2(z, x);
        s =
          (Math.exp(-sq(y / (0.05 + 0.06 * rr))) *
            Math.exp(-sq((rr - 0.6) / 0.36)) *
            (0.68 + 0.32 * Math.sin(2.6 * a - 7.5 * rr)) *
            (0.8 + 0.25 * Math.sin(11 * rr + 4 * a + 2) * Math.sin(6 * a - 9 * rr))) /
          (1 + Math.exp(-(rr - 0.3) * 30));
        s += 1.35 * Math.exp(-sq((r3 - 0.21) / 0.03));
        s -= 0.05;
      } else {
        let m = 0;
        for (const b of this.lobes)
          m += b[4] * Math.exp(-(sq(x - b[0]) + sq(y - b[1]) + sq(z - b[2])) / (b[3] * b[3]));
        m *=
          (0.66 +
            0.42 *
              Math.sin(9.1 * x + 2.1) *
              Math.sin(8.3 * y - 1.2) *
              Math.sin(8.7 * z + 3.3)) *
          (0.82 + 0.25 * Math.sin(15.2 * x - 2) * Math.sin(14.1 * y + 1) * Math.sin(13.7 * z));
        let td = 0;
        for (const q of this.wisps) {
          const wx = x - q[0] - 0.06 * Math.sin(4 * y + q[2]),
            wz = z - q[1] + 0.05 * Math.sin(3.4 * y - q[2]);
          td += 0.3 * Math.exp(-(wx * wx + wz * wz) / 0.018) * Math.exp(-sq((y + 0.45) / 0.4));
        }
        s = m + td - 0.16;
      }
      return s > 0 ? s : 0;
    }
    spec(x, y, z) {
      const K = this.kind;
      if (K === 'helix') {
        const rr = Math.hypot(x, z);
        return Math.max(0, Math.min(1, (rr - 0.26) / 0.44));
      }
      if (K === 'crab') {
        const e = Math.hypot(x * 1.05, y * 1.15, z),
          w1 =
            Math.sin(8.3 * x + 5.1 * y - 2) +
            Math.sin(7.4 * y + 6.2 * z + 1) +
            Math.sin(9.1 * z + 6.8 * x - 3),
          web = Math.max(0, Math.abs(w1) - 1.05) * 1.3 * Math.exp(-sq((e - 0.6) / 0.34)),
          df = 0.6 * Math.exp(-sq(e / 0.6));
        return Math.max(0, Math.min(1, (web * 2) / (df + web + 0.05)));
      }
      if (K === 'tornado') {
        const u = (y + 1) / 2,
          R = 0.09 + 0.4 * Math.pow(Math.max(0, u), 1.7) + 0.05 * Math.sin(6.2 * u + 1.3),
          cx2 = 0.16 * Math.sin(1.9 * y + 0.6),
          cz2 = 0.13 * Math.sin(1.6 * y - 1.1),
          d = Math.hypot(x - cx2, z - cz2);
        return Math.max(0, Math.min(1, 0.15 + (0.85 * d) / Math.max(0.05, R) + 0.12 * u));
      }
      if (K === 'bh') {
        const rr = Math.hypot(x, z),
          r3 = Math.hypot(x, y, z),
          a = Math.atan2(z, x);
        let t = 1.15 - 1.35 * (rr - 0.28) + 0.18 * Math.sin(a);
        t = Math.max(t, 1.6 * Math.exp(-sq((r3 - 0.21) / 0.04)));
        return Math.max(0, Math.min(1, t));
      }
      const em2 = Math.max(
        0,
        Math.sin(11.3 * x + 2) * Math.sin(10.2 * z - 1.3) * Math.sin(8.8 * y + 0.7),
      );
      return Math.max(0, Math.min(1, 2.0 * Math.exp(-sq((y - 0.42) / 0.26)) * em2 * em2 * 1.6));
    }
    palAt(t) {
      const P = this.pal,
        u = t < 0.5 ? t * 2 : (t - 0.5) * 2,
        a = t < 0.5 ? P[0] : P[1],
        b = t < 0.5 ? P[1] : P[2];
      return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
    }
    /* ── the radiance pipeline (renderer rebuild 2026-08-21) ──────────────
   density D (cached once) → EMIT grid at EX×EY×EZ over the he box:
   TF(d, radius)·AO + star → normalized; fixed exposure from a probe
   march. One set of units for truth, cache, and both panes — no runtime
   calibration anywhere. he = world half-extents (real data keeps its
   true aspect; procedural volumes fill the unit cube). */
    buildDensity() {
      const n = (this.DR = this.DR || 40),
        D = (this.D = new Float32Array(n * n * n)),
        he = this.he;
      for (let k = 0; k < n; k++)
        for (let j = 0; j < n; j++)
          for (let i = 0; i < n; i++) {
            const x = (-1 + (2 * (i + 0.5)) / n) * he[0],
              y = (-1 + (2 * (j + 0.5)) / n) * he[1],
              z = (-1 + (2 * (k + 0.5)) / n) * he[2];
            D[(k * n + j) * n + i] = this.sig(x, y, z);
          }
    }
    dget(x, y, z) {
      const n = this.DR,
        D = this.D,
        he = this.he;
      const fx = ((x / he[0] + 1) / 2) * (n - 1),
        fy = ((y / he[1] + 1) / 2) * (n - 1),
        fz = ((z / he[2] + 1) / 2) * (n - 1);
      if (fx < 0 || fy < 0 || fz < 0 || fx > n - 1 || fy > n - 1 || fz > n - 1) return 0;
      const i = fx | 0,
        j = fy | 0,
        k = fz | 0,
        u = fx - i,
        v = fy - j,
        w = fz - k,
        i1 = Math.min(i + 1, n - 1),
        j1 = Math.min(j + 1, n - 1),
        k1 = Math.min(k + 1, n - 1);
      const at = (I, J, K) => D[(K * n + J) * n + I];
      const c00 = at(i, j, k) * (1 - u) + at(i1, j, k) * u,
        c10 = at(i, j1, k) * (1 - u) + at(i1, j1, k) * u,
        c01 = at(i, j, k1) * (1 - u) + at(i1, j, k1) * u,
        c11 = at(i, j1, k1) * (1 - u) + at(i1, j1, k1) * u;
      return (c00 * (1 - v) + c10 * v) * (1 - w) + (c01 * (1 - v) + c11 * v) * w;
    }
    /* emission density: what the EMIT grid and emitAt() shade. Default =
       the cached density; GaiaVol overrides with the analytic field so
       grid, display, targets, and exposure share ONE set of units */
    emitD(x, y, z) {
      return this.dget(x, y, z);
    }
    /* continuous emission at a point — the same math rebuild() bakes,
       evaluated exactly (analytic density, AO from the baked field) */
    aoAt(x, y, z) {
      const n = this.aoN,
        A = this.aoT,
        he = this.he;
      if (!A) return [1, 1, 1];
      const fx = Math.min(n - 1.001, Math.max(0, ((x / he[0] + 1) / 2) * n - 0.5)),
        fy = Math.min(n - 1.001, Math.max(0, ((y / he[1] + 1) / 2) * n - 0.5)),
        fz = Math.min(n - 1.001, Math.max(0, ((z / he[2] + 1) / 2) * n - 0.5));
      const i = fx | 0,
        j = fy | 0,
        k = fz | 0,
        u = fx - i,
        v = fy - j,
        w = fz - k,
        i1 = Math.min(i + 1, n - 1),
        j1 = Math.min(j + 1, n - 1),
        k1 = Math.min(k + 1, n - 1);
      const at = (I, J, K, c) => A[((K * n + J) * n + I) * 3 + c];
      const out = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        const c00 = at(i, j, k, c) * (1 - u) + at(i1, j, k, c) * u,
          c10 = at(i, j1, k, c) * (1 - u) + at(i1, j1, k, c) * u,
          c01 = at(i, j, k1, c) * (1 - u) + at(i1, j, k1, c) * u,
          c11 = at(i, j1, k1, c) * (1 - u) + at(i1, j1, k1, c) * u;
        out[c] = (c00 * (1 - v) + c10 * v) * (1 - w) + (c01 * (1 - v) + c11 * v) * w;
      }
      return out;
    }
    /* the known glow term alone (zero for volumes without one) */
    glowAt(x, y, z) {
      const st = this.star(x, y, z);
      if (!st) return null;
      const ao = this.aoAt(x, y, z),
        inv = 1 / (this.gmax || 1);
      return [st[0] * ao[0] * inv, st[1] * ao[1] * inv, st[2] * ao[2] * inv];
    }
    /* the medium's own emission (no glow) — what the cache learns */
    emitDust(x, y, z) {
      const d = this.emitD(x, y, z);
      if (d <= 0.004) return [0, 0, 0];
      const ao = this.aoAt(x, y, z),
        de = this.dGamma ? Math.pow(d, this.dGamma) : d,
        c = this.tf2(d, Math.hypot(x, y, z), x, y, z),
        inv = 1 / (this.gmax || 1);
      return [de * ao[0] * c[0] * inv, de * ao[1] * c[1] * inv, de * ao[2] * c[2] * inv];
    }
    emitAt(x, y, z) {
      const d = this.emitD(x, y, z),
        st = this.star(x, y, z);
      if (d <= 0.004 && !st) return [0, 0, 0];
      const ao = this.aoAt(x, y, z),
        de = this.dGamma ? Math.pow(d, this.dGamma) : d,
        c = this.tf2(d, Math.hypot(x, y, z), x, y, z),
        inv = 1 / (this.gmax || 1);
      let er = de * ao[0] * c[0],
        eg = de * ao[1] * c[1],
        eb = de * ao[2] * c[2];
      if (st) {
        er += st[0] * ao[0];
        eg += st[1] * ao[1];
        eb += st[2] * ao[2];
      }
      return [er * inv, eg * inv, eb * inv];
    }
    /* default TF keeps the procedural language; subclasses override */
    tf2(d, r, x, y, z) {
      const sp = Math.max(0, Math.min(1, this.spec(x, y, z) + (this.tf - 0.5) * 0.8));
      return this.palAt(sp);
    }
    star() {
      return 0;
    }
    rebuild() {
      if (!this.D) this.buildDensity();
      const EX = this.EX,
        EY = this.EY,
        EZ = this.EZ,
        he = this.he,
        E = this.grid,
        step = (2 * he[0]) / EX,
        n = EX * EY * EZ;
      /* the expensive per-voxel pieces (density, AO, glow) depend only on
         the volume, not the transfer function — cache them once so a TF
         change re-shades in ~100ms instead of re-evaluating the field */
      if (!this.cDe || this.cDe.length !== n) {
        this.cDe = new Float32Array(n);
        this.cAo = new Float32Array(n * 3);
        this.cSt = new Float32Array(n * 3);
        for (let k = 0; k < EZ; k++)
          for (let j = 0; j < EY; j++)
            for (let i = 0; i < EX; i++) {
              const x = (-1 + (2 * (i + 0.5)) / EX) * he[0],
                y = (-1 + (2 * (j + 0.5)) / EY) * he[1],
                z = (-1 + (2 * (k + 0.5)) / EZ) * he[2],
                p = (k * EY + j) * EX + i;
              this.cDe[p] = this.emitD(x, y, z);
              const st = this.star(x, y, z);
              if (st) {
                this.cSt[p * 3] = st[0];
                this.cSt[p * 3 + 1] = st[1];
                this.cSt[p * 3 + 2] = st[2];
              }
            }
        /* ONE lighting source of truth: buildAO fills aoT (plain AO for
           the nebulae, the scenes' shadowed LIGHT FIELD for the real
           volumes); the grid samples it, so panes and grid share units */
        this.buildAO();
        for (let k = 0; k < EZ; k++)
          for (let j = 0; j < EY; j++)
            for (let i = 0; i < EX; i++) {
              const x = (-1 + (2 * (i + 0.5)) / EX) * he[0],
                y = (-1 + (2 * (j + 0.5)) / EY) * he[1],
                z = (-1 + (2 * (k + 0.5)) / EZ) * he[2];
              const ao = this.aoAt(x, y, z),
                p = ((k * EY + j) * EX + i) * 3;
              this.cAo[p] = ao[0];
              this.cAo[p + 1] = ao[1];
              this.cAo[p + 2] = ao[2];
            }
      }
      let m = 0;
      for (let k = 0; k < EZ; k++)
        for (let j = 0; j < EY; j++)
          for (let i = 0; i < EX; i++) {
            const x = (-1 + (2 * (i + 0.5)) / EX) * he[0],
              y = (-1 + (2 * (j + 0.5)) / EY) * he[1],
              z = (-1 + (2 * (k + 0.5)) / EZ) * he[2],
              p = (k * EY + j) * EX + i,
              o = p * 3;
            const d = this.cDe[p],
              aoR = this.cAo[p * 3],
              aoG = this.cAo[p * 3 + 1],
              aoB = this.cAo[p * 3 + 2],
              sr = this.cSt[p * 3],
              sg2 = this.cSt[p * 3 + 1],
              sb2 = this.cSt[p * 3 + 2];
            if (d <= 0.004 && !sr && !sg2 && !sb2) {
              E[o] = E[o + 1] = E[o + 2] = 0;
              continue;
            }
            const rr = Math.hypot(x, y, z),
              c = this.tf2(d, rr, x, y, z);
            const de = this.dGamma ? Math.pow(d, this.dGamma) : d;
            let er = de * aoR * c[0],
              eg = de * aoG * c[1],
              eb = de * aoB * c[2];
            er += sr * aoR;
            eg += sg2 * aoG;
            eb += sb2 * aoB;
            E[o] = er;
            E[o + 1] = eg;
            E[o + 2] = eb;
            const lu = (er + eg + eb) / 3;
            if (lu > m) m = lu;
          }
      this.gmax = Math.max(m, 1e-6);
      const inv = 1 / this.gmax;
      for (let i = 0; i < E.length; i++) E[i] *= inv;
      /* content box (world units, one-voxel margin): rays that miss it skip
   the march entirely — computed from the data, never hardcoded */
      {
        let ax = EX,
          bx = -1,
          ay = EY,
          by = -1,
          az = EZ,
          bz = -1;
        for (let k = 0; k < EZ; k++)
          for (let j = 0; j < EY; j++)
            for (let i = 0; i < EX; i++) {
              const o = ((k * EY + j) * EX + i) * 3;
              if (E[o] + E[o + 1] + E[o + 2] > 6e-3) {
                if (i < ax) ax = i;
                if (i > bx) bx = i;
                if (j < ay) ay = j;
                if (j > by) by = j;
                if (k < az) az = k;
                if (k > bz) bz = k;
              }
            }
        const W2 = (v2, n, h) => ((v2 / n) * 2 - 1) * h;
        this.cb =
          bx < 0
            ? [-he[0], he[0], -he[1], he[1], -he[2], he[2]]
            : [
                W2(ax - 1, EX, he[0]),
                W2(bx + 2, EX, he[0]),
                W2(ay - 1, EY, he[1]),
                W2(by + 2, EY, he[1]),
                W2(az - 1, EZ, he[2]),
                W2(bz + 2, EZ, he[2]),
              ];
      }
      this.calibrate();
    }
    /* AO field as a small grid the GL shader samples trilinearly — same
       formula the EMIT bake uses (6-tap local density, exp falloff) */
    buildAO() {
      const n = 52,
        he = this.he,
        A = (this.aoT =
          this.aoT && this.aoT.length === n * n * n * 3
            ? this.aoT
            : new Float32Array(n * n * n * 3)),
        step = (2 * he[0]) / this.EX,
        k2 = this.aoK || 1.9;
      this.aoN = n;
      for (let k = 0; k < n; k++)
        for (let j = 0; j < n; j++)
          for (let i = 0; i < n; i++) {
            const x = (-1 + (2 * (i + 0.5)) / n) * he[0],
              y = (-1 + (2 * (j + 0.5)) / n) * he[1],
              z = (-1 + (2 * (k + 0.5)) / n) * he[2];
            const nb =
              (this.dget(x + step, y, z) +
                this.dget(x - step, y, z) +
                this.dget(x, y + step, z) +
                this.dget(x, y - step, z) +
                this.dget(x, y, z + step) +
                this.dget(x, y, z - step)) /
              6;
            const v = Math.exp(-k2 * nb),
              p = ((k * n + j) * n + i) * 3;
            A[p] = A[p + 1] = A[p + 2] = v;
          }
    }
    /* ray ∩ he box: [t0,t1] or null (IEEE ±Infinity handles axis-parallel) */
    boxT(e, dx, dy, dz) {
      const he = this.he;
      const ax = (-he[0] - e[0]) / dx,
        bx = (he[0] - e[0]) / dx,
        ay = (-he[1] - e[1]) / dy,
        by = (he[1] - e[1]) / dy,
        az = (-he[2] - e[2]) / dz,
        bz = (he[2] - e[2]) / dz;
      const t0 = Math.max(Math.min(ax, bx), Math.min(ay, by), Math.min(az, bz), 0);
      const t1 = Math.min(Math.max(ax, bx), Math.max(ay, by), Math.max(az, bz));
      return t1 > t0 + 1e-5 ? [t0, t1] : null;
    }
    /* fixed exposure: probe-march the grid, expose to its p-high luminance */
    calibrate() {
      const EX = this.EX,
        EY = this.EY,
        EZ = this.EZ,
        he = this.he,
        E = this.grid,
        M = 22,
        ls = [];
      for (let a = 0; a < 26; a++)
        for (let b = 0; b < 10; b++) {
          const th = (a / 26) * 6.283,
            eye = [this.orb * Math.cos(th), 0.15 + b * 0.09, this.orb * Math.sin(th)];
          const L = Math.hypot(eye[0], eye[1], eye[2]),
            dx = -eye[0] / L,
            dy = -eye[1] / L,
            dz = -eye[2] / L;
          const tr = this.boxT(eye, dx, dy, dz);
          if (!tr) continue;
          const dt = (tr[1] - tr[0]) / M,
            kap = this.kap || 0;
          let sr = 0,
            sg = 0,
            sb = 0,
            T = 1;
          for (let k2 = 0; k2 < M; k2++) {
            const tt = tr[0] + (k2 + 0.5) * dt,
              p0 = eye[0] + dx * tt,
              p1 = eye[1] + dy * tt,
              p2 = eye[2] + dz * tt;
            const i2 = Math.max(0, Math.min(EX - 1, (((p0 / he[0] + 1) / 2) * EX) | 0)),
              j2 = Math.max(0, Math.min(EY - 1, (((p1 / he[1] + 1) / 2) * EY) | 0)),
              k3 = Math.max(0, Math.min(EZ - 1, (((p2 / he[2] + 1) / 2) * EZ) | 0)),
              o2 = ((k3 * EY + j2) * EX + i2) * 3;
            if (kap) T *= Math.exp(-kap * this.dget(p0, p1, p2) * dt);
            sr += E[o2] * T * dt;
            sg += E[o2 + 1] * T * dt;
            sb += E[o2 + 2] * T * dt;
          }
          const s = this.tone ? 0.2126 * sr + 0.7152 * sg + 0.0722 * sb : (sr + sg + sb) / 3;
          if (s > 0) ls.push(s);
        }
      ls.sort((a, b) => a - b);
      if (this.tone) {
        /* Reinhard exposure, anchored on the MIDTONES (p90 → 0.6): the
     reference figures anchor p99.5 → 0.9, but their brightness
     distribution is heavy-tailed and ours is flatter — tail-anchoring
     a flat distribution pushes the whole object into the Reinhard
     shoulder and it washes white (owner rounds 4–5) */
        const a = ls.length ? ls[Math.min(ls.length - 1, Math.floor(ls.length * 0.9))] : 1;
        this.expo = 1.5 / Math.max(a, 1e-4);
        return;
      }
      const p = ls.length ? ls[Math.min(ls.length - 1, Math.floor(ls.length * 0.97))] : 1;
      /* paper display curve 1-exp(-e·L): put p97 at ~.95 (verified offline
   against the research repo's reference figures, heroprobe.py) */
      this.expo = 3.0 / Math.max(p, 1e-4);
    }
    idx(p) {
      const EX = this.EX,
        EY = this.EY,
        EZ = this.EZ,
        he = this.he,
        i = Math.max(0, Math.min(EX - 1, (((p[0] / he[0] + 1) / 2) * EX) | 0)),
        j = Math.max(0, Math.min(EY - 1, (((p[1] / he[1] + 1) / 2) * EY) | 0)),
        k = Math.max(0, Math.min(EZ - 1, (((p[2] / he[2] + 1) / 2) * EZ) | 0));
      return ((k * EY + j) * EX + i) * 3;
    }
    /* trilinear truth colour — training targets match the trilinear field
   the panes display, instead of voxel steps */
    gtc(p) {
      const EX = this.EX,
        EY = this.EY,
        EZ = this.EZ,
        he = this.he,
        g = this.grid;
      const fx = Math.min(EX - 1.001, Math.max(0, (p[0] / he[0] + 1) * 0.5 * EX - 0.5));
      const fy = Math.min(EY - 1.001, Math.max(0, (p[1] / he[1] + 1) * 0.5 * EY - 0.5));
      const fz = Math.min(EZ - 1.001, Math.max(0, (p[2] / he[2] + 1) * 0.5 * EZ - 0.5));
      const i = fx | 0,
        j = fy | 0,
        k = fz | 0,
        u = fx - i,
        v = fy - j,
        w = fz - k;
      const i1 = Math.min(i + 1, EX - 1),
        j1 = Math.min(j + 1, EY - 1),
        k1 = Math.min(k + 1, EZ - 1);
      const out = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        const a = (cz, cy, cx) => g[((cz * EY + cy) * EX + cx) * 3 + c];
        const c00 = a(k, j, i) * (1 - u) + a(k, j, i1) * u,
          c10 = a(k, j1, i) * (1 - u) + a(k, j1, i1) * u;
        const c01 = a(k1, j, i) * (1 - u) + a(k1, j, i1) * u,
          c11 = a(k1, j1, i) * (1 - u) + a(k1, j1, i1) * u;
        out[c] = (c00 * (1 - v) + c10 * v) * (1 - w) + (c01 * (1 - v) + c11 * v) * w;
      }
      return out;
    }
    gt(p) {
      const c = this.gtc(p);
      return (c[0] + c[1] + c[2]) / 3;
    }
    /* near-flat acceptance over content: dim regions must train too, or
   bright-region tails inflate them unchecked */
    samples(n) {
      const a = [],
        he = this.he;
      let g = 0;
      while (a.length < n && g < n * 60) {
        g++;
        const x = (this.r() * 2 - 1) * he[0],
          y = (this.r() * 2 - 1) * he[1],
          z = (this.r() * 2 - 1) * he[2],
          s = this.sig(x, y, z);
        if (s > 0.02 && this.r() < 0.25 + s) a.push([x, y, z]);
      }
      return a;
    }
    /* like samples(), but accepted on emitted luminance (post-rebuild):
   covers glow that has no density */
    radSamples(n) {
      const a = [],
        he = this.he;
      let g = 0;
      while (a.length < n && g < n * 60) {
        g++;
        const x = (this.r() * 2 - 1) * he[0],
          y = (this.r() * 2 - 1) * he[1],
          z = (this.r() * 2 - 1) * he[2],
          l = this.gt([x, y, z]);
        if (l > 0.012 && this.r() < 0.25 + l * 1.5) a.push([x, y, z]);
      }
      return a;
    }
    stipple(n) {
      const a = [],
        he = this.he;
      let g = 0;
      while (a.length < n && g < n * 60) {
        g++;
        const x = (this.r() * 2 - 1) * he[0],
          y = (this.r() * 2 - 1) * he[1],
          z = (this.r() * 2 - 1) * he[2],
          s = this.sig(x, y, z);
        if (s > 0.02 && this.r() < 0.8) a.push([x, y, z, Math.min(1, s)]);
      }
      return a;
    }
  }
  /* DataVol — the vendored REAL datasets (js/grt-vol-*.js carry provenance
   headers). Opacity and colour are the research repo's own scene transfer
   functions (scene_mechhand.json / scene_supernova.json, recovered
   2026-08-21), sampled piecewise-linear; the supernova adds a small
   disclosed opacity floor so its translucent shell — lit by scattering in
   the real renderer — stays visible in this emission-only pipeline. */
  function lut1(u, P, V) {
    let i = 1;
    while (i < P.length - 1 && u > P[i]) i++;
    const t = Math.max(0, Math.min(1, (u - P[i - 1]) / (P[i] - P[i - 1])));
    return V[i - 1] + (V[i] - V[i - 1]) * t;
  }
  function lut3(u, P, C) {
    let i = 1;
    while (i < P.length - 1 && u > P[i]) i++;
    const t = Math.max(0, Math.min(1, (u - P[i - 1]) / (P[i] - P[i - 1]))),
      a = C[i - 1],
      b = C[i];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  const DTF = {
    mech: {
      he: [0.9, 0.309, 0.322],
      E: [128, 44, 46],
      kap: 48,
      /* light-march extinction is gentler than the camera ray's: the
         scene's material carries a 0.2 ambient floor — full κ in the
         shadow march would blacken the interior parts it keeps lit */
      kapL: 6,
      orb: 2.0,
      aoK: 3.4,
      /* the scene's own lights (beautyshots/scene_mechhand.json):
         [x,y,z, I, r,g,b] — cool-blue key from below, warm fill above */
      lights: [
        [0.34, -1.21, 0.35, 8.5, 0.7, 0.85, 1],
        [-0.42, 0.815, -0.31, 4.0, 1, 0.75, 0.5],
      ],
      /* light orbit sweeps pole-to-pole over the hand's long axis —
         visibly re-shades; a y-orbit would barely move these lights */
      lax: [1, 0, 0],
      ap: [0, 0.0625, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
      av: [0, 0.057, 0.108, 0.211, 0.335, 0.449, 0.591, 0.701, 0.83, 1],
      cp: [0, 0.0993, 0.2855, 0.442, 0.589, 1],
      cc: [
        [1, 1, 1],
        [1, 0.972, 0.93],
        [0.961, 0.475, 0],
        [0.8, 0, 0],
        [0.204, 0.396, 0.643],
        [0.361, 0.208, 0.4],
      ],
    },
    super: {
      he: [1, 1, 1],
      E: [72, 72, 72],
      orb: 1.75,
      kap: 6,
      kapL: 2.5,
      gk: 0.5,
      /* the scene's own warm key light (beautyshots/scene_supernova.json;
         its second light is 1.4% of the key — dropped) */
      lights: [[1.86, 1.48, 1.73, 26.0, 1, 0.65, 0.35]],
      /* the NATIVE transfer function, from the same scene file: three thin
         opacity tents — nested translucent shells (cyan · green-orange ·
         red) — replacing an earlier wrong recovery (a dense high-u ramp
         plus a disclosed opacity floor) that filled the ball with fog */
      ap: [
        0, 0.2035, 0.3317, 0.3618, 0.3894, 0.495, 0.505, 0.5402, 0.6156, 0.6784, 0.7299, 0.7726,
        1,
      ],
      av: [0, 0, 0, 0.1072, 0, 0, 0.2261, 0.1166, 0, 0, 0.1096, 0, 0],
      cp: [0, 0.2487, 0.3744, 0.5, 0.5377, 0.6307, 1],
      cc: [
        [1, 1, 1],
        [0.294, 0.377, 1],
        [0.137, 0.543, 1],
        [0.393, 0.819, 0.456],
        [0.946, 0.334, 0.079],
        [0.958, 0.061, 0.061],
        [1, 0, 0],
      ],
    },
  };
  class DataVol extends NebVol {
    /* the TF slider is a scalar-domain WINDOW (the control SciVis tools
       expose): t=.5 shows the scene's official mapping; lower t expands
       the low-u interior across the full ramp, higher t the dense end */
    win() {
      const t = this.tf,
        lo = Math.max(0, Math.min(0.6, 1.2 * (t - 0.5))),
        hi = 1 + Math.max(-0.6, Math.min(0, 1.2 * (t - 0.5)));
      return [lo, hi];
    }
    uw(u) {
      const w = this.win();
      return Math.max(0, Math.min(1, (u - w[0]) / (w[1] - w[0])));
    }
    rebuild() {
      this.cDe = null; /* the window moves density too, not just colour */
      super.rebuild();
    }
    /* these are LIT volumes, not emissive ones (their scenes carry
       spherical lights; the TF rgb is scattering albedo): the per-voxel
       grid the shader samples as "ao" is the light field — irradiance
       from the scene's own lights with transmittance marched through
       the known medium. Single scattering, deterministic. */
    buildAO() {
      const n = 40,
        he = this.he,
        kap = this.T.kapL || this.kap || 0,
        LsNow = this.lightsNow(),
        gk = this.T.gk || 0.05;
      if (!LsNow) return super.buildAO();
      this.aoN = n;
      if (!this.aoT || this.aoT.length !== n * n * n * 3)
        this.aoT = new Float32Array(n * n * n * 3);
      const A = this.aoT,
        K = 16;
      for (let k = 0; k < n; k++)
        for (let j = 0; j < n; j++)
          for (let i = 0; i < n; i++) {
            const x = (-1 + (2 * (i + 0.5)) / n) * he[0],
              y = (-1 + (2 * (j + 0.5)) / n) * he[1],
              z = (-1 + (2 * (k + 0.5)) / n) * he[2];
            /* the scene material's N·L diffuse term: surface normal from
               the density gradient, faded out where the field is flat
               (fuzzy interiors stay isotropically lit) */
            const gs = he[0] / n,
              gx = this.dget(x + gs, y, z) - this.dget(x - gs, y, z),
              gy = this.dget(x, y + gs, z) - this.dget(x, y - gs, z),
              gz = this.dget(x, y, z + gs) - this.dget(x, y, z - gs),
              gm = Math.hypot(gx, gy, gz) / (2 * gs),
              gw = Math.min(1, gm * gk),
              gi = gm > 1e-6 ? -1 / (gm * 2 * gs) : 0,
              nX = gx * gi,
              nY = gy * gi,
              nZ = gz * gi;
            let sr = 0,
              sg = 0,
              sb = 0;
            for (const L0 of LsNow) {
              const L = L0;
              let dx = L[0] - x,
                dy = L[1] - y,
                dz = L[2] - z;
              const dist = Math.hypot(dx, dy, dz) || 1e-4;
              dx /= dist;
              dy /= dist;
              dz /= dist;
              /* march toward the light until the box exit */
              const ax = dx > 0 ? (he[0] - x) / dx : dx < 0 ? (-he[0] - x) / dx : 1e9,
                ay = dy > 0 ? (he[1] - y) / dy : dy < 0 ? (-he[1] - y) / dy : 1e9,
                az = dz > 0 ? (he[2] - z) / dz : dz < 0 ? (-he[2] - z) / dz : 1e9;
              const tEnd = Math.min(dist, Math.min(ax, ay, az)),
                dt = tEnd / K;
              let tau = 0;
              for (let q = 0; q < K; q++) {
                const tq = (q + 0.5) * dt;
                tau += kap * this.dget(x + dx * tq, y + dy * tq, z + dz * tq) * dt;
              }
              const lam = 1 - gw + gw * Math.max(0, nX * dx + nY * dy + nZ * dz),
                w = (lam * L0[3] * Math.exp(-tau)) / (dist * dist + 0.35);
              sr += w * L0[4];
              sg += w * L0[5];
              sb += w * L0[6];
            }
            /* the scene's material terms: 0.2 ambient floor + 0.8 diffuse */
            const p = ((k * n + j) * n + i) * 3;
            A[p] = 0.2 + 0.8 * sr;
            A[p + 1] = 0.2 + 0.8 * sg;
            A[p + 2] = 0.2 + 0.8 * sb;
          }
    }
    /* the scene lights at the CURRENT orbit angle — for the light march
       and for drawing their positions in the cache view */
    lightsNow() {
      const Ls = this.T.lights;
      if (!Ls) return null;
      const lax = this.T.lax || [0, 1, 0];
      return Ls.map((L) => {
        const p = this.lightAz
          ? rot3(L[0], L[1], L[2], lax[0], lax[1], lax[2], this.lightAz)
          : L;
        return [p[0], p[1], p[2], L[3], L[4], L[5], L[6]];
      });
    }
    /* LUT accessors for the GL layer's scene-TF texture bake */
    lut1(u, P, V) {
      return lut1(u, P, V);
    }
    lut3(u, P, C) {
      return lut3(u, P, C);
    }
    constructor(kind, seed, src) {
      super(kind, seed);
      const T = (this.T = DTF[kind]);
      this.nx = src.nx;
      this.ny = src.ny;
      this.nz = src.nz;
      const bin = atob(src.b64),
        g = new Float32Array(this.nx * this.ny * this.nz),
        u8 = new Uint8Array(g.length);
      for (let q = 0; q < g.length; q++) {
        u8[q] = bin.charCodeAt(q);
        g[q] = u8[q] / 255;
      }
      this.dg = g;
      this.dgU8 = u8; /* raw bytes for the GL data texture */
      if (src.b64a) {
        const ba = atob(src.b64a),
          ga = new Float32Array(g.length),
          ua = new Uint8Array(g.length);
        for (let q = 0; q < ga.length; q++) {
          ua[q] = ba.charCodeAt(q);
          ga[q] = ua[q] / 255;
        }
        this.dgA = ga;
        this.dgAU8 = ua;
      }
      this.he = T.he;
      this.EX = T.E[0];
      this.EY = T.E[1];
      this.EZ = T.E[2];
      this.orb = T.orb;
      if (T.aoK) this.aoK = T.aoK;
      if (T.kap) this.kap = T.kap;
      this.grid = new Float32Array(this.EX * this.EY * this.EZ * 3);
      this.em = 1;
      if (T.tf0 !== undefined) this.tf = T.tf0;
      this.tone = 1; /* data vols display via the reference-figure pipeline */
      this.lightAz = 0;
    }
    usamp(x, y, z) {
      return this.samp3(this.dg, x, y, z);
    }
    samp3(g, x, y, z) {
      const nx = this.nx,
        ny = this.ny,
        nz = this.nz,
        he = this.he;
      const fx = ((x / he[0] + 1) / 2) * (nx - 1),
        fy = ((y / he[1] + 1) / 2) * (ny - 1),
        fz = ((z / he[2] + 1) / 2) * (nz - 1);
      if (fx < 0 || fy < 0 || fz < 0 || fx > nx - 1 || fy > ny - 1 || fz > nz - 1) return 0;
      const i = fx | 0,
        j = fy | 0,
        k = fz | 0,
        u = fx - i,
        v = fy - j,
        w = fz - k,
        i1 = Math.min(i + 1, nx - 1),
        j1 = Math.min(j + 1, ny - 1),
        k1 = Math.min(k + 1, nz - 1);
      const at = (I, J, K) => g[(K * ny + J) * nx + I];
      const c00 = at(i, j, k) * (1 - u) + at(i1, j, k) * u,
        c10 = at(i, j1, k) * (1 - u) + at(i1, j1, k) * u,
        c01 = at(i, j, k1) * (1 - u) + at(i1, j, k1) * u,
        c11 = at(i, j1, k1) * (1 - u) + at(i1, j1, k1) * u;
      return (c00 * (1 - v) + c10 * v) * (1 - w) + (c01 * (1 - v) + c11 * v) * w;
    }
    dget(x, y, z) {
      /* pre-classified alpha when the vendor carries it (thin structures
         keep their opacity); else the scene LUT over the scalar */
      if (this.dgA) return this.samp3(this.dgA, x, y, z);
      const T = this.T,
        u = this.usamp(x, y, z);
      let a = lut1(u, T.ap, T.av);
      if (T.fl) {
        const f = T.fl(u);
        if (f > a) a = f;
      }
      return a;
    }
    buildDensity() {
      this.D = 1;
    }
    sig(x, y, z) {
      return this.dget(x, y, z) * 1.5;
    }
    tf2(d, r, x, y, z) {
      const T = this.T;
      return lut3(this.uw(this.usamp(x, y, z)), T.cp, T.cc);
    }
  }
  /* GaiaVol — Gaia Sky nebula density models (js/grt-nebulae.js carries the
   ports + credits); palette mixes centre->rim by radius, per the shaders. */
  class GaiaVol extends NebVol {
    constructor(kind, seed) {
      super(kind, seed);
      this.fn = window.GRTNEB[kind];
      /* the density models spill past the unit cube (butterfly cones to
         |p|≈1.45, the ring's gas shell past 1.1) — the box must hold the
         whole volume or the extremities are amputated everywhere */
      this.he = [1.45, 1.45, 1.45];
      /* the grid scales WITH the box — the ring's filaments are ~.03
         wide and the training targets must resolve them */
      this.EX = this.EY = this.EZ = 88;
      this.grid = new Float32Array(88 * 88 * 88 * 3);
      this.DR = 64;
      this.S = GS[kind];
      this.tf = 0.5; /* centre = the colourway matched to the shaders' output */
      this.orb = kind === 'ring' ? 2.45 : 2.2;
      this.dGamma = 2.0;
      this.kap = 9;
      this.aoK = 2.6;
    }
    sig(x, y, z) {
      return this.fn(x, y, z) * 3.2;
    }
    emitD(x, y, z) {
      return this.sig(x, y, z);
    }
    /* training targets: the medium's CONTINUOUS emission only — the
       glow is a known analytic term the renderer computes, not caches */
    gtc(p) {
      return this.emitDust(p[0], p[1], p[2]);
    }
    /* after the shader's computeColor, radius in ITS units (lD = r·S):
   blue-white centre dust -> amber edge dust (edge colour matched to the
   shaders' rendered output rather than their raw constants — their td
   accumulation warms it); the tf slider moves the mix radius */
    tf2(d, r, x, y, z) {
      const t = Math.abs(2 * this.tf - 1),
        swp = this.tf < 0.5,
        res = 1 - 0.5 * Math.min(1, d * 1.2);
      if (this.kind === 'ring') {
        /* colour keyed to the DATA's own geometry: distance from the
           torus centreline separates the ring from the surrounding gas */
        const S = this.S;
        let p = rot3(x * S, y * S, z * S, 0, 0, 1, 1.0471976);
        p = rot3(p[0], p[1], p[2], 0, 1, 0, 1.5707963);
        const dT = Math.hypot(Math.hypot(p[0], p[1]) - 2.2, p[2]);
        const w = Math.min(1, Math.max(0, (dT - 0.45) / 0.8));
        const ringR = 7 + (7 - 7) * t,
          ringG = 7.4 + (4.2 - 7.4) * t,
          ringB = 7.8 + (6.6 - 7.8) * t;
        const gasR = 2.3 + (1.0 - 2.3) * t,
          gasG = 1.45 + (1.55 - 1.45) * t,
          gasB = 0.75 + (2.7 - 0.75) * t;
        const w2 = swp ? 1 - w : w;
        return [
          res * (ringR + (gasR - ringR) * w2),
          res * (ringG + (gasG - ringG) * w2),
          res * (ringB + (gasB - ringB) * w2),
        ];
      }
      const P = GP[this.kind],
        m = Math.min((r * this.S) / 2.6, 1);
      const c0r = P.a0[0] + (P.b0[0] - P.a0[0]) * t,
        c0g = P.a0[1] + (P.b0[1] - P.a0[1]) * t,
        c0b = P.a0[2] + (P.b0[2] - P.a0[2]) * t,
        c1r = P.a1[0] + (P.b1[0] - P.a1[0]) * t,
        c1g = P.a1[1] + (P.b1[1] - P.a1[1]) * t,
        c1b = P.a1[2] + (P.b1[2] - P.a1[2]) * t;
      const m2 = swp ? 1 - m : m;
      return [
        res * (c0r + (c1r - c0r) * m2),
        res * (c0g + (c1g - c0g) * m2),
        res * (c0b + (c1b - c0b) * m2),
      ];
    }
    /* the shader's additive glow, density-independent: green-cyan 1/r² core +
   the radius-keyed cosine halo (blue at lD≈1, amber by lD≈2) */
    star(x, y, z) {
      const S = this.S,
        lD = Math.max(0.03, Math.hypot(x, y, z) * S);
      const g1 = 0.7 / ((lD * lD + 0.12) * 10),
        e = Math.exp(-lD * lD * lD * 0.09),
        T = lD * 2.3 + 2.6,
        K = 0.012,
        /* the central star itself (the remnant, a bright point in the
           reference photography): tight 1/r² core, bluish white */
        g2 = 0.012 / (lD * lD + 0.0012);
      return [
        K * (Math.max(0, 0.4 + 0.5 * Math.cos(T - 0.785)) * e + 0.57 * g1) + 0.75 * g2,
        K * (Math.max(0, 0.4 + 0.5 * Math.cos(T + 0.079)) * e + 1.85 * g1) + 0.85 * g2,
        K * (Math.max(0, 0.4 + 0.5 * Math.cos(T + 0.785)) * e + 1.0 * g1) + 1.0 * g2,
      ];
    }
  }
  function rot3(x, y, z, ax, ay, az, ang) {
    const l = Math.hypot(ax, ay, az) || 1;
    ax /= l;
    ay /= l;
    az /= l;
    const c = Math.cos(ang),
      s = Math.sin(ang),
      d = x * ax + y * ay + z * az;
    return [
      x * c + (ay * z - az * y) * s + ax * d * (1 - c),
      y * c + (az * x - ax * z) * s + ay * d * (1 - c),
      z * c + (ax * y - ay * x) * s + az * d * (1 - c),
    ];
  }
  /* palette pairs per nebula: a* = matched to the shaders' rendered
     output; b* = a second colourway the slider sweeps toward */
  const GP = {
    butterfly: {
      a0: [5.6, 6.3, 7],
      a1: [1.5, 1.2, 0.7],
      b0: [7, 3.4, 1.6],
      b1: [0.7, 1.5, 2.8],
    },
    ring: {
      a0: [5.6, 6.3, 7],
      a1: [1.5, 1.2, 0.7],
      b0: [6.8, 2.6, 5.4],
      b1: [2.4, 1.2, 0.45],
    },
  };
  /* per-kind world->shader scale (the density ports' own fit factors) */
  const GS = { butterfly: 4.2, ring: 3.4 };
  return { NebVol, DataVol, GaiaVol };
})();
