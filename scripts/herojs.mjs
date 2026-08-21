/* JS-exact offline renders of the hero's truth field: loads the real site
   files (grt-dir-core rng, grt-nebulae, grt7-core), rebuilds a volume, and
   marches its EMIT grid exactly like js/grt7-a.js — writes PPMs so TF and
   glow tuning is verified against reference images before any browser run.
   usage: node scripts/herojs.mjs [kinds...]   (default: butterfly ring) */
import {readFileSync,writeFileSync} from 'fs';
const ctx={window:{},document:{createElement:()=>({getContext:()=>null,width:0,height:0})},performance:{now:()=>0}};
globalThis.matchMedia=()=>({matches:false,addEventListener(){}});
globalThis.getComputedStyle=()=>({getPropertyValue:()=>'#888'});
ctx.document.documentElement={};
const load=f=>new Function('window','document','performance','matchMedia',readFileSync(f,'utf8'))(ctx.window,ctx.document,ctx.performance,globalThis.matchMedia);
load('js/grt-dir-core.js');
ctx.window.GRT=ctx.window.GRT; globalThis.GRT=ctx.window.GRT;
load('js/grt-nebulae.js');
load('js/grt-vol-supernova.js');
load('js/grt-vol-mechhand.js');
globalThis.GRTNEB=ctx.window.GRTNEB;
load('js/grt7-core.js');
const {NebVol,DataVol,GaiaVol}=ctx.window.GRT7;
globalThis.window=ctx.window;

function mkVol(kind){
  if(kind==='super')return new DataVol('super',33,ctx.window.GRT_SUPERNOVA);
  if(kind==='mech')return new DataVol('mech',33,ctx.window.GRT_MECHHAND);
  if(ctx.window.GRTNEB[kind])return new GaiaVol(kind,33);
  return new NebVol(kind,33);
}
function eyeAt(v,a,p=0.15){const R=v.orb,hr=Math.cos(p);
  return[R*hr*Math.cos(a),.5+.28*Math.sin(.6*a)+R*Math.sin(p),R*hr*Math.sin(a)]}
function march(v,eye,W=352,H=242){
  const E=v.grid,EX=v.EX,EY=v.EY,EZ=v.EZ,hx=v.he[0],hy=v.he[1],hz=v.he[2],expo=v.expo,M=22,f=1.05;
  const kx=.5*EX/hx,ky=.5*EY/hy,kz=.5*EZ/hz,X1=EX-1,Y1=EY-1,Z1=EZ-1;
  let fw=[-eye[0],-eye[1],-eye[2]];const fl=Math.hypot(...fw);fw=fw.map(q=>q/fl);
  let rt=[fw[2],0,-fw[0]];const rl=Math.hypot(...rt);rt=rt.map(q=>q/rl);
  const up=[rt[1]*fw[2]-rt[2]*fw[1],rt[2]*fw[0]-rt[0]*fw[2],rt[0]*fw[1]-rt[1]*fw[0]];
  const img=Buffer.alloc(W*H*3);
  for(let j=0;j<H;j++){const vy=(H/2-(j+.5))/(H*f);
  for(let i=0;i<W;i++){const vx=((i+.5)-W/2)/(H*f);
  let dx=fw[0]+vx*rt[0]+vy*up[0],dy=fw[1]+vx*rt[1]+vy*up[1],dz=fw[2]+vx*rt[2]+vy*up[2];
  const nn=1/Math.hypot(dx,dy,dz);dx*=nn;dy*=nn;dz*=nn;
  const ax=(-hx-eye[0])/dx,bx2=(hx-eye[0])/dx,ay=(-hy-eye[1])/dy,by=(hy-eye[1])/dy,az=(-hz-eye[2])/dz,bz=(hz-eye[2])/dz;
  const t0=Math.max(Math.min(ax,bx2),Math.min(ay,by),Math.min(az,bz),0);
  const t1=Math.min(Math.max(ax,bx2),Math.max(ay,by),Math.max(az,bz));
  let ar=0,ag=0,ab=0;
  if(t1>t0){const dt=(t1-t0)/M;
  for(let k=0;k<M;k++){const tk=t0+(k+.5)*dt,x=eye[0]+dx*tk,y=eye[1]+dy*tk,z=eye[2]+dz*tk;
  const i3=Math.max(0,Math.min(X1,(x+hx)*kx|0)),j3=Math.max(0,Math.min(Y1,(y+hy)*ky|0)),k3=Math.max(0,Math.min(Z1,(z+hz)*kz|0));
  const o3=((k3*EY+j3)*EX+i3)*3;
  ar+=E[o3]*dt;ag+=E[o3+1]*dt;ab+=E[o3+2]*dt}}
  const q=(j*W+i)*3;
  img[q]=Math.min(255,10+245*(1-Math.exp(-expo*Math.max(0,ar))));
  img[q+1]=Math.min(255,13+242*(1-Math.exp(-expo*Math.max(0,ag))));
  img[q+2]=Math.min(255,17+238*(1-Math.exp(-expo*Math.max(0,ab))));}}
  return img;
}
const kinds=process.argv.slice(2).length?process.argv.slice(2):['butterfly','ring'];
for(const kind of kinds){
  const v=mkVol(kind);const t=Date.now();v.rebuild();
  console.log(kind,'expo',v.expo.toFixed(2),'rebuild',Date.now()-t,'ms');
  for(const a of[0,1.2,2.4,3.8,5.0]){
    const img=march(v,eyeAt(v,a));
    const p=`design/local/volshots/js-${kind}-a${a.toFixed(1)}.ppm`;
    writeFileSync(p,Buffer.concat([Buffer.from(`P6\n352 242\n255\n`),img]));
  }
  console.log(' wrote 5 views');
}
