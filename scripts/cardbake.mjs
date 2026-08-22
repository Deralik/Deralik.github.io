/* Bakes the D0 card's PLACEHOLDER cache (owner 2026-08-22): a trained
   butterfly field snapshot — splat positions/colours/sizes, stipple
   backdrop, and pre-generated training-ray paths — written to
   js/grt-card-cache.js so the card renders instantly with zero build
   or training cost. The live shared field replaces it when the worker
   finishes. usage: node scripts/cardbake.mjs */
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
  performance: { now: () => Date.now() },
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
globalThis.GRT = ctx.window.GRT;
load('js/grt-nebulae.js');
globalThis.GRTNEB = ctx.window.GRTNEB;
load('js/grt-vols.js');
load('js/grt-field.js');
load('js/grt7-core.js');
load('js/grt6-core.js');
const { GaiaVol, CField } = ctx.window.GRT7;
const { RayAnim } = ctx.window.GRT6;
globalThis.window = ctx.window;

const vol = new GaiaVol('butterfly', 33);
vol.rebuild();
const KO = {
  s0: 0.026,
  sv: 0.009,
  lsMin: -4.5,
  lsMax: -2.4,
  sMul: 0.85,
  relocLs: Math.log(0.03),
  ad: true,
};
const F = new CField(vol, 12000, 9, KO);
for (let i = 0; i < 5000; i++) F.step(120, i * 0.016);
console.log('trained iters', F.iter);

/* splats: draw-ready — pos (i16/2048 per unit), size (u8/1000),
   tint rgb (u8) + alpha (u8/255), dim ones dropped, capped at 7000 */
const keep = [];
for (let i = 0; i < F.N; i++) {
  const lum = (F.cr[i] + F.cg[i] + F.cb[i]) / 3,
    a = Math.min(0.85, lum * (F.vg || 1) * 1.35);
  if (a >= 0.05) keep.push([i, a]);
}
keep.sort((x, y) => y[1] - x[1]);
const M = Math.min(7000, keep.length),
  pos = new Int16Array(M * 3),
  sz = new Uint8Array(M),
  col = new Uint8Array(M * 4);
for (let m = 0; m < M; m++) {
  const [i, a] = keep[m];
  pos[m * 3] = Math.round(F.gx[i] * 2048);
  pos[m * 3 + 1] = Math.round(F.gy[i] * 2048);
  pos[m * 3 + 2] = Math.round(F.gz[i] * 2048);
  sz[m] = Math.min(255, Math.round(Math.exp(F.ls[i]) * 1000));
  const mx = Math.max(F.cr[i], F.cg[i], F.cb[i], 1e-4);
  col[m * 4] = Math.round((F.cr[i] / mx) * 255);
  col[m * 4 + 1] = Math.round((F.cg[i] / mx) * 255);
  col[m * 4 + 2] = Math.round((F.cb[i] / mx) * 255);
  col[m * 4 + 3] = Math.round(a * 255);
}

/* stipple backdrop */
const st = vol.stipple(240).map((s) => s.map((v) => +v.toFixed(3)));

/* pre-generated training-ray paths (fire() guarantees >=1 bounce) */
const anim = new RayAnim(vol, F, 83),
  rays = [];
let guard = 0;
while (rays.length < 14 && guard++ < 400) {
  const th = Math.random() * 6.283,
    ph = (Math.random() - 0.5) * 1.1,
    eye = [
      3.6 * Math.cos(ph) * Math.cos(th),
      3.6 * Math.sin(ph),
      3.6 * Math.cos(ph) * Math.sin(th),
    ];
  anim.paths.length = 0;
  anim.fire(0, eye);
  if (anim.paths.length) {
    const P = anim.paths[0];
    rays.push(P.V.map((v) => v.map((x) => +x.toFixed(3))));
  }
}
console.log('splats', M, 'rays', rays.length);

const b64 = (ta) => Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength).toString('base64');
const out = `/* PRE-GENERATED placeholder for the D0 card's cache view — a trained
   butterfly field snapshot baked by scripts/cardbake.mjs. Honest label
   lives with the card: the LIVE shared field replaces this the moment
   the background build finishes; no training happens on this data. */
window.GRT_CARD = {
  n: ${M},
  pos: '${b64(pos)}',
  sz: '${b64(sz)}',
  col: '${b64(col)}',
  st: ${JSON.stringify(st)},
  rays: ${JSON.stringify(rays)},
};
`;
writeFileSync('js/grt-card-cache.js', out);
console.log('wrote js/grt-card-cache.js', (out.length / 1024).toFixed(0) + 'KB');
