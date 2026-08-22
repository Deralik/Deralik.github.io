/* JS-exact offline renders of the hero's truth field: loads the real site
   files (grt-dir-core rng, grt-nebulae, grt7-core), rebuilds a volume, and
   marches its EMIT grid exactly like js/grt7-a.js — writes PPMs so TF and
   glow tuning is verified against reference images before any browser run.
   usage: node scripts/herojs.mjs [kinds...]   (default: butterfly ring) */
import { readFileSync, writeFileSync } from 'fs';
const g2d = {
  createRadialGradient: () => ({ addColorStop() {} }),
  fillStyle: 0,
  beginPath() {},
  arc() {},
  fill() {},
  drawImage() {},
  fillRect() {},
  globalCompositeOperation: 0,
};
const ctx = {
  window: {},
  document: { createElement: () => ({ getContext: () => g2d, width: 0, height: 0 }) },
  performance: { now: () => 0 },
};
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '#888' });
ctx.document.documentElement = {};
const load = (f) =>
  new Function('window', 'document', 'performance', 'matchMedia', readFileSync(f, 'utf8'))(
    ctx.window,
    ctx.document,
    ctx.performance,
    globalThis.matchMedia,
  );
load('js/grt-dir-core.js');
ctx.window.GRT = ctx.window.GRT;
globalThis.GRT = ctx.window.GRT;
load('js/grt-nebulae.js');
load('js/grt-vol-supernova.js');
load('js/grt-vol-mechhand.js');
globalThis.GRTNEB = ctx.window.GRTNEB;
load('js/grt-vols.js');
load('js/grt-field.js');
load('js/grt7-core.js');
const { NebVol, DataVol, GaiaVol } = ctx.window.GRT7;
globalThis.window = ctx.window;

function mkVol(kind) {
  if (kind === 'super') return new DataVol('super', 33, ctx.window.GRT_SUPERNOVA);
  if (kind === 'mech') return new DataVol('mech', 33, ctx.window.GRT_MECHHAND);
  if (ctx.window.GRTNEB[kind]) return new GaiaVol(kind, 33);
  return new NebVol(kind, 33);
}
function eyeAt(v, a, p = 0.15) {
  const R = v.orb,
    hr = Math.cos(p);
  return [
    R * hr * Math.cos(a),
    0.5 + 0.28 * Math.sin(0.6 * a) + R * Math.sin(p),
    R * hr * Math.sin(a),
  ];
}
function march(v, eye, W = 352, H = 242) {
  const E = v.grid,
    EX = v.EX,
    EY = v.EY,
    EZ = v.EZ,
    hx = v.he[0],
    hy = v.he[1],
    hz = v.he[2],
    expo = v.expo,
    M = 22,
    f = 1.05;
  const kx = (0.5 * EX) / hx,
    ky = (0.5 * EY) / hy,
    kz = (0.5 * EZ) / hz,
    X1 = EX - 1,
    Y1 = EY - 1,
    Z1 = EZ - 1;
  let fw = [-eye[0], -eye[1], -eye[2]];
  const fl = Math.hypot(...fw);
  fw = fw.map((q) => q / fl);
  let rt = [fw[2], 0, -fw[0]];
  const rl = Math.hypot(...rt);
  rt = rt.map((q) => q / rl);
  const up = [
    rt[1] * fw[2] - rt[2] * fw[1],
    rt[2] * fw[0] - rt[0] * fw[2],
    rt[0] * fw[1] - rt[1] * fw[0],
  ];
  const img = Buffer.alloc(W * H * 3);
  for (let j = 0; j < H; j++) {
    const vy = (H / 2 - (j + 0.5)) / (H * f);
    for (let i = 0; i < W; i++) {
      const vx = (i + 0.5 - W / 2) / (H * f);
      let dx = fw[0] + vx * rt[0] + vy * up[0],
        dy = fw[1] + vx * rt[1] + vy * up[1],
        dz = fw[2] + vx * rt[2] + vy * up[2];
      const nn = 1 / Math.hypot(dx, dy, dz);
      dx *= nn;
      dy *= nn;
      dz *= nn;
      const ax = (-hx - eye[0]) / dx,
        bx2 = (hx - eye[0]) / dx,
        ay = (-hy - eye[1]) / dy,
        by = (hy - eye[1]) / dy,
        az = (-hz - eye[2]) / dz,
        bz = (hz - eye[2]) / dz;
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
            x = eye[0] + dx * tk,
            y = eye[1] + dy * tk,
            z = eye[2] + dz * tk;
          if (kap) T *= Math.exp(-kap * v.dget(x, y, z) * dt);
          const i3 = Math.max(0, Math.min(X1, ((x + hx) * kx) | 0)),
            j3 = Math.max(0, Math.min(Y1, ((y + hy) * ky) | 0)),
            k3 = Math.max(0, Math.min(Z1, ((z + hz) * kz) | 0));
          const o3 = ((k3 * EY + j3) * EX + i3) * 3;
          ar += E[o3] * T * dt;
          ag += E[o3 + 1] * T * dt;
          ab += E[o3 + 2] * T * dt;
        }
      }
      const q = (j * W + i) * 3;
      img[q] = Math.min(255, 10 + 245 * (1 - Math.exp(-expo * Math.max(0, ar))));
      img[q + 1] = Math.min(255, 13 + 242 * (1 - Math.exp(-expo * Math.max(0, ag))));
      img[q + 2] = Math.min(255, 17 + 238 * (1 - Math.exp(-expo * Math.max(0, ab))));
    }
  }
  return img;
}
/* A/B mode: train the cache, bake it, march cache-vs-truth side by side.
   usage: node scripts/herojs.mjs train <kind> [iters] */
if (process.argv[2] === 'train') {
  const { CField } = ctx.window.GRT7;
  const kind = process.argv[3] || 'butterfly',
    IT = +(process.argv[4] || 1500);
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
  };
  const NDEF = { butterfly: 16000, ring: 16000, super: 16000, mech: 16000 };
  const v = mkVol(kind);
  v.rebuild();
  const F = new CField(v, NDEF[kind], 9, KO[kind]);
  for (let t = 0; t < IT; t++) F.step(88, t * 0.016);
  const CG = new Float32Array(v.EX * v.EY * v.EZ * 3);
  F.bakeTo(CG, v);
  let sE = 0,
    sC = 0;
  for (let i = 0; i < CG.length; i++) {
    sE += v.grid[i];
    sC += CG[i];
  }
  console.log(kind, 'iters', IT, 'grid-energy cache/truth =', (sC / sE).toFixed(3));
  let cC = 0,
    cT = 0,
    eC = 0;
  for (let i = 0; i < CG.length; i += 3) {
    const tl = v.grid[i] + v.grid[i + 1] + v.grid[i + 2],
      cl = CG[i] + CG[i + 1] + CG[i + 2];
    if (tl > 0.01) {
      cC += cl;
      cT += tl;
    } else eC += cl;
  }
  console.log(
    ' content cache/truth',
    (cC / cT).toFixed(3),
    ' spill/truth',
    (eC / (cT || 1)).toFixed(3),
  );
  const E0 = v.grid;
  for (const a of [0, 2.4]) {
    const it = march(v, eyeAt(v, a));
    v.grid = CG;
    const ic = march(v, eyeAt(v, a));
    v.grid = E0;
    const W = 352,
      H = 242,
      both = Buffer.alloc(W * 2 * H * 3);
    for (let j = 0; j < H; j++) {
      both.set(ic.subarray(j * W * 3, (j + 1) * W * 3), j * W * 2 * 3);
      both.set(it.subarray(j * W * 3, (j + 1) * W * 3), (j * W * 2 + W) * 3);
    }
    writeFileSync(
      `design/local/volshots/ab-${kind}-a${a.toFixed(1)}.ppm`,
      Buffer.concat([Buffer.from(`P6\n${W * 2} ${H}\n255\n`), both]),
    );
  }
  console.log(' wrote A/B (left cache | right truth)');
  process.exit(0);
}

const kinds = process.argv.slice(2).length ? process.argv.slice(2) : ['butterfly', 'ring'];
for (const kind of kinds) {
  const v = mkVol(kind);
  const t = Date.now();
  v.rebuild();
  console.log(kind, 'expo', v.expo.toFixed(2), 'rebuild', Date.now() - t, 'ms');
  for (const a of [0, 1.2, 2.4, 3.8, 5.0]) {
    const img = march(v, eyeAt(v, a));
    const p = `design/local/volshots/js-${kind}-a${a.toFixed(1)}.ppm`;
    writeFileSync(p, Buffer.concat([Buffer.from(`P6\n352 242\n255\n`), img]));
  }
  console.log(' wrote 5 views');
}
