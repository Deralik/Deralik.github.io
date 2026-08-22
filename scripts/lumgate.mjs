#!/usr/bin/env node
/* Hero brightness gate — the LIVE pane, not an offline proxy.
   Holds the camera, accumulates the raw estimator, reads the linear
   accumulation back, applies the dataset's own display transform
   (vol.expo + vol.tone), and compares object-pixel display-luminance
   stats against the research repo's reference figures. Exists because
   "the hand is too bright" recurred across rounds while offline checks
   passed — brightness claims now carry a hard gate. Usage:
     node scripts/lumgate.mjs [mech|super ...]
*/
import { spawnSync } from 'node:child_process';

/* reference_convergence_figures/<k>_radiance_scale_pair.png, native
   panel, object mask lum>0.06 (see RULINGS round 16) */
const REF = {
  mech: { median: 0.823, p90: 0.925 },
  super: { median: 0.864, p90: 0.91 },
};
const BTN = { mech: '#grt-v2', super: '#grt-v3' };

const METRIC = `(()=>{const r=window.__grt;if(!r||!r.glr)return 'no-gl';
const A=r.glr.readAcc(0),W=A.w,H=A.h,v=r.vol;
const srgb=(x)=>{const m=x/(1+x);return m<=0.0031308?12.92*m:1.055*Math.pow(m,1/2.4)-0.055};
const crv=v.tone?srgb:(x)=>1-Math.exp(-x);
const vals=[];
for(let i=0;i<W*H;i++){const q=i*4;
  const dr=crv(v.expo*Math.max(0,A.buf[q])),dg=crv(v.expo*Math.max(0,A.buf[q+1])),db=crv(v.expo*Math.max(0,A.buf[q+2]));
  const lu=.2126*dr+.7152*dg+.0722*db;
  if(lu>.06)vals.push(lu);}
vals.sort((a,b)=>a-b);
const pick=(p)=>vals.length?vals[Math.min(vals.length-1,Math.floor(vals.length*p))]:0;
return JSON.stringify({median:+pick(.5).toFixed(3),p90:+pick(.9).toFixed(3),n:vals.length,spp:r._spp});})()`;

const kinds = process.argv.slice(2).length ? process.argv.slice(2) : ['mech', 'super'];
let fail = 0;
for (const k of kinds) {
  const steps = [
    '--gpu',
    '--w',
    '1512',
    '--h',
    '950',
    'goto:#/grtcache/doc',
    'wait:1500',
    'click:css=' + BTN[k],
    'wait:2500',
    "eval:(window.__grt.holdUntil=1e9,'frozen')",
    'wait:8000',
    'eval:' + METRIC,
  ];
  const r = spawnSync('node', ['scripts/probe.mjs', ...steps], { encoding: 'utf8' });
  const m = (r.stdout + r.stderr).match(/eval → "(\{.*?\})"/);
  if (!m) {
    console.error(`${k}: lumgate FAILED to run\n` + (r.stdout + r.stderr).slice(-300));
    fail = 1;
    continue;
  }
  const v = JSON.parse(m[1].replace(/\\"/g, '"'));
  const ref = REF[k];
  const bad = Math.abs(v.median - ref.median) > 0.12 || v.p90 > ref.p90 + 0.06;
  console.log(
    `${k}: median ${v.median} (ref ${ref.median}) · p90 ${v.p90} (ref ${ref.p90}) · ${v.spp} spp ${bad ? '— FAIL (off the reference figure)' : '— ok'}`,
  );
  if (bad) fail = 1;
}
process.exit(fail);
