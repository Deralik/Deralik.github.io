/* GRT round 2 — shared: grab-orbit camera (inverted, inertial), tinted sprites,
   Field3 (trainable 3D gaussian field w/ add / micro-train / lenses), loss spark. */
window.GRT2=(()=>{
const{rng,fit,cmap,css}=GRT;
function sprites(){const base=document.createElement('canvas');base.width=base.height=64;const bg=base.getContext('2d'),gr=bg.createRadialGradient(32,32,1,32,32,31);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.42,'rgba(255,255,255,.42)');gr.addColorStop(1,'rgba(255,255,255,0)');bg.fillStyle=gr;bg.beginPath();bg.arc(32,32,31,0,6.283);bg.fill();
const out=[];for(let k=0;k<14;k++){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.drawImage(base,0,0);g.globalCompositeOperation='source-in';const col=cmap(.14+.86*k/13);g.fillStyle=`rgb(${col[0]},${col[1]},${col[2]})`;g.fillRect(0,0,64,64);out.push(c)}return out}
/* grab the volume: drag moves the object (inverted from round 1), release keeps momentum */
class Cam2{constructor(cv,yaw,pitch,dist){this.yaw=yaw;this.pitch=pitch;this.dist=dist;this.auto=.05;this.vx=0;this.vy=0;this.dr=false;this.gate=null;
if(cv){cv.style.cursor='grab';let px,py;
cv.addEventListener('pointerdown',e=>{if(this.gate&&this.gate(e))return;this.dr=true;this.auto=0;this.vx=this.vy=0;px=e.clientX;py=e.clientY;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
cv.addEventListener('pointermove',e=>{if(!this.dr)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;this.yaw-=dx*.008;this.pitch=Math.max(-1.15,Math.min(1.15,this.pitch-dy*.006));this.vx=.5*this.vx-.5*dx*.008;this.vy=.5*this.vy-.5*dy*.006});
const up=()=>{this.dr=false;cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up)}}
step(dt){this.yaw+=this.auto*dt;if(!this.dr){this.yaw+=this.vx;this.pitch=Math.max(-1.15,Math.min(1.15,this.pitch+this.vy));this.vx*=.90;this.vy*=.90}}
proj(){const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),D=this.dist;return p=>{const x=p[0]*cy+p[2]*sy,z0=-p[0]*sy+p[2]*cy,y=p[1]*cp-z0*sp,z=p[1]*sp+z0*cp+D,s=1.85/z;return[x*s,y*s,s,z]}}
eye(){const cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),D=this.dist;return[D*cp*sy,-D*sp,-D*cp*cy]}
ray(a,b){const cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),cy=Math.cos(this.yaw),sy=Math.sin(this.yaw);let x=a/1.85,y=b/1.85,z=1;const n=Math.hypot(x,y,z);x/=n;y/=n;z/=n;const y2=y*cp+z*sp,z2=-y*sp+z*cp;return[cy*x-sy*z2,y2,sy*x+cy*z2]}}
/* Field3 — isotropic world-space gaussians trained by SGD against vol.gt.
   Real loop: sample → error → update; starved primitives relocate (recorded). */
class Field3{
constructor(vol,N,seed,opts){this.vol=vol;this.opt=Object.assign({s0:.10,sv:.03,lsMin:-3.1,lsMax:-1.27,sMul:1.15,relocLs:Math.log(.11)},opts||{});this.rand=rng(seed||17);this.S=vol.samples(2400);this.spr=sprites();this.relocOn=true;this.lastReloc=null;this.wmax=.3;this.alloc(N);
this.tp=vol.samples(1500);this.tv=new Float32Array(this.tp.length);this.refreshTruth()}
alloc(N){this.N=N;this.gx=new Float32Array(N);this.gy=new Float32Array(N);this.gz=new Float32Array(N);this.ls=new Float32Array(N);this.w=new Float32Array(N);this.pulse=new Float32Array(N).fill(-9);
for(let i=0;i<N;i++)this.seed(i);this.hb(N);this.iter=0;this.loss=1}
seed(i){const p=this.vol.shellInit();this.gx[i]=p[0];this.gy[i]=p[1];this.gz[i]=p[2];this.ls[i]=Math.log(this.opt.s0+this.opt.sv*this.rand());this.w[i]=.05}
hb(N){this.hI=new Int32Array(N);this.hG=new Float32Array(N);this.hQ=new Float32Array(N);this.hX=new Float32Array(N);this.hY=new Float32Array(N);this.hZ=new Float32Array(N);this.hS=new Float32Array(N)}
add(n,now){const M=this.N+n,cp=a=>{const b=new Float32Array(M);b.set(a);return b};
this.gx=cp(this.gx);this.gy=cp(this.gy);this.gz=cp(this.gz);this.ls=cp(this.ls);this.w=cp(this.w);const pu=new Float32Array(M).fill(-9);pu.set(this.pulse);this.pulse=pu;
const N0=this.N;this.N=M;for(let i=N0;i<M;i++){this.seed(i);this.pulse[i]=now||0}this.hb(M)}
setN(n,now){if(n>this.N)this.add(n-this.N,now);else if(n<this.N){this.N=n;this.gx=this.gx.slice(0,n);this.gy=this.gy.slice(0,n);this.gz=this.gz.slice(0,n);this.ls=this.ls.slice(0,n);this.w=this.w.slice(0,n);this.pulse=this.pulse.slice(0,n);this.hb(n)}}
refreshTruth(){for(let i=0;i<this.tp.length;i++)this.tv[i]=this.vol.gt(this.tp[i])}
err(n){const M=Math.min(n||300,this.tp.length);let a=0,b=0;for(let k=0;k<M;k++){const i=(this.rand()*this.tp.length)|0,t=this.tv[i];a+=Math.abs(Math.max(0,this.pred(this.tp[i]))-t);b+=t}return a/Math.max(1e-6,b)}
pred(p){let s=0;for(let i=0;i<this.N;i++){const dx=p[0]-this.gx[i],dy=p[1]-this.gy[i],dz=p[2]-this.gz[i],sg=Math.exp(this.ls[i]),r=3*sg,d2=dx*dx+dy*dy+dz*dz;if(d2>r*r)continue;const q=d2/(sg*sg);if(q<11)s+=this.w[i]*Math.exp(-.5*q)}return s}
one(x,y,z,dk,now,flash,out){const tgt=this.vol.gt([x,y,z]);let pr=0,nh=0;
for(let i=0;i<this.N;i++){const dx=x-this.gx[i],dy=y-this.gy[i],dz=z-this.gz[i],s=Math.exp(this.ls[i]),r=3*s,d2=dx*dx+dy*dy+dz*dz;if(d2>r*r)continue;const q=d2/(s*s);if(q>11)continue;
const G=Math.exp(-.5*q);pr+=this.w[i]*G;this.hI[nh]=i;this.hG[nh]=G;this.hQ[nh]=q;this.hX[nh]=dx;this.hY[nh]=dy;this.hZ[nh]=dz;this.hS[nh]=s;nh++}
const e=pr-tgt;
for(let h=0;h<nh;h++){const i=this.hI[h],G=this.hG[h],s=this.hS[h],wG=this.w[i]*G,k=dk*.016*e*wG/(s*s);
this.w[i]-=dk*.09*e*G;if(this.w[i]<0)this.w[i]=0;else if(this.w[i]>2)this.w[i]=2;
this.gx[i]-=k*this.hX[h];this.gy[i]-=k*this.hY[h];this.gz[i]-=k*this.hZ[h];
this.ls[i]-=dk*.026*e*wG*this.hQ[h];
if(this.ls[i]<this.opt.lsMin)this.ls[i]=this.opt.lsMin;else if(this.ls[i]>this.opt.lsMax)this.ls[i]=this.opt.lsMax;
if(flash&&G>.35){this.pulse[i]=now;out&&out.add(i)}}
return e*e}
step(B,now){let L=0;const dk=1/(1+this.iter/1400);
for(let b=0;b<B;b++){const p=this.S[(this.rand()*this.S.length)|0];L+=this.one(p[0]+.05*(this.rand()-.5),p[1]+.05*(this.rand()-.5),p[2]+.05*(this.rand()-.5),dk,now,false)}
this.loss=this.loss*.96+.04*(L/B);this.iter++;
if(this.relocOn)for(let k=0;k<4;k++){const i=(this.rand()*this.N)|0;
if(this.w[i]<.02&&this.rand()<.2){const from=[this.gx[i],this.gy[i],this.gz[i]],p=this.vol.shellInit();this.gx[i]=p[0];this.gy[i]=p[1];this.gz[i]=p[2];this.w[i]=.03;this.ls[i]=this.opt.relocLs;this.pulse[i]=now;this.lastReloc={from,to:p,t0:now}}
else if(this.w[i]<.05){this.gx[i]+=.006*(this.rand()-.5);this.gy[i]+=.006*(this.rand()-.5);this.gz[i]+=.006*(this.rand()-.5)}}}
micro(p,now,out){const dk=1/(1+this.iter/1400);for(let k=0;k<8;k++)this.one(p[0]+.06*(this.rand()-.5),p[1]+.06*(this.rand()-.5),p[2]+.06*(this.rand()-.5),dk,now,true,out)}
drawTruth(g,px,S){g.globalCompositeOperation='lighter';
for(let i=0;i<this.tp.length;i++){const v=this.tv[i];if(v<.04)continue;const p=px(this.tp[i]),sz=.072*p[2]*S*(.55+.45*v);
g.globalAlpha=Math.min(.42,v*.58+.01);g.drawImage(this.spr[Math.min(13,(v*13)|0)],p[0]-sz,p[1]-sz,sz*2,sz*2)}
g.globalAlpha=1;g.globalCompositeOperation='source-over'}
draw(g,px,S,mode,now,cull){let wm=.05;for(let i=0;i<this.N;i++)if(this.w[i]>wm)wm=this.w[i];this.wmax=this.wmax*.9+.1*wm;
if(mode==='field'){g.globalCompositeOperation='lighter';
for(let i=0;i<this.N;i++){const pb=this.pulse[i]>0?Math.exp(-(now-this.pulse[i])*2.5):0,a=Math.min(.85,this.w[i]*1.3+.5*pb);if(a<.02)continue;
const p=px([this.gx[i],this.gy[i],this.gz[i]]),sz=Math.exp(this.ls[i])*p[2]*S*this.opt.sMul*(1+.4*pb);
g.globalAlpha=a;g.drawImage(this.spr[Math.min(13,(this.w[i]/this.wmax*13)|0)],p[0]-sz,p[1]-sz,sz*2,sz*2)}
g.globalAlpha=1;g.globalCompositeOperation='source-over'}
else{g.globalCompositeOperation='lighter';
for(let i=0;i<this.N;i++){if(cull&&this.w[i]<cull*this.wmax)continue;const t=Math.min(1,this.w[i]/this.wmax),pb=this.pulse[i]>0?Math.exp(-(now-this.pulse[i])*2.5):0,p=px([this.gx[i],this.gy[i],this.gz[i]]),sz=Math.exp(this.ls[i])*p[2]*S;
g.globalAlpha=Math.min(.75,.14+.5*t+.5*pb);g.drawImage(this.spr[Math.min(13,(t*13)|0)],p[0]-sz*1.4,p[1]-sz*1.4,sz*2.8,sz*2.8)}
g.globalAlpha=1;g.globalCompositeOperation='source-over';
for(let i=0;i<this.N;i++){if(cull&&this.w[i]<cull*this.wmax)continue;const t=Math.min(1,this.w[i]/this.wmax),pb=this.pulse[i]>0?Math.exp(-(now-this.pulse[i])*2.5):0,p=px([this.gx[i],this.gy[i],this.gz[i]]),sz=Math.exp(this.ls[i])*p[2]*S;
g.globalAlpha=.30+.45*t+.25*pb;g.strokeStyle=css(.15+.85*t);g.lineWidth=.9+.9*pb;g.beginPath();g.arc(p[0],p[1],Math.max(1,sz),0,6.283);g.stroke();g.fillStyle=g.strokeStyle;g.fillRect(p[0]-.8,p[1]-.8,1.6,1.6)}
g.globalAlpha=1}}
}
function spark(cv,hist){const f=fit(cv);if(!f||!hist.length)return;const{g,w,h}=f;g.clearRect(0,0,w,h);
let mn=1e9,mx=-1e9;for(const v of hist){const l=Math.log10(Math.max(1e-8,v));if(l<mn)mn=l;if(l>mx)mx=l}if(mx-mn<.2)mx=mn+.2;
g.strokeStyle=GRT.tok('--accw')||'#E8A24C';g.lineWidth=1;g.beginPath();
hist.forEach((v,i)=>{const x=i/(hist.length-1||1)*(w-4)+2,y=h-2-(Math.log10(Math.max(1e-8,v))-mn)/(mx-mn)*(h-4);g[i?'lineTo':'moveTo'](x,y)});g.stroke()}
return{sprites,Cam2,Field3,spark};})();
