/* Round 7 shared — Nova volume (structured shells + filaments + ejecta),
   in-figure error meter, deterministic per-pixel path replay, frustum. */
window.GRT7=(()=>{
const{rng,tok}=GRT;const sq=v=>v*v;
const SIZES={s0:.052,sv:.018,lsMin:-3.66,lsMax:-1.55,sMul:.92,relocLs:Math.log(.06)};
class Nova{
constructor(seed){this.r=rng(seed||7);this.RG=24;this.grid=new Float32Array(this.RG**3);this.gmax=1;this.light=[1.15,1.05,.45];
this.knots=[];for(let i=0;i<9;i++){const th=this.r()*6.283,ph=Math.acos(2*this.r()-1),rr=.55+.33*this.r();
this.knots.push([rr*Math.sin(ph)*Math.cos(th),rr*Math.cos(ph)*.85,rr*Math.sin(ph)*Math.sin(th),.09+.07*this.r(),.55+.6*this.r()])}}
sig(x,y,z){const ys=y*1.18,r=Math.sqrt(x*x+ys*ys+z*z);if(r>1.22)return 0;
const ir=1/(r+1e-4),dx=x*ir,dy=ys*ir,dz=z*ir;
const f1=Math.sin(7.2*dx+4.1*dz+1.7)*Math.sin(6.3*dy-2.6*dx+.6),f2=Math.sin(13.4*dz-9.1*dy+3.9)*Math.sin(11.2*dx+9.6*dz-1.2);
const fil=Math.max(0,.18+.55*f1+.38*f2);
let s=Math.exp(-sq(r/.13))*1.45+(Math.exp(-sq((r-.70)/.09))*1.15+Math.exp(-sq((r-.42)/.075))*.7)*fil;
for(const k of this.knots)s+=k[4]*.85*Math.exp(-(sq(x-k[0])+sq(ys-k[1])+sq(z-k[2]))/(k[3]*k[3]));
s-=.24;return s>0?s:0}
rebuild(){const R=this.RG,L=this.light;let m=0;for(let k=0;k<R;k++)for(let j=0;j<R;j++)for(let i=0;i<R;i++){const x=-1+2*(i+.5)/R,y=-1+2*(j+.5)/R,z=-1+2*(k+.5)/R,s=this.sig(x,y,z);let v=0;
if(s>0){const M=11,ddx=(L[0]-x)/M,ddy=(L[1]-y)/M,ddz=(L[2]-z)/M,dl=Math.hypot(L[0]-x,L[1]-y,L[2]-z)/M;let tau=0,px=x,py=y,pz=z;
for(let q=0;q<M;q++){px+=ddx;py+=ddy;pz+=ddz;tau+=this.sig(px,py,pz)*dl}
v=s*Math.exp(-2.6*tau)/(.35+.9*(sq(x-L[0])+sq(y-L[1])+sq(z-L[2])))}
this.grid[(k*R+j)*R+i]=v;if(v>m)m=v}this.gmax=Math.max(m,1e-6)}
gt(p){const R=this.RG,i=Math.max(0,Math.min(R-1,(p[0]+1)/2*R|0)),j=Math.max(0,Math.min(R-1,(p[1]+1)/2*R|0)),k=Math.max(0,Math.min(R-1,(p[2]+1)/2*R|0));return this.grid[(k*R+j)*R+i]/this.gmax}
samples(n){const a=[];let g=0;while(a.length<n&&g<n*60){g++;const x=this.r()*2-1,y=this.r()*2-1,z=this.r()*2-1,s=this.sig(x,y,z);if(s>.05&&this.r()<s*1.1)a.push([x,y,z])}return a}
stipple(n){const a=[];let g=0;while(a.length<n&&g<n*60){g++;const x=this.r()*2-1,y=this.r()*2-1,z=this.r()*2-1,s=this.sig(x,y,z);if(s>.02&&this.r()<.8)a.push([x,y,z,Math.min(1,s)])}return a}
shellInit(){for(let t=0;t<4;t++){const th=this.r()*6.283,ph=Math.acos(2*this.r()-1),o=[1.6*Math.sin(ph)*Math.cos(th),1.6*Math.cos(ph),1.6*Math.sin(ph)*Math.sin(th)],tg=[(this.r()*2-1)*.5,(this.r()*2-1)*.5,(this.r()*2-1)*.5];
const d=[tg[0]-o[0],tg[1]-o[1],tg[2]-o[2]],L=Math.hypot(d[0],d[1],d[2]);
for(let s=0;s<60;s++){const u=s/60*L,p=[o[0]+d[0]/L*u,o[1]+d[1]/L*u,o[2]+d[2]/L*u];if(this.sig(p[0],p[1],p[2])>.07)return[p[0]+(this.r()-.5)*.05,p[1]+(this.r()-.5)*.05,p[2]+(this.r()-.5)*.05]}}
return[(this.r()*2-1)*.4,(this.r()*2-1)*.4,(this.r()*2-1)*.4]}
}
/* Meter — the learning, drawn in the figure's own language. Min–max scaled
   history; fmt controls the readout (default %, 7a passes dB). */
class Meter{constructor(cap){this.hist=[];this.cap=cap||150}
push(v){this.hist.push(v);if(this.hist.length>this.cap)this.hist.shift()}
draw(g,x,y,w,h,label,mono,fmt){const H=this.hist;g.save();
g.fillStyle='rgba(228,223,212,.045)';g.fillRect(x,y,w,h);
g.strokeStyle='rgba(228,223,212,.18)';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);
g.fillStyle=tok('--absence');g.font='500 8.5px '+mono;g.fillText(label,x+8,y+13);
if(H.length>1){let mn=Infinity,mx=-Infinity;for(const v of H){if(v<mn)mn=v;if(v>mx)mx=v}const pad=Math.max((mx-mn)*.1,1e-3);mn-=pad;mx+=pad;
g.strokeStyle='rgba(228,223,212,.14)';g.beginPath();g.moveTo(x+8,y+h-6.5);g.lineTo(x+w-8,y+h-6.5);g.stroke();
g.strokeStyle=tok('--accw');g.lineWidth=1.2;g.beginPath();
H.forEach((v,i)=>{const xx=x+8+i/(this.cap-1)*(w-16),yy=y+h-6-((v-mn)/(mx-mn))*(h-28);g[i?'lineTo':'moveTo'](xx,yy)});g.stroke();
g.fillStyle=tok('--onwell');g.font='500 11px '+mono;const s=(fmt||(v=>(v*100).toFixed(1)+'%'))(H[H.length-1]);g.fillText(s,x+w-g.measureText(s).width-8,y+15)}
g.restore()}}
/* pixelPath — a pixel's whole story, deterministic per pixel: walk to a first
   interaction, scatter twice at most, then the one cache query; integrals of
   cache and truth along the query; gaussians the query crosses. */
function pixelPath(vol,F,eye,view,a,b){
const seed=((Math.round(a*61)*131+Math.round(b*61)*17+997)^0x9E37)|0,rand=rng(seed);
const inB=p=>Math.abs(p[0])<1&&Math.abs(p[1])<1&&Math.abs(p[2])<1;
let d=view.ray(a,b),p=null;
for(let t=.35;t<5.5;t+=.06){const q=[eye[0]+d[0]*t,eye[1]+d[1]*t,eye[2]+d[2]*t];if(inB(q)&&rand()<vol.sig(q[0],q[1],q[2])*.5){p=q;break}}
if(!p)return null;const V=[eye.slice(),p];
for(let k=0;k<2;k++){const rd=[rand()*2-1,rand()*2-1,rand()*2-1];let nd=[d[0]*.5+rd[0],d[1]*.5+rd[1],d[2]*.5+rd[2]];const n=Math.hypot(nd[0],nd[1],nd[2])||1;nd=[nd[0]/n,nd[1]/n,nd[2]/n];
let q2=null;for(let t=.08;t<.9;t+=.05){const q=[p[0]+nd[0]*t,p[1]+nd[1]*t,p[2]+nd[2]*t];if(!inB(q))break;if(rand()<vol.sig(q[0],q[1],q[2])*.55){q2=q;break}}
if(!q2)break;V.push(q2);p=q2;d=nd}
const dq=d;let te=.2;
for(let t=0;t<2.6;t+=.065){te=t;if(Math.hypot(p[0]+dq[0]*t,p[1]+dq[1]*t,p[2]+dq[2]*t)>1.5)break}
let cI=0,tI=0;const M=30,dt=te/M||.01;
for(let k=0;k<M;k++){const t=(k+.5)*dt,q=[p[0]+dq[0]*t,p[1]+dq[1]*t,p[2]+dq[2]*t];if(!inB(q))continue;cI+=Math.max(0,F.pred(q))*dt;tI+=vol.gt(q)*dt}
const hits=[];for(let i=0;i<F.N;i++){const rx=F.gx[i]-p[0],ry=F.gy[i]-p[1],rz=F.gz[i]-p[2],tt=rx*dq[0]+ry*dq[1]+rz*dq[2];if(tt<0||tt>te)continue;
const per=Math.hypot(rx-dq[0]*tt,ry-dq[1]*tt,rz-dq[2]*tt);if(per<.14)hits.push([tt,i])}
hits.sort((a,b)=>a[0]-b[0]);
return{V,q:p,dq,te,cI,tI,hits}}
function frustum(g,px,eye,view,amax,bmax,len,col){const ep=px(eye);g.strokeStyle=col;g.lineWidth=.8;g.beginPath();
for(const sa of[-1,1])for(const sb of[-1,1]){const d=view.ray(sa*amax,sb*bmax),q=px([eye[0]+d[0]*len,eye[1]+d[1]*len,eye[2]+d[2]*len]);g.moveTo(ep[0],ep[1]);g.lineTo(q[0],q[1])}g.stroke()}
/* NebVol — four colour datasets, dense by design: emission + single scatter,
   RGB radiance grid. kinds: helix · crab · cloud · burst. */
const PAL={helix:[[.30,.80,.72],[.62,.74,.50],[1,.40,.22]],crab:[[.45,.62,1],[.88,.84,.72],[1,.45,.30]],tornado:[[.36,.28,.20],[.70,.57,.42],[.93,.83,.68]],burst:[[.28,.27,.28],[.85,.34,.14],[1,.86,.55]],bh:[[.45,.08,.03],[1,.45,.12],[1,.92,.75]],hyd:[[.14,.20,.45],[.30,.80,.72],[1,.88,.60]],stars:[[.8,.85,1],[1,1,1],[1,.8,.6]]};
const EM={helix:.38,crab:.45,tornado:.12,burst:.10,bh:1,hyd:.32,stars:1};
const EMS={helix:0,crab:0,tornado:0,burst:.85,bh:0,hyd:0,stars:0};
class NebVol{
constructor(kind,seed){this.kind=kind;this.r=rng(seed||7);this.RG=24;this.grid=new Float32Array(this.RG**3*3);this.gmax=1;this.light=[1.15,1.05,.45];this.pal=PAL[kind];this.em=EM[kind];this.ems=EMS[kind];this.tf=.5;
this.knots=[];const nk=kind==='crab'?14:kind==='helix'?10:0;
for(let i=0;i<nk;i++){const th=this.r()*6.283,ph=Math.acos(2*this.r()-1),rr=kind==='crab'?.3+.55*this.r():.48+.22*this.r();
const kx=rr*Math.sin(ph)*Math.cos(th),ky=kind==='helix'?(this.r()-.5)*.4:rr*Math.cos(ph),kz=rr*Math.sin(ph)*Math.sin(th);
this.knots.push([kx,ky,kz,.07+.06*this.r(),.5+.5*this.r()])}
this.lobes=[];this.wisps=[];
if(kind==='burst'){this.lobes.push([0,.16,0,.34,1]);
for(let i=0;i<9;i++){const th=this.r()*6.283,ph=Math.acos(2*this.r()-1),rr=.30;
this.lobes.push([rr*Math.sin(ph)*Math.cos(th)*1.25,rr*Math.cos(ph)*.8+.18,rr*Math.sin(ph)*Math.sin(th)*1.25,.15+.13*this.r(),.65+.4*this.r()])}
for(let i=0;i<3;i++)this.wisps.push([(this.r()-.5)*.55,(this.r()-.5)*.55,this.r()*6])}}
sig(x,y,z){const K=this.kind;let s=0;
if(K==='helix'){const ys=y*1.25,rr=Math.hypot(x,z),a=Math.atan2(z,x);
const sp=.55+.45*Math.sin(9*a+2.2*Math.sin(3*a+ys*2));
s=Math.exp(-sq((rr-.58)/.18))*Math.exp(-sq(ys/.30))*(.5+.5*sp)+.34*Math.exp(-sq(rr/.45))*Math.exp(-sq(ys/.36))+.22*Math.exp(-sq(rr/.52))*Math.exp(-sq((Math.abs(ys)-.58)/.22))+.06*Math.exp(-sq(Math.hypot(x,ys,z)/.95));
for(const k of this.knots)s+=k[4]*Math.exp(-(sq(x-k[0])+sq(ys-k[1])+sq(z-k[2]))/(k[3]*k[3]));s-=.07}
else if(K==='crab'){const e=Math.hypot(x*1.05,y*1.15,z);if(e>1.15)return 0;
const w1=Math.sin(8.3*x+5.1*y-2)+Math.sin(7.4*y+6.2*z+1)+Math.sin(9.1*z+6.8*x-3);
s=.6*Math.exp(-sq(e/.60))+Math.max(0,Math.abs(w1)-1.05)*1.3*Math.exp(-sq((e-.60)/.34));
for(const k of this.knots)s+=k[4]*Math.exp(-(sq(x-k[0])+sq(y-k[1])+sq(z-k[2]))/(k[3]*k[3]));s-=.04}
else if(K==='tornado'){const u=(y+1)/2,R=.09+.40*Math.pow(Math.max(0,u),1.7)+.05*Math.sin(6.2*u+1.3);
const cx2=.16*Math.sin(1.9*y+.6),cz2=.13*Math.sin(1.6*y-1.1),dx=x-cx2,dz=z-cz2,d=Math.hypot(dx,dz),a=Math.atan2(dz,dx);
s=Math.exp(-sq(d/Math.max(.05,R)))*(.62+.38*Math.sin(3*a+8.5*y+2*Math.sin(2*a)))*(.75+.3*Math.sin(11*x+9*y)*Math.sin(10*z-7*y))*Math.exp(-Math.pow(Math.abs(y),8));
s=s*1.15-.13}
else if(K==='bh'){const rr=Math.hypot(x,z),r3=Math.hypot(x,y,z);if(r3<.16)return 0;const a=Math.atan2(z,x);
s=Math.exp(-sq(y/(.05+.06*rr)))*Math.exp(-sq((rr-.60)/.36))*(.68+.32*Math.sin(2.6*a-7.5*rr))*(.8+.25*Math.sin(11*rr+4*a+2)*Math.sin(6*a-9*rr))/(1+Math.exp(-(rr-.30)*30));
s+=1.35*Math.exp(-sq((r3-.21)/.03));s-=.05}
else{let m=0;for(const b of this.lobes)m+=b[4]*Math.exp(-(sq(x-b[0])+sq(y-b[1])+sq(z-b[2]))/(b[3]*b[3]));
m*=(.66+.42*Math.sin(9.1*x+2.1)*Math.sin(8.3*y-1.2)*Math.sin(8.7*z+3.3))*(.82+.25*Math.sin(15.2*x-2)*Math.sin(14.1*y+1)*Math.sin(13.7*z));
let td=0;for(const q of this.wisps){const wx=x-q[0]-.06*Math.sin(4*y+q[2]),wz=z-q[1]+.05*Math.sin(3.4*y-q[2]);
td+=.30*Math.exp(-(wx*wx+wz*wz)/.018)*Math.exp(-sq((y+.45)/.40))}
s=m+td-.16}
return s>0?s:0}
spec(x,y,z){const K=this.kind;
if(K==='helix'){const rr=Math.hypot(x,z);return Math.max(0,Math.min(1,(rr-.26)/.44))}
if(K==='crab'){const e=Math.hypot(x*1.05,y*1.15,z),w1=Math.sin(8.3*x+5.1*y-2)+Math.sin(7.4*y+6.2*z+1)+Math.sin(9.1*z+6.8*x-3),web=Math.max(0,Math.abs(w1)-1.05)*1.3*Math.exp(-sq((e-.60)/.34)),df=.6*Math.exp(-sq(e/.60));return Math.max(0,Math.min(1,web*2/(df+web+.05)))}
if(K==='tornado'){const u=(y+1)/2,R=.09+.40*Math.pow(Math.max(0,u),1.7)+.05*Math.sin(6.2*u+1.3),cx2=.16*Math.sin(1.9*y+.6),cz2=.13*Math.sin(1.6*y-1.1),d=Math.hypot(x-cx2,z-cz2);
return Math.max(0,Math.min(1,.15+.85*d/Math.max(.05,R)+.12*u))}
if(K==='bh'){const rr=Math.hypot(x,z),r3=Math.hypot(x,y,z),a=Math.atan2(z,x);
let t=1.15-1.35*(rr-.28)+.18*Math.sin(a);t=Math.max(t,1.6*Math.exp(-sq((r3-.21)/.04)));return Math.max(0,Math.min(1,t))}
const em2=Math.max(0,Math.sin(11.3*x+2)*Math.sin(10.2*z-1.3)*Math.sin(8.8*y+.7));
return Math.max(0,Math.min(1,2.0*Math.exp(-sq((y-.42)/.26))*em2*em2*1.6))}
palAt(t){const P=this.pal,u=t<.5?t*2:(t-.5)*2,a=t<.5?P[0]:P[1],b=t<.5?P[1]:P[2];return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u]}
rebuild(){const R=this.RG,L=this.light;let m=0;
for(let k=0;k<R;k++)for(let j=0;j<R;j++)for(let i=0;i<R;i++){const x=-1+2*(i+.5)/R,y=-1+2*(j+.5)/R,z=-1+2*(k+.5)/R,s=this.sig(x,y,z),o=((k*R+j)*R+i)*3;
if(s<=0){this.grid[o]=this.grid[o+1]=this.grid[o+2]=0;continue}
let lit=0;
if(this.em<.999){const M=11,ddx=(L[0]-x)/M,ddy=(L[1]-y)/M,ddz=(L[2]-z)/M,dl=Math.hypot(L[0]-x,L[1]-y,L[2]-z)/M;let tau=0,px=x,py=y,pz=z;
for(let q=0;q<M;q++){px+=ddx;py+=ddy;pz+=ddz;tau+=this.sig(px,py,pz)*dl}
lit=Math.exp(-2.6*tau)/(.35+.9*(sq(x-L[0])+sq(y-L[1])+sq(z-L[2])))}
const sp=Math.max(0,Math.min(1,this.spec(x,y,z)+(this.tf-.5)*.8)),v=s*(this.em+this.ems*sp+(1-this.em)*lit),c=this.palAt(sp);
this.grid[o]=v*c[0];this.grid[o+1]=v*c[1];this.grid[o+2]=v*c[2];
const lu=(this.grid[o]+this.grid[o+1]+this.grid[o+2])/3;if(lu>m)m=lu}
this.gmax=Math.max(m,1e-6);const inv=1/this.gmax;for(let i=0;i<this.grid.length;i++)this.grid[i]*=inv}
idx(p){const R=this.RG,i=Math.max(0,Math.min(R-1,(p[0]+1)/2*R|0)),j=Math.max(0,Math.min(R-1,(p[1]+1)/2*R|0)),k=Math.max(0,Math.min(R-1,(p[2]+1)/2*R|0));return((k*R+j)*R+i)*3}
gtc(p){const o=this.idx(p);return[this.grid[o],this.grid[o+1],this.grid[o+2]]}
gt(p){const o=this.idx(p);return(this.grid[o]+this.grid[o+1]+this.grid[o+2])/3}
samples(n){const a=[];let g=0;while(a.length<n&&g<n*60){g++;const x=this.r()*2-1,y=this.r()*2-1,z=this.r()*2-1,s=this.sig(x,y,z);if(s>.05&&this.r()<s*1.1)a.push([x,y,z])}return a}
stipple(n){const a=[];let g=0;while(a.length<n&&g<n*60){g++;const x=this.r()*2-1,y=this.r()*2-1,z=this.r()*2-1,s=this.sig(x,y,z);if(s>.02&&this.r()<.8)a.push([x,y,z,Math.min(1,s)])}return a}
shellInit(){for(let t=0;t<4;t++){const th=this.r()*6.283,ph=Math.acos(2*this.r()-1),o=[1.6*Math.sin(ph)*Math.cos(th),1.6*Math.cos(ph),1.6*Math.sin(ph)*Math.sin(th)],tg=[(this.r()*2-1)*.5,(this.r()*2-1)*.5,(this.r()*2-1)*.5];
const d=[tg[0]-o[0],tg[1]-o[1],tg[2]-o[2]],L=Math.hypot(d[0],d[1],d[2]);
for(let s=0;s<60;s++){const u=s/60*L,p=[o[0]+d[0]/L*u,o[1]+d[1]/L*u,o[2]+d[2]/L*u];if(this.sig(p[0],p[1],p[2])>.07)return[p[0]+(this.r()-.5)*.05,p[1]+(this.r()-.5)*.05,p[2]+(this.r()-.5)*.05]}}
return[(this.r()*2-1)*.4,(this.r()*2-1)*.4,(this.r()*2-1)*.4]}
}
/* CField — gaussians that learn RGB radiance. Soft splats only (no outlines);
   a gaussian flashes when a training sample updates it. */
function makeBase(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,1,32,32,31);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.42,'rgba(255,255,255,.42)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(32,32,31,0,6.283);g.fill();return c}
class CField{
constructor(vol,N,seed,opts){this.vol=vol;this.opt=opts||SIZES;this.rand=rng(seed||17);this.S=vol.samples(2600);this.buildLit();this.relocOn=true;this.wmax=.3;this.base=makeBase();this.tintC=new Map();this.alloc(N);
this.tp=vol.samples(1600);this.tvc=new Float32Array(this.tp.length*3);this.refreshTruth()}
buildLit(){this.lit=[];for(const p of this.S){const c=this.vol.gtc(p),lu=(c[0]+c[1]+c[2])/3;if(lu>.04&&this.rand()<lu*1.6)this.lit.push(p)}if(!this.lit.length)this.lit=this.S}
alloc(N){this.N=N;this.gx=new Float32Array(N);this.gy=new Float32Array(N);this.gz=new Float32Array(N);this.ls=new Float32Array(N);this.cr=new Float32Array(N);this.cg=new Float32Array(N);this.cb=new Float32Array(N);this.pulse=new Float32Array(N).fill(-9);
for(let i=0;i<N;i++)this.seed(i);this.hb(N);this.iter=0;this.loss=1}
seed(i){const p=this.vol.shellInit();this.gx[i]=p[0];this.gy[i]=p[1];this.gz[i]=p[2];this.ls[i]=Math.log(this.opt.s0+this.opt.sv*this.rand());
const c=this.vol.gtc(p);this.cr[i]=Math.max(.02,c[0]*.5);this.cg[i]=Math.max(.02,c[1]*.5);this.cb[i]=Math.max(.02,c[2]*.5)}
relocSeed(i){const p=this.lit[(this.rand()*this.lit.length)|0];this.gx[i]=p[0]+.04*(this.rand()-.5);this.gy[i]=p[1]+.04*(this.rand()-.5);this.gz[i]=p[2]+.04*(this.rand()-.5);this.ls[i]=this.opt.relocLs;
const c=this.vol.gtc(p);this.cr[i]=Math.max(.02,c[0]*.4);this.cg[i]=Math.max(.02,c[1]*.4);this.cb[i]=Math.max(.02,c[2]*.4)}
hb(N){this.hI=new Int32Array(N);this.hG=new Float32Array(N);this.hQ=new Float32Array(N);this.hX=new Float32Array(N);this.hY=new Float32Array(N);this.hZ=new Float32Array(N);this.hS=new Float32Array(N)}
setN(n,now){if(n===this.N)return;const cp=(a,M)=>{const b=new Float32Array(M);b.set(a.subarray(0,Math.min(a.length,M)));return b};
const N0=this.N;this.N=n;this.gx=cp(this.gx,n);this.gy=cp(this.gy,n);this.gz=cp(this.gz,n);this.ls=cp(this.ls,n);this.cr=cp(this.cr,n);this.cg=cp(this.cg,n);this.cb=cp(this.cb,n);const pu=new Float32Array(n).fill(-9);pu.set(this.pulse.subarray(0,Math.min(N0,n)));this.pulse=pu;
for(let i=N0;i<n;i++){this.seed(i);this.pulse[i]=now||0}this.hb(n)}
refreshTruth(){this.buildLit();for(let i=0;i<this.tp.length;i++){const c=this.vol.gtc(this.tp[i]);this.tvc[i*3]=c[0];this.tvc[i*3+1]=c[1];this.tvc[i*3+2]=c[2]}}
predC(p){let r=0,g=0,b=0;for(let i=0;i<this.N;i++){const dx=p[0]-this.gx[i],dy=p[1]-this.gy[i],dz=p[2]-this.gz[i],sg=Math.exp(this.ls[i]),rr=3*sg,d2=dx*dx+dy*dy+dz*dz;if(d2>rr*rr)continue;const q=d2/(sg*sg);if(q<11){const G=Math.exp(-.5*q);r+=this.cr[i]*G;g+=this.cg[i]*G;b+=this.cb[i]*G}}return[r,g,b]}
pred(p){const c=this.predC(p);return(c[0]+c[1]+c[2])/3}
one(x,y,z,dk,now,flash,out){const tc=this.vol.gtc([x,y,z]);let pr=0,pg=0,pb=0,nh=0;
for(let i=0;i<this.N;i++){const dx=x-this.gx[i],dy=y-this.gy[i],dz=z-this.gz[i],s=Math.exp(this.ls[i]),r=3*s,d2=dx*dx+dy*dy+dz*dz;if(d2>r*r)continue;const q=d2/(s*s);if(q>11)continue;
const G=Math.exp(-.5*q);pr+=this.cr[i]*G;pg+=this.cg[i]*G;pb+=this.cb[i]*G;this.hI[nh]=i;this.hG[nh]=G;this.hQ[nh]=q;this.hX[nh]=dx;this.hY[nh]=dy;this.hZ[nh]=dz;this.hS[nh]=s;nh++}
const er=pr-tc[0],eg=pg-tc[1],eb=pb-tc[2],eL=(er+eg+eb)/3;
for(let h=0;h<nh;h++){const i=this.hI[h],G=this.hG[h],s=this.hS[h],lum=(this.cr[i]+this.cg[i]+this.cb[i])/3,wG=lum*G,k=dk*.016*eL*wG/(s*s);
this.cr[i]-=dk*.09*er*G;this.cg[i]-=dk*.09*eg*G;this.cb[i]-=dk*.09*eb*G;
if(this.cr[i]<0)this.cr[i]=0;else if(this.cr[i]>2)this.cr[i]=2;if(this.cg[i]<0)this.cg[i]=0;else if(this.cg[i]>2)this.cg[i]=2;if(this.cb[i]<0)this.cb[i]=0;else if(this.cb[i]>2)this.cb[i]=2;
this.gx[i]-=k*this.hX[h];this.gy[i]-=k*this.hY[h];this.gz[i]-=k*this.hZ[h];
this.ls[i]-=dk*.026*eL*wG*this.hQ[h];
if(this.ls[i]<this.opt.lsMin)this.ls[i]=this.opt.lsMin;else if(this.ls[i]>this.opt.lsMax)this.ls[i]=this.opt.lsMax;
if(flash&&G>.35){this.pulse[i]=now;out&&out.add(i)}}
return er*er+eg*eg+eb*eb}
step(B,now){let L=0;const dk=1/(1+this.iter/1400);
for(let b=0;b<B;b++){const pool=this.rand()<.65?this.lit:this.S,p=pool[(this.rand()*pool.length)|0];L+=this.one(p[0]+.05*(this.rand()-.5),p[1]+.05*(this.rand()-.5),p[2]+.05*(this.rand()-.5),dk,now,false)}
this.loss=this.loss*.96+.04*(L/B);this.iter++;
if(this.relocOn)for(let k=0;k<8;k++){const i=(this.rand()*this.N)|0,lum=(this.cr[i]+this.cg[i]+this.cb[i])/3;
if(lum<.03&&this.rand()<.35){this.relocSeed(i);this.pulse[i]=now}
else if(lum<.05){this.gx[i]+=.006*(this.rand()-.5);this.gy[i]+=.006*(this.rand()-.5);this.gz[i]+=.006*(this.rand()-.5)}}}
micro(p,now,out){const dk=1/(1+this.iter/1400);for(let k=0;k<8;k++)this.one(p[0]+.06*(this.rand()-.5),p[1]+.06*(this.rand()-.5),p[2]+.06*(this.rand()-.5),dk,now,true,out)}
err(n){const M=Math.min(n||300,this.tp.length);let a=0,b=0;for(let k=0;k<M;k++){const i=(this.rand()*this.tp.length)|0,c=this.predC(this.tp[i]);
a+=Math.abs(c[0]-this.tvc[i*3])+Math.abs(c[1]-this.tvc[i*3+1])+Math.abs(c[2]-this.tvc[i*3+2]);b+=this.tvc[i*3]+this.tvc[i*3+1]+this.tvc[i*3+2]}return a/Math.max(1e-6,b)}
psnr(n){const M=Math.min(n||300,this.tp.length);let se=0;for(let k=0;k<M;k++){const i=(this.rand()*this.tp.length)|0,c=this.predC(this.tp[i]),dr=c[0]-this.tvc[i*3],dg=c[1]-this.tvc[i*3+1],db=c[2]-this.tvc[i*3+2];se+=dr*dr+dg*dg+db*db}
return 10*Math.log10(1/Math.max(1e-6,se/(M*3)))}
tint(r,g,b){const q=(Math.min(4,r*4.99|0)*25+Math.min(4,g*4.99|0)*5+Math.min(4,b*4.99|0));let c=this.tintC.get(q);if(c)return c;
c=document.createElement('canvas');c.width=c.height=64;const cg=c.getContext('2d');cg.drawImage(this.base,0,0);cg.globalCompositeOperation='source-in';cg.fillStyle=`rgb(${(r*255)|0},${(g*255)|0},${(b*255)|0})`;cg.fillRect(0,0,64,64);this.tintC.set(q,c);return c}
sprFor(r,g,b){const mx=Math.max(r,g,b,1e-4);return this.tint(Math.min(1,r/mx),Math.min(1,g/mx),Math.min(1,b/mx))}
draw(g,px,S,now){g.globalCompositeOperation='lighter';
for(let i=0;i<this.N;i++){const lum=(this.cr[i]+this.cg[i]+this.cb[i])/3,pb=this.pulse[i]>0?Math.exp(-(now-this.pulse[i])*2.5):0,a=Math.min(.85,lum*1.35+.5*pb);if(a<.025)continue;
const p=px([this.gx[i],this.gy[i],this.gz[i]]),sz=Math.exp(this.ls[i])*p[2]*S*this.opt.sMul*(1+.4*pb);
g.globalAlpha=a;g.drawImage(this.sprFor(this.cr[i],this.cg[i],this.cb[i]),p[0]-sz,p[1]-sz,sz*2,sz*2)}
g.globalAlpha=1;g.globalCompositeOperation='source-over'}
drawCacheImage(g,view,x0,y0,w,h,now){const fpx=h*view.f;g.save();g.beginPath();g.rect(x0,y0,w,h);g.clip();
g.fillStyle=GRT.figWell;g.fillRect(x0,y0,w,h);g.globalCompositeOperation='lighter';
for(let i=0;i<this.N;i++){const lum=(this.cr[i]+this.cg[i]+this.cb[i])/3,a=Math.min(.85,lum*1.35);if(a<.02)continue;
const pr=view.proj([this.gx[i],this.gy[i],this.gz[i]]);if(!pr)continue;
const sx=x0+w/2+pr[0]*fpx,sy=y0+h/2-pr[1]*fpx,sz=Math.exp(this.ls[i])*pr[2]*fpx*this.opt.sMul;
g.globalAlpha=a;g.drawImage(this.sprFor(this.cr[i],this.cg[i],this.cb[i]),sx-sz,sy-sz,sz*2,sz*2)}
g.globalAlpha=1;g.globalCompositeOperation='source-over';g.restore()}
drawTruthImage(g,view,x0,y0,w,h){const fpx=h*view.f;g.save();g.beginPath();g.rect(x0,y0,w,h);g.clip();
g.fillStyle=GRT.figWell;g.fillRect(x0,y0,w,h);g.globalCompositeOperation='lighter';
for(let i=0;i<this.tp.length;i++){const r=this.tvc[i*3],gg=this.tvc[i*3+1],b=this.tvc[i*3+2],lu=(r+gg+b)/3;if(lu<.03)continue;
const pr=view.proj(this.tp[i]);if(!pr)continue;
const sx=x0+w/2+pr[0]*fpx,sy=y0+h/2-pr[1]*fpx,sz=.055*pr[2]*fpx*(.55+.45*Math.min(1,lu));
g.globalAlpha=Math.min(.4,lu*.55+.01);g.drawImage(this.sprFor(r,gg,b),sx-sz,sy-sz,sz*2,sz*2)}
g.globalAlpha=1;g.globalCompositeOperation='source-over';g.restore()}
}
return{Nova,NebVol,CField,Meter,pixelPath,frustum,SIZES};})();
