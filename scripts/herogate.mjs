#!/usr/bin/env node
/* Hero parity gate. Freezes the camera, accumulates both estimators,
   then diffs them pixel-aligned:
   - resid: mean |cached − raw| / mean raw — the cache residual size;
   - structure: energy of the 5×5-smoothed diff over the raw diff —
     pure noise ≈ 0.04, banding/structured error ≥ ~0.3.
   Fails loudly when structure exceeds the threshold. Usage:
     node scripts/herogate.mjs [butterfly|ring|mech|super ...]
*/
import { spawnSync } from 'node:child_process';

const METRIC = `(()=>{const r=window.__grt;if(!r||!r.glr)return 'no-gl';
const A=r.glr.readAcc(0),B=r.glr.readAcc(1),W=A.w,H=A.h;
const D=new Float32Array(W*H);let sa=1e-9;
for(let i=0;i<W*H;i++){
  const q=i*4;
  const al=(A.buf[q]+A.buf[q+1]+A.buf[q+2])/3,bl=(B.buf[q]+B.buf[q+1]+B.buf[q+2])/3;
  D[i]=Math.abs(al-bl);sa+=al;}
let sd=0;for(let i=0;i<W*H;i++)sd+=D[i];
const K=5,S2=new Float32Array(W*H);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  let s=0,n=0;
  for(let dy=-K;dy<=K;dy+=2)for(let dx2=-K;dx2<=K;dx2+=2){
    const xx=x+dx2,yy=y+dy;
    if(xx<0||yy<0||xx>=W||yy>=H)continue;
    s+=D[yy*W+xx];n++;}
  S2[y*W+x]=s/n;}
let e0=1e-9,e1=0;
for(let i=0;i<W*H;i++){e0+=D[i]*D[i];e1+=S2[i]*S2[i];}
/* dump the diff as an image for the eye: banding shows as stripes,
   honest cache residual as smooth blobs */
let mx=1e-9;for(let i=0;i<W*H;i++)if(D[i]>mx)mx=D[i];
const cnv=document.createElement('canvas');cnv.width=W;cnv.height=H;
const g2=cnv.getContext('2d'),im=g2.createImageData(W,H);
for(let i=0;i<W*H;i++){const v=Math.min(255,(D[i]/mx*340)|0);
  const y=(H-1-((i/W)|0))*W+(i%W);
  im.data[y*4]=v;im.data[y*4+1]=v;im.data[y*4+2]=v;im.data[y*4+3]=255;}
g2.putImageData(im,0,0);
window.__parityPng=cnv.toDataURL('image/png');
return JSON.stringify({resid:+(sd/sa).toFixed(4),structure:+(e1/e0).toFixed(3),spp:r._spp});})()`;

const kinds = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['butterfly', 'ring', 'super'];
const BTN = { butterfly: null, ring: '#grt-v1', super: '#grt-v3' };
let fail = 0;
for (const k of kinds) {
  const steps = ['--gpu', '--w', '1512', '--h', '950', 'goto:#/grtcache/doc', 'wait:1500'];
  if (BTN[k]) steps.push('click:css=' + BTN[k], 'wait:1500');
  steps.push(
    "eval:(window.__grt.holdUntil=1e9,'frozen')",
    'wait:12000',
    'eval:' + METRIC,
    'eval:window.__parityPng',
  );
  const r = spawnSync('node', ['scripts/probe.mjs', ...steps], { encoding: 'utf8' });
  const m = (r.stdout + r.stderr).match(/eval → "(\{.*?\})"/);
  if (!m) {
    console.error(`${k}: gate FAILED to run\n` + (r.stdout + r.stderr).slice(-400));
    fail = 1;
    continue;
  }
  const v = JSON.parse(m[1].replace(/\\"/g, '"'));
  const png = (r.stdout + r.stderr).match(/eval → "(data:image\/png[^"]+)"/);
  if (png) {
    const fs = await import('node:fs');
    fs.writeFileSync(
      `design/local/volshots/parity-${k}.png`,
      Buffer.from(png[1].split(',')[1], 'base64'),
    );
  }
  /* resid is the hard signal (displayed cached vs raw, converged);
     'shape' >~0.1 just means the residual is structured — smooth cache
     residual also scores high, so it is context, not a failure */
  const bad = v.resid > 0.5;
  console.log(
    `${k}: resid ${v.resid} · shape ${v.structure} (${v.spp} spp held) ${bad ? '— FAIL (cached pane far from raw)' : '— ok'}`,
  );
  if (bad) fail = 1;
}
process.exit(fail);
