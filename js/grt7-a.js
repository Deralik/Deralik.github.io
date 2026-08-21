/* 7a — the render, explained. Hero = a seam at 1 spp, both sides REAL:
   right, an unbiased Monte Carlo estimator of the volume's radiance
   integral (one uniformly-sampled step per ray per frame — the noise is
   the estimator's own variance); left, the ray terminates into the
   trained cache and the pixel is the cache's own splatted answer — its
   residual error is genuine and fades as it trains. Both sides share one
   brief temporal accumulation and one luminance-matched exposure. */
(()=>{const{fit,loop,tok,star}=GRT;const{Cam2}=GRT2;const{box,RayAnim,CamView}=GRT6;const{NebVol,RealVol,CField,Meter,frustum}=GRT7;
const KO={super:{s0:.036,sv:.013,lsMin:-4.1,lsMax:-1.9,sMul:.86,relocLs:Math.log(.045)},crab:{s0:.038,sv:.014,lsMin:-4.0,lsMax:-1.8,sMul:.88,relocLs:Math.log(.048)},bh:{s0:.024,sv:.009,lsMin:-4.6,lsMax:-2.5,sMul:.78,relocLs:Math.log(.03)}};
const NDEF={super:3400,crab:3000,bh:4200};
class R7{
constructor(cv,o={}){this.cv=cv;this.o=o;this.az=.9;this.vols={};
this.cam=new Cam2(cv,.65,.28,4.6);this.cam.auto=.12;this._img=null;this.now=0;
this.cam.gate=e=>this.inImg(e);
this.oa=.9;this.uY=0;this.uP=0;this.imgDrag=false;this.holdUntil=-9;
this.su=.5;this.seamU=.5;this.seamUntil=-9;this.seamDrag=false;
this.mx=.6;this.nzc=null;this.calib=1;
this.view=new CamView(this.eyeAt(this.oa),1.05);
this.frameN=0;this.meter=new Meter(150);this.field=null;
this.retok();this.warm=GRT.figWarm;
let px2,py2;
cv.addEventListener('pointerdown',e=>{if(this.nearSeam(e)){this.seamDrag=true;cv.setPointerCapture(e.pointerId);return}
if(!this.inImg(e))return;this.imgDrag=true;px2=e.clientX;py2=e.clientY;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
cv.addEventListener('pointermove',e=>{const b=cv.getBoundingClientRect(),mx=e.clientX-b.left;
if(this.seamDrag){const R=this._img;if(R)this.seamU=Math.max(.15,Math.min(.85,(mx-R[0])/R[2]));this.seamUntil=this.now+4;return}
if(this.imgDrag){this.uY-=(e.clientX-px2)*.005;this.uP=Math.max(-1.05,Math.min(1.05,this.uP+(e.clientY-py2)*.004));px2=e.clientX;py2=e.clientY;return}
cv.style.cursor=this.nearSeam(e)?'col-resize':'grab'});
const up=()=>{if(this.seamDrag){this.seamDrag=false;this.seamUntil=this.now+4}
if(this.imgDrag){this.imgDrag=false;this.holdUntil=this.now+1.0;this.cv.style.cursor='grab'}};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
this.setVol('crab');
loop(cv,(t,dt)=>this.frame(t,dt))}
inImg(e){const b=this.cv.getBoundingClientRect(),mx=e.clientX-b.left,my=e.clientY-b.top,R=this._img;return!!(R&&mx>=R[0]&&mx<=R[0]+R[2]&&my>=R[1]&&my<=R[1]+R[3])}
nearSeam(e){const b=this.cv.getBoundingClientRect(),mx=e.clientX-b.left,my=e.clientY-b.top,R=this._img;
return!!(R&&my>=R[1]&&my<=R[1]+R[3]&&Math.abs(mx-(R[0]+this.su*R[2]))<12)}
eyeAt(a,p){p=p||0;const hr=Math.cos(p);return[2.1*hr*Math.cos(a),.5+.28*Math.sin(.6*a)+2.1*Math.sin(p),2.1*hr*Math.sin(a)]}
eyeCur(){return this.eyeAt(this.oa+this.uY,this.uP)}
setLight(){this.vol.light=[1.3*Math.cos(this.az),1.05,1.3*Math.sin(this.az)]}
setVol(kind){this.kind=kind;this.field=null;
this.vol=this.vols[kind]||(this.vols[kind]=(kind==='super'&&window.GRT_SUPERNOVA)?new RealVol(33):new NebVol(kind,33));
if(this.vol.em<.99)this.setLight();this.vol.rebuild();
const n=NDEF[kind];if(this.o.nEl)this.o.nEl.value=n;
this.st=this.vol.stipple(520);this.field=new CField(this.vol,n,9,KO[kind]);
this.anim=new RayAnim(this.vol,this.field,83);this.anim.eyeRef=()=>this.eyeCur();
if(this.o.azl)this.o.azl.textContent=this.vol.em>=.99?'Transfer function':'Light azimuth';
if(this.acc){this.acc.fill(0);this.cacc2.fill(0)}this.mx=.6;this.calib=1;this._cd=null;this._ps=undefined;this.meter.hist=[]}
march(iw,ih,t){const RW=96,RH=Math.max(24,Math.round(RW*ih/iw));
if(!this.nzc||this.nzH!==RH){this.nzc=document.createElement('canvas');this.nzc.width=RW;this.nzc.height=RH;this.nzH=RH;this.nzg=this.nzc.getContext('2d');this.nzd=this.nzg.createImageData(RW,RH);this.acc=new Float32Array(RW*RH*3);
/* the cache pane rasters at 2× — its splat render is continuous, unlike
   the per-pixel sample side, and deserves its real soft-field look */
this.czc=document.createElement('canvas');this.czc.width=RW*2;this.czc.height=RH*2;this.czg=this.czc.getContext('2d',{willReadFrequently:true});this.czd=this.czg.createImageData(RW*2,RH*2);this.cacc2=new Float32Array(RW*RH*12)}
const F=this.field;
if(!this._cd||this.frameN%3===0){F.drawCacheImage(this.czg,this.view,0,0,RW*2,RH*2,t);this._cd=this.czg.getImageData(0,0,RW*2,RH*2).data;this._cdN=true}
const cd=this._cd;
const v=this.vol,G=v.grid,R=v.RG,f=this.view.f,e=this.view.eye,fw=this.view.fwd,rt=this.view.right,up=this.view.up;
const D=this.nzd.data,A=this.acc,D2=this.czd.data,A2=this.cacc2,sc=1/(this.mx||.6),cal=this.calib;
let mx=this.mx*.995,sumT=0,sumC=0;
for(let j=0;j<RH;j++){const vy=(ih/2-(j+.5)/RH*ih)/(ih*f);
for(let i=0;i<RW;i++){const vx=((i+.5)/RW*iw-iw/2)/(ih*f);
let dx=fw[0]+vx*rt[0]+vy*up[0],dy=fw[1]+vx*rt[1]+vy*up[1],dz=fw[2]+vx*rt[2]+vy*up[2];
const nn=1/Math.hypot(dx,dy,dz);dx*=nn;dy*=nn;dz*=nn;
const bq=e[0]*dx+e[1]*dy+e[2]*dz,cq=e[0]*e[0]+e[1]*e[1]+e[2]*e[2]-2.25,disc=bq*bq-cq,o=(j*RW+i)*3,q=(j*RW+i)*4;
/* right — REAL 1 spp: one uniformly-sampled step, Horvitz-Thompson
   weighted (value × M·dt) — an unbiased estimate of the integral. The
   full march runs too, but ONLY to fix the exposure (a stable tone
   scale is not information about the estimate); the pixels shown are
   the noisy estimate, accumulating. */
let Ir=0,Ig=0,Ib=0,Fr=0,Fg=0,Fb=0;
if(disc>0){const t0=-bq-Math.sqrt(disc),t1=-bq+Math.sqrt(disc),M=16,dt=(t1-t0)/M,kS=(Math.random()*M)|0;
for(let k=0;k<M;k++){const tt=t0+(k+.5)*dt,p0=e[0]+dx*tt,p1=e[1]+dy*tt,p2=e[2]+dz*tt;
if(p0<=-1||p0>=1||p1<=-1||p1>=1||p2<=-1||p2>=1)continue;
const i2=(p0+1)/2*R|0,j2=(p1+1)/2*R|0,k2=(p2+1)/2*R|0,o2=((k2*R+j2)*R+i2)*3;
Fr+=G[o2]*dt;Fg+=G[o2+1]*dt;Fb+=G[o2+2]*dt;
if(k===kS){const w2=dt*M;Ir=G[o2]*w2;Ig=G[o2+1]*w2;Ib=G[o2+2]*w2}}}
const lu=(Fr+Fg+Fb)/3;if(lu>mx)mx=lu;
const tr=Math.pow(Math.min(4,Ir*sc),.85)*235,tg=Math.pow(Math.min(4,Ig*sc),.85)*235,tb=Math.pow(Math.min(4,Ib*sc),.85)*235;
/* slow accumulation: 1 spp/frame converging over a couple of seconds IS
   the story — path tracing is slow without the cache */
A[o]=A[o]*.85+.15*tr;A[o+1]=A[o+1]*.85+.15*tg;A[o+2]=A[o+2]*.85+.15*tb;
sumT+=Math.pow(Math.min(4,Fr*sc),.85)*235+Math.pow(Math.min(4,Fg*sc),.85)*235+Math.pow(Math.min(4,Fb*sc),.85)*235;
D[q]=Math.min(255,10+A[o]);D[q+1]=Math.min(255,13+A[o+1]);D[q+2]=Math.min(255,17+A[o+2]);D[q+3]=255;
}}
/* left — the ray terminates into the cache: the pane is the cache's own
   splat render (2× raster), luminance-matched to the estimator side (one
   exposure). No temporal filter here — the field itself evolves smoothly;
   its error is the cache's real residual, fading as it trains. Rewritten
   only when the raster refreshes. */
if(this._cdN){this._cdN=false;
const W2=RW*2,H2=RH*2;let rawC=0;
for(let p2=0;p2<W2*H2;p2++){const q=p2*4;
const r0=Math.max(0,cd[q]-10),g0=Math.max(0,cd[q+1]-13),b0=Math.max(0,cd[q+2]-17);rawC+=r0+g0+b0;
D2[q]=Math.min(255,10+r0*cal);D2[q+1]=Math.min(255,13+g0*cal);D2[q+2]=Math.min(255,17+b0*cal);D2[q+3]=255}
const tgt=rawC>1?Math.max(.3,Math.min(4,sumT*4/rawC)):1;this.calib=Math.max(.3,Math.min(4,this.calib*.9+.1*tgt));
this.czg.putImageData(this.czd,0,0)}
this.mx=mx;
this.nzg.putImageData(this.nzd,0,0)}
retok(){this.cw=tok('--well');this.cab=tok('--absence');this.conw=tok('--onwell');this.cacc=tok('--accw');this.mono=tok('--mono')}
frame(t,dt){const f=fit(this.cv);if(!f)return;this.retok();const{g,w,h}=f;this.frameN++;this.now=t;const F=this.field;
g.fillStyle=this.cw;g.fillRect(0,0,w,h);if(!F)return;
if(!this.cam.dr)this.cam.auto+=(.12-this.cam.auto)*Math.min(1,dt*1.2);
this.cam.step(dt);
const B=Math.max(40,Math.min(110,Math.round(150000/F.N)));F.step(B,t);if(dt<.022)F.step(B,t);
if(this.frameN%3===0){const p=F.psnr(24);this._ps=this._ps===undefined?p:this._ps*.85+.15*p;if(this.frameN%12===0)this.meter.push(this._ps)}
if(this.pendingAz!==undefined){const v2=this.pendingAz;this.pendingAz=undefined;if(this.vol.em>=.99)this.vol.tf=v2/6.28;else{this.az=v2;this.setLight()}this.gtDirty=true}
if(this.gtDirty&&this.frameN%5===0){this.vol.rebuild();F.refreshTruth();this.gtDirty=false}
if(this.frameN%60===0)F.refreshTruth();
const held=this.imgDrag||t<this.holdUntil,off=Math.abs(this.uY)+Math.abs(this.uP)>.012;
if(!held){if(off){const k=Math.exp(-2.4*dt);this.uY*=k;this.uP*=k}else{this.uY=this.uP=0;this.oa+=dt*.06}}
const eye=this.eyeCur();this.view.setEye(eye);
this.anim.maybeFire(t,eye);this.anim.update(t);
this.su=this.seamDrag||t<this.seamUntil?this.seamU:.5+.33*Math.sin(t*.22);
/* ≤560px: mobile is its own layout — render above, world below, meter last —
   never a squeezed desktop */
const stack=w<560;
let x0,y0,iw,ih,rx,rw,wy,wh;
if(stack){x0=8;y0=10;iw=w-16;ih=Math.round(h*.42);
  rx=4;rw=w-8;wy=y0+ih+26;wh=h-wy-88}
else{const split=w*.55;x0=12;y0=12;iw=split-24;ih=h-46;
  rx=split+6;rw=w-rx-6;wy=0;wh=h-130}
this._img=[x0,y0,iw,ih];
this.march(iw,ih,t);
const bx=x0+this.su*iw;
/* right: pixelated blit — discrete per-pixel samples look like what they
   are; left: smooth blit — the cache's splat render is continuous */
g.imageSmoothingEnabled=false;
g.save();g.beginPath();g.rect(bx,y0,x0+iw-bx,ih);g.clip();g.drawImage(this.nzc,x0,y0,iw,ih);g.restore();
g.imageSmoothingEnabled=true;
g.save();g.beginPath();g.rect(x0,y0,bx-x0,ih);g.clip();g.drawImage(this.czc,x0,y0,iw,ih);g.restore();
g.strokeStyle=GRT.alpha(GRT.figPaper,.65);g.lineWidth=1;g.beginPath();g.moveTo(bx+.5,y0);g.lineTo(bx+.5,y0+ih);g.stroke();
g.fillStyle=GRT.alpha(GRT.figPaper,.65);g.fillRect(bx-4,y0+ih/2-9,9,18);g.fillStyle=GRT.figWell;g.fillRect(bx-1.5,y0+ih/2-5,1,10);g.fillRect(bx+1.5,y0+ih/2-5,1,10);
g.strokeStyle=GRT.alpha(GRT.figPaper,.25);g.strokeRect(x0+.5,y0+.5,iw-1,ih-1);
const iv=stack?[104,74]:[150,105];
F.drawTruthImage(g,this.view,x0+iw-iv[0]-12,y0+10,iv[0],iv[1]);g.strokeRect(x0+iw-iv[0]-12.5,y0+9.5,iv[0]+1,iv[1]+1);
g.fillStyle=this.cab;g.font='500 8.5px '+this.mono;
g.fillText(GRT.elide(g,'THE TRUTH FIELD',iv[0]+10),x0+iw-iv[0]-12,y0+iv[1]+23);
g.fillText(this.imgDrag?'CAMERA — IN YOUR HAND':held||off?'CAMERA — RETURNING TO ORBIT':'CAMERA — ORBITING',x0+8,y0+16);
g.fillText(GRT.elide(g,stack?'WITH CACHE — 1 SPP':'WITH THE CACHE — 1 SPP, TERMINATED INTO IT',iw*.48),x0+8,y0+ih-10);
const wl=GRT.elide(g,stack?'WITHOUT — 1 SPP':'WITHOUT — 1 SPP, ACCUMULATING',iw*.48);g.fillText(wl,x0+iw-8-g.measureText(wl).width,y0+ih-10);
g.fillText(GRT.elide(g,'THE RENDER — DRAG THE SEAM TO COMPARE · DRAG ELSEWHERE TO MOVE THE CAMERA',iw),x0,y0+ih+14);
const pr=this.cam.proj(),S=Math.min(rw,wh)*.60,cx=rx+rw/2,cy=wy+wh*.52,px=p=>{const q=pr(p);return[cx+q[0]*S,cy-q[1]*S,q[2]]};
g.save();g.beginPath();g.rect(rx,wy,rw,wh);g.clip();
box(g,px);for(const s of this.st){const p=px(s);g.globalAlpha=.04+.10*s[3];g.fillStyle=GRT.figPaper;g.fillRect(p[0],p[1],1.3,1.3)}g.globalAlpha=1;
F.draw(g,px,S,t);
this.anim.draw(g,px,S,t,false,this.conw,this.warm,'TRAINING RAY');
if(this.vol.em<.99){this.anim.drawNees(g,px,this.vol.light,t,this.warm);const lp=px(this.vol.light);star(g,lp[0],lp[1],6,this.warm)}
const ep=px(eye);g.strokeStyle=this.conw;g.lineWidth=1.2;g.strokeRect(ep[0]-4,ep[1]-4,8,8);
frustum(g,px,eye,this.view,(iw/2)/(ih*1.05),.5/1.05,1.55,GRT.alpha(GRT.figPaper,.20));
g.fillStyle=this.cab;g.font='500 8.5px '+this.mono;g.fillText('CAMERA',Math.min(ep[0]-6,rx+rw-48),ep[1]+17);
if(this.anim.stats)g.fillText(GRT.elide(g,this.anim.stats,rw-12),rx+6,wy+14);
g.fillText(GRT.elide(g,'THE WORLD — THE CACHE AS SOFT SPLATS · TOUCHED GAUSSIANS FLASH · GRAB TO TURN',rw-12),rx+6,wy+wh-8);
g.restore();
this.meter.draw(g,rx+6,wy+wh+10,rw-12,66,'THE CACHE — PSNR VS TRUTH FIELD · HIGHER IS BETTER',this.mono,v=>v.toFixed(1)+' dB');
const ui=this.o.ui;if(ui&&this.frameN%10===0)ui.textContent='iter '+F.iter+' · '+F.N+' gaussians · '+this.kind}
}
window.GRT7A=R7;})();
