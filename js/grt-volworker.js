/* Volume builder worker — the heavy voxel math (density grid, light
   field, emission bake, calibration) runs OFF the main thread; the page
   receives the finished arrays and injects them into a constructed
   volume. The rng stub must match js/grt-dir-core.js bit for bit. */
self.window = self;
self.GRT = {
  rng: (s) => () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; /* privacy-ok: 2^32 rng divisor */
  },
};
importScripts('grt-nebulae.js', 'grt-vol-supernova.js', 'grt-vols.js');
const { NebVol, GaiaVol, DataVol } = self.GRTVOLS;
self.onmessage = (e) => {
  const kind = e.data;
  const vol =
    kind === 'super' && self.GRT_SUPERNOVA
      ? new DataVol('super', 33, self.GRT_SUPERNOVA)
      : self.GRTNEB && self.GRTNEB[kind]
        ? new GaiaVol(kind, 33)
        : new NebVol(kind, 33);
  vol.rebuild();
  /* rejection sampling against the analytic density is main-thread
     poison (~50k sig evals) — ship the pools and stipples too */
  const pk = (arr, w) => {
    const f = new Float32Array(arr.length * w);
    for (let i = 0; i < arr.length; i++) for (let c = 0; c < w; c++) f[i * w + c] = arr[i][c];
    return f;
  };
  const S3 = pk(vol.samples(3400), 3),
    T520 = pk(vol.stipple(520), 4),
    T240 = pk(vol.stipple(240), 4);
  const P = {
    S3,
    T520,
    T240,
    kind,
    D: vol.D,
    DR: vol.DR,
    grid: vol.grid,
    gmax: vol.gmax,
    cDe: vol.cDe,
    cAo: vol.cAo,
    cSt: vol.cSt,
    aoT: vol.aoT,
    aoN: vol.aoN,
    cb: vol.cb,
    expo: vol.expo,
    ctr: vol.ctr,
  };
  const bufs = [];
  for (const k of ['D', 'grid', 'cDe', 'cAo', 'cSt', 'aoT', 'S3', 'T520', 'T240'])
    if (P[k] && bufs.indexOf(P[k].buffer) < 0) bufs.push(P[k].buffer);
  postMessage(P, bufs);
};
