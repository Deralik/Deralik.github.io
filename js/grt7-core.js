/* Round 7 shared — volumes (procedural + DataVol real data), in-figure error meter, frustum. */
window.GRT7=(()=>{
const{rng,tok}=GRT;const sq=v=>v*v;
const SIZES={s0:.052,sv:.018,lsMin:-3.66,lsMax:-1.55,sMul:.92,relocLs:Math.log(.06)};
class Meter{constructor(cap){this.hist=[];this.cap=cap||150}
push(v){this.hist.push(v);if(this.hist.length>this.cap)this.hist.shift()}
draw(g,x,y,w,h,label,mono,fmt){const H=this.hist;g.save();
g.fillStyle=GRT.alpha(GRT.figPaper,.045);g.fillRect(x,y,w,h);
g.strokeStyle=GRT.alpha(GRT.figPaper,.18);g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);
g.fillStyle=tok('--absence');g.font='500 8.5px '+mono;g.fillText(GRT.elide(g,label,w-76),x+8,y+13);
if(H.length>1){let mn=Infinity,mx=-Infinity;for(const v of H){if(v<mn)mn=v;if(v>mx)mx=v}const pad=Math.max((mx-mn)*.1,1e-3);mn-=pad;mx+=pad;
g.strokeStyle=GRT.alpha(GRT.figPaper,.14);g.beginPath();g.moveTo(x+8,y+h-6.5);g.lineTo(x+w-8,y+h-6.5);g.stroke();
g.strokeStyle=tok('--accw');g.lineWidth=1.2;g.beginPath();
H.forEach((v,i)=>{const xx=x+8+i/(this.cap-1)*(w-16),yy=y+h-6-((v-mn)/(mx-mn))*(h-28);g[i?'lineTo':'moveTo'](xx,yy)});g.stroke();
g.fillStyle=tok('--onwell');g.font='500 11px '+mono;const s=(fmt||(v=>(v*100).toFixed(1)+'%'))(H[H.length-1]);g.fillText(s,x+w-g.measureText(s).width-8,y+15)}
g.restore()}}
function frustum(g,px,eye,view,amax,bmax,len,col){const ep=px(eye);g.strokeStyle=col;g.lineWidth=.8;g.beginPath();
for(const sa of[-1,1])for(const sb of[-1,1]){const d=view.ray(sa*amax,sb*bmax),q=px([eye[0]+d[0]*len,eye[1]+d[1]*len,eye[2]+d[2]*len]);g.moveTo(ep[0],ep[1]);g.lineTo(q[0],q[1])}g.stroke()}
/* NebVol — four colour datasets, dense by design: emission + single scatter,
   RGB radiance grid. kinds: helix · crab · cloud · burst. */
const PAL={crab:[[.45,.62,1],[.88,.84,.72],[1,.45,.30]]};
const EM={butterfly:1,ring:1,crab:.45};
const EXPL=new Float32Array(257);for(let i=0;i<=256;i++)EXPL[i]=Math.exp(-.5*i*6.25/256);
class NebVol{
constructor(kind,seed){this.kind=kind;this.r=rng(seed||7);this.he=[1,1,1];this.EX=this.EY=this.EZ=56;this.orb=2.1;this.grid=new Float32Array(this.EX*this.EY*this.EZ*3);this.expo=1;this.gmax=1;this.light=[1.15,1.05,.45];this.pal=PAL[kind];this.em=EM[kind];this.tf=.5;
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
/* ── the radiance pipeline (renderer rebuild 2026-08-21) ──────────────
   density D (cached once) → EMIT grid at EX×EY×EZ over the he box:
   TF(d, radius)·AO + star → normalized; fixed exposure from a probe
   march. One set of units for truth, cache, and both panes — no runtime
   calibration anywhere. he = world half-extents (real data keeps its
   true aspect; procedural volumes fill the unit cube). */
buildDensity(){const n=this.DR=this.DR||40,D=this.D=new Float32Array(n*n*n),he=this.he;
for(let k=0;k<n;k++)for(let j=0;j<n;j++)for(let i=0;i<n;i++){
const x=(-1+2*(i+.5)/n)*he[0],y=(-1+2*(j+.5)/n)*he[1],z=(-1+2*(k+.5)/n)*he[2];
D[(k*n+j)*n+i]=this.sig(x,y,z)}}
dget(x,y,z){const n=this.DR,D=this.D,he=this.he;
const fx=(x/he[0]+1)/2*(n-1),fy=(y/he[1]+1)/2*(n-1),fz=(z/he[2]+1)/2*(n-1);
if(fx<0||fy<0||fz<0||fx>n-1||fy>n-1||fz>n-1)return 0;
const i=fx|0,j=fy|0,k=fz|0,u=fx-i,v=fy-j,w=fz-k,i1=Math.min(i+1,n-1),j1=Math.min(j+1,n-1),k1=Math.min(k+1,n-1);
const at=(I,J,K)=>D[(K*n+J)*n+I];
const c00=at(i,j,k)*(1-u)+at(i1,j,k)*u,c10=at(i,j1,k)*(1-u)+at(i1,j1,k)*u,
c01=at(i,j,k1)*(1-u)+at(i1,j,k1)*u,c11=at(i,j1,k1)*(1-u)+at(i1,j1,k1)*u;
return(c00*(1-v)+c10*v)*(1-w)+(c01*(1-v)+c11*v)*w}
/* default TF keeps the procedural language; subclasses override */
tf2(d,r,x,y,z){const sp=Math.max(0,Math.min(1,this.spec(x,y,z)+(this.tf-.5)*.8));
return this.palAt(sp)}
star(){return 0}
rebuild(){if(!this.D)this.buildDensity();
const EX=this.EX,EY=this.EY,EZ=this.EZ,he=this.he,E=this.grid,step=2*he[0]/EX;let m=0;
for(let k=0;k<EZ;k++)for(let j=0;j<EY;j++)for(let i=0;i<EX;i++){
const x=(-1+2*(i+.5)/EX)*he[0],y=(-1+2*(j+.5)/EY)*he[1],z=(-1+2*(k+.5)/EZ)*he[2],o=((k*EY+j)*EX+i)*3;
const d=this.dget(x,y,z);
const st=this.star(x,y,z);
if(d<=.004&&!st){E[o]=E[o+1]=E[o+2]=0;continue}
/* AO from local density — depth without view-dependence */
const nb=(this.dget(x+step,y,z)+this.dget(x-step,y,z)+this.dget(x,y+step,z)+this.dget(x,y-step,z)+this.dget(x,y,z+step)+this.dget(x,y,z-step))/6;
const ao=Math.exp(-(this.aoK||1.9)*nb);
const rr=Math.hypot(x,y,z),c=this.tf2(d,rr,x,y,z);
const de=this.dGamma?Math.pow(d,this.dGamma):d;
let er=de*ao*c[0],eg=de*ao*c[1],eb=de*ao*c[2];
if(st){er+=st[0]*ao;eg+=st[1]*ao;eb+=st[2]*ao}
E[o]=er;E[o+1]=eg;E[o+2]=eb;
const lu=(er+eg+eb)/3;if(lu>m)m=lu}
this.gmax=Math.max(m,1e-6);const inv=1/this.gmax;
for(let i=0;i<E.length;i++)E[i]*=inv;
/* content box (world units, one-voxel margin): rays that miss it skip
   the march entirely — computed from the data, never hardcoded */
{let ax=EX,bx=-1,ay=EY,by=-1,az=EZ,bz=-1;
for(let k=0;k<EZ;k++)for(let j=0;j<EY;j++)for(let i=0;i<EX;i++){
const o=((k*EY+j)*EX+i)*3;if(E[o]+E[o+1]+E[o+2]>6e-3){
if(i<ax)ax=i;if(i>bx)bx=i;if(j<ay)ay=j;if(j>by)by=j;if(k<az)az=k;if(k>bz)bz=k}}
const W2=(v2,n,h)=>((v2)/n*2-1)*h;
this.cb=bx<0?[-he[0],he[0],-he[1],he[1],-he[2],he[2]]:
[W2(ax-1,EX,he[0]),W2(bx+2,EX,he[0]),W2(ay-1,EY,he[1]),W2(by+2,EY,he[1]),W2(az-1,EZ,he[2]),W2(bz+2,EZ,he[2])]}
this.calibrate()}
/* ray ∩ he box: [t0,t1] or null (IEEE ±Infinity handles axis-parallel) */
boxT(e,dx,dy,dz){const he=this.he;
const ax=(-he[0]-e[0])/dx,bx=(he[0]-e[0])/dx,ay=(-he[1]-e[1])/dy,by=(he[1]-e[1])/dy,az=(-he[2]-e[2])/dz,bz=(he[2]-e[2])/dz;
const t0=Math.max(Math.min(ax,bx),Math.min(ay,by),Math.min(az,bz),0);
const t1=Math.min(Math.max(ax,bx),Math.max(ay,by),Math.max(az,bz));
return t1>t0+1e-5?[t0,t1]:null}
/* fixed exposure: probe-march the grid, expose to its p-high luminance */
calibrate(){const EX=this.EX,EY=this.EY,EZ=this.EZ,he=this.he,E=this.grid,M=22,ls=[];
for(let a=0;a<26;a++)for(let b=0;b<10;b++){
const th=a/26*6.283,eye=[this.orb*Math.cos(th),.15+b*.09,this.orb*Math.sin(th)];
const L=Math.hypot(eye[0],eye[1],eye[2]),dx=-eye[0]/L,dy=-eye[1]/L,dz=-eye[2]/L;
const tr=this.boxT(eye,dx,dy,dz);if(!tr)continue;
const dt=(tr[1]-tr[0])/M;let s=0;
for(let k2=0;k2<M;k2++){const tt=tr[0]+(k2+.5)*dt,p0=eye[0]+dx*tt,p1=eye[1]+dy*tt,p2=eye[2]+dz*tt;
const i2=Math.max(0,Math.min(EX-1,(p0/he[0]+1)/2*EX|0)),j2=Math.max(0,Math.min(EY-1,(p1/he[1]+1)/2*EY|0)),k3=Math.max(0,Math.min(EZ-1,(p2/he[2]+1)/2*EZ|0)),o2=((k3*EY+j2)*EX+i2)*3;
s+=(E[o2]+E[o2+1]+E[o2+2])/3*dt}
if(s>0)ls.push(s)}
ls.sort((a,b)=>a-b);
const p=ls.length?ls[Math.min(ls.length-1,Math.floor(ls.length*.97))]:1;
/* paper display curve 1-exp(-e·L): put p97 at ~.95 (verified offline
   against the research repo's reference figures, heroprobe.py) */
this.expo=3.0/Math.max(p,1e-4)}
idx(p){const EX=this.EX,EY=this.EY,EZ=this.EZ,he=this.he,i=Math.max(0,Math.min(EX-1,(p[0]/he[0]+1)/2*EX|0)),j=Math.max(0,Math.min(EY-1,(p[1]/he[1]+1)/2*EY|0)),k=Math.max(0,Math.min(EZ-1,(p[2]/he[2]+1)/2*EZ|0));return((k*EY+j)*EX+i)*3}
gtc(p){const o=this.idx(p);return[this.grid[o],this.grid[o+1],this.grid[o+2]]}
gt(p){const o=this.idx(p);return(this.grid[o]+this.grid[o+1]+this.grid[o+2])/3}
/* near-flat acceptance over content: dim regions must train too, or
   bright-region tails inflate them unchecked */
samples(n){const a=[],he=this.he;let g=0;while(a.length<n&&g<n*60){g++;const x=(this.r()*2-1)*he[0],y=(this.r()*2-1)*he[1],z=(this.r()*2-1)*he[2],s=this.sig(x,y,z);if(s>.02&&this.r()<.25+s)a.push([x,y,z])}return a}
stipple(n){const a=[],he=this.he;let g=0;while(a.length<n&&g<n*60){g++;const x=(this.r()*2-1)*he[0],y=(this.r()*2-1)*he[1],z=(this.r()*2-1)*he[2],s=this.sig(x,y,z);if(s>.02&&this.r()<.8)a.push([x,y,z,Math.min(1,s)])}return a}
shellInit(){for(let t=0;t<4;t++){const th=this.r()*6.283,ph=Math.acos(2*this.r()-1),o=[1.6*Math.sin(ph)*Math.cos(th),1.6*Math.cos(ph),1.6*Math.sin(ph)*Math.sin(th)],tg=[(this.r()*2-1)*.5,(this.r()*2-1)*.5,(this.r()*2-1)*.5];
const d=[tg[0]-o[0],tg[1]-o[1],tg[2]-o[2]],L=Math.hypot(d[0],d[1],d[2]);
for(let s=0;s<60;s++){const u=s/60*L,p=[o[0]+d[0]/L*u,o[1]+d[1]/L*u,o[2]+d[2]/L*u];if(this.sig(p[0],p[1],p[2])>.07)return[p[0]+(this.r()-.5)*.05,p[1]+(this.r()-.5)*.05,p[2]+(this.r()-.5)*.05]}}
return[(this.r()*2-1)*.4,(this.r()*2-1)*.4,(this.r()*2-1)*.4]}
}
/* DataVol — the vendored REAL datasets (js/grt-vol-*.js carry provenance
   headers). Opacity and colour are the research repo's own scene transfer
   functions (scene_mechhand.json / scene_supernova.json, recovered
   2026-08-21), sampled piecewise-linear; the supernova adds a small
   disclosed opacity floor so its translucent shell — lit by scattering in
   the real renderer — stays visible in this emission-only pipeline. */
function lut1(u,P,V){let i=1;while(i<P.length-1&&u>P[i])i++;
const t=Math.max(0,Math.min(1,(u-P[i-1])/(P[i]-P[i-1])));return V[i-1]+(V[i]-V[i-1])*t}
function lut3(u,P,C){let i=1;while(i<P.length-1&&u>P[i])i++;
const t=Math.max(0,Math.min(1,(u-P[i-1])/(P[i]-P[i-1]))),a=C[i-1],b=C[i];
return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
const DTF={
mech:{he:[.309,.9,.322],E:[36,104,37],orb:2.0,aoK:3.4,
 ap:[0,.0625,.125,.25,.375,.5,.625,.75,.875,1],av:[0,.057,.108,.211,.335,.449,.591,.701,.830,1],
 cp:[0,.0993,.2855,.442,.589,1],cc:[[1,1,1],[1,.972,.930],[.961,.475,0],[.8,0,0],[.204,.396,.643],[.361,.208,.400]]},
super:{he:[1,1,1],E:[56,56,56],orb:1.75,fl:u=>u<=.05?0:u>=.25?.05:.05*(u-.05)/.2,
 ap:[0,.586,.625,.75,.875,1],av:[0,0,.068,.243,.590,.854],
 cp:[0,.0852,.1157,.2344,.5532,.6343,.7718,1],cc:[[1,1,1],[1,1,1],[0,.365,1],[.102,.873,.503],[.988,.914,.310],[.961,.475,0],[.937,.161,.161],[.937,.161,.161]]}};
class DataVol extends NebVol{
constructor(kind,seed,src){super(kind,seed);const T=this.T=DTF[kind];
this.nx=src.nx;this.ny=src.ny;this.nz=src.nz;
const bin=atob(src.b64),g=new Float32Array(this.nx*this.ny*this.nz);
for(let q=0;q<g.length;q++)g[q]=bin.charCodeAt(q)/255;this.dg=g;
this.he=T.he;this.EX=T.E[0];this.EY=T.E[1];this.EZ=T.E[2];this.orb=T.orb;if(T.aoK)this.aoK=T.aoK;
this.grid=new Float32Array(this.EX*this.EY*this.EZ*3);this.em=1;this.tfr=false}
usamp(x,y,z){const nx=this.nx,ny=this.ny,nz=this.nz,g=this.dg,he=this.he;
const fx=(x/he[0]+1)/2*(nx-1),fy=(y/he[1]+1)/2*(ny-1),fz=(z/he[2]+1)/2*(nz-1);
if(fx<0||fy<0||fz<0||fx>nx-1||fy>ny-1||fz>nz-1)return 0;
const i=fx|0,j=fy|0,k=fz|0,u=fx-i,v=fy-j,w=fz-k,i1=Math.min(i+1,nx-1),j1=Math.min(j+1,ny-1),k1=Math.min(k+1,nz-1);
const at=(I,J,K)=>g[(K*ny+J)*nx+I];
const c00=at(i,j,k)*(1-u)+at(i1,j,k)*u,c10=at(i,j1,k)*(1-u)+at(i1,j1,k)*u,
c01=at(i,j,k1)*(1-u)+at(i1,j,k1)*u,c11=at(i,j1,k1)*(1-u)+at(i1,j1,k1)*u;
return(c00*(1-v)+c10*v)*(1-w)+(c01*(1-v)+c11*v)*w}
dget(x,y,z){const T=this.T,u=this.usamp(x,y,z);let a=lut1(u,T.ap,T.av);
if(T.fl){const f=T.fl(u);if(f>a)a=f}return a}
buildDensity(){this.D=1}
sig(x,y,z){return this.dget(x,y,z)*1.5}
tf2(d,r,x,y,z){const T=this.T;return lut3(this.usamp(x,y,z),T.cp,T.cc)}
}
/* GaiaVol — Gaia Sky nebula density models (js/grt-nebulae.js carries the
   ports + credits); palette mixes centre->rim by radius, per the shaders. */
class GaiaVol extends NebVol{
constructor(kind,seed){super(kind,seed);this.fn=window.GRTNEB[kind];this.DR=56;this.S=GS[kind];this.dGamma=1.6}
sig(x,y,z){return this.fn(x,y,z)*3.2}
/* after the shader's computeColor, radius in ITS units (lD = r·S):
   blue-white centre dust -> amber edge dust (edge colour matched to the
   shaders' rendered output rather than their raw constants — their td
   accumulation warms it); the tf slider moves the mix radius */
tf2(d,r,x,y,z){const lD=r*this.S;
const m=Math.min((lD+.05)/(.9*(1+(this.tf-.5)*.8)),1);
const res=1-.5*Math.min(1,d*1.2);
return[res*(5.6-4.1*m),res*(6.3-5.1*m),res*(7-6.3*m)]}
/* the shader's additive glow, density-independent: green-cyan 1/r² core +
   the radius-keyed cosine halo (blue at lD≈1, amber by lD≈2) */
star(x,y,z){const S=this.S,lD=Math.max(.03,Math.hypot(x,y,z)*S);
const g1=.7/((lD*lD+.12)*10),e=Math.exp(-lD*lD*lD*.05),T=lD*2.3+2.6,K=.08;
return[K*(Math.max(0,.4+.5*Math.cos(T-.785))*e+.57*g1),
K*(Math.max(0,.4+.5*Math.cos(T+.079))*e+1.85*g1),
K*(Math.max(0,.4+.5*Math.cos(T+.785))*e+1.0*g1)]}
}
/* per-kind world->shader scale (the density ports' own fit factors) */
const GS={butterfly:4.2,ring:3.4};
/* CField — gaussians that learn RGB radiance. Soft splats only (no outlines);
   a gaussian flashes when a training sample updates it. */
function makeBase(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,1,32,32,31);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.42,'rgba(255,255,255,.42)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(32,32,31,0,6.283);g.fill();return c}
class CField{
constructor(vol,N,seed,opts){this.vol=vol;this.opt=opts||SIZES;this.rand=rng(seed||17);this.S=vol.samples(2600);this.buildLit();
/* dark pool: uniform in the box, no rejection — the field must learn its
   ZEROS too, or gaussian tails leave untrained haze where the truth is
   black (the pane marches through empty space; the training samples
   otherwise never land there) */
this.dark=[];for(let i=0;i<1400;i++)this.dark.push([(this.rand()*2-1)*vol.he[0],(this.rand()*2-1)*vol.he[1],(this.rand()*2-1)*vol.he[2]]);
this.relocOn=true;this.wmax=.3;this.base=makeBase();this.tintC=new Map();this.alloc(N);
this.tp=vol.samples(1600);this.tvc=new Float32Array(this.tp.length*3);this.refreshTruth()}
buildLit(){this.lit=[];for(const p of this.S){const c=this.vol.gtc(p),lu=(c[0]+c[1]+c[2])/3;if(lu>.04&&this.rand()<lu*1.6)this.lit.push(p)}if(!this.lit.length)this.lit=this.S}
alloc(N){this.N=N;this.gx=new Float32Array(N);this.gy=new Float32Array(N);this.gz=new Float32Array(N);this.ls=new Float32Array(N);this.cr=new Float32Array(N);this.cg=new Float32Array(N);this.cb=new Float32Array(N);this.pulse=new Float32Array(N).fill(-9);
this.cs=1;for(let i=0;i<N;i++)this.seed(i);this.hb(N);this.normInit();this.iter=0;this.loss=1}
/* the field is a SUM: seeding every gaussian at the full local colour
   overshoots by the overlap count (~10-30×). Measure it, scale once —
   the field starts at the right energy and SGD only shapes structure. */
normInit(){let m=0,n=0;
for(let k=0;k<80;k++){const p=this.S[(this.rand()*this.S.length)|0],pc=this.predC(p),tc=this.vol.gtc(p);
const tl=tc[0]+tc[1]+tc[2];if(tl>.05){m+=(pc[0]+pc[1]+pc[2])/tl;n++}}
const s=n?1/Math.max(1,m/n):1;
if(s<1)for(let i=0;i<this.N;i++){this.cr[i]*=s;this.cg[i]*=s;this.cb[i]*=s}
this.cs=s;this.vg=Math.min(14,1/Math.max(s,.07));
/* dim/reloc thresholds and display gain follow the colour scale */
let ml=0;for(let i=0;i<this.N;i++)ml+=(this.cr[i]+this.cg[i]+this.cb[i])/3;ml/=this.N;
this.dimT=Math.max(.0015,.12*ml)}
seed(i){const p=this.vol.shellInit();this.gx[i]=p[0];this.gy[i]=p[1];this.gz[i]=p[2];this.ls[i]=Math.log(this.opt.s0+this.opt.sv*this.rand());
const c=this.vol.gtc(p),s=this.cs,fl=Math.max(.002,.02*s);this.cr[i]=Math.max(fl,c[0]*s);this.cg[i]=Math.max(fl,c[1]*s);this.cb[i]=Math.max(fl,c[2]*s)}
relocSeed(i){const p=this.lit[(this.rand()*this.lit.length)|0];this.gx[i]=p[0]+.04*(this.rand()-.5);this.gy[i]=p[1]+.04*(this.rand()-.5);this.gz[i]=p[2]+.04*(this.rand()-.5);this.ls[i]=this.opt.relocLs;
const c=this.vol.gtc(p),s=this.cs,fl=Math.max(.002,.02*s);this.cr[i]=Math.max(fl,c[0]*s);this.cg[i]=Math.max(fl,c[1]*s);this.cb[i]=Math.max(fl,c[2]*s)}
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
for(let b=0;b<B;b++){const u=this.rand(),pool=u<.5?this.lit:u<.75?this.S:this.dark,p=pool[(this.rand()*pool.length)|0];L+=this.one(p[0]+.05*(this.rand()-.5),p[1]+.05*(this.rand()-.5),p[2]+.05*(this.rand()-.5),dk,now,false)}
this.loss=this.loss*.96+.04*(L/B);this.iter++;
if(this.relocOn)for(let k=0;k<8;k++){const i=(this.rand()*this.N)|0,lum=(this.cr[i]+this.cg[i]+this.cb[i])/3,dT=this.dimT||.03;
if(lum<dT&&this.rand()<.35){this.relocSeed(i);this.pulse[i]=now}
else if(lum<1.6*dT){this.gx[i]+=.006*(this.rand()-.5);this.gy[i]+=.006*(this.rand()-.5);this.gz[i]+=.006*(this.rand()-.5)}}}
micro(p,now,out){const dk=1/(1+this.iter/1400);for(let k=0;k<8;k++)this.one(p[0]+.06*(this.rand()-.5),p[1]+.06*(this.rand()-.5),p[2]+.06*(this.rand()-.5),dk,now,true,out)}
err(n){const M=Math.min(n||300,this.tp.length);let a=0,b=0;for(let k=0;k<M;k++){const i=(this.rand()*this.tp.length)|0,c=this.predC(this.tp[i]);
a+=Math.abs(c[0]-this.tvc[i*3])+Math.abs(c[1]-this.tvc[i*3+1])+Math.abs(c[2]-this.tvc[i*3+2]);b+=this.tvc[i*3]+this.tvc[i*3+1]+this.tvc[i*3+2]}return a/Math.max(1e-6,b)}
tint(r,g,b){const q=(Math.min(4,r*4.99|0)*25+Math.min(4,g*4.99|0)*5+Math.min(4,b*4.99|0));let c=this.tintC.get(q);if(c)return c;
c=document.createElement('canvas');c.width=c.height=64;const cg=c.getContext('2d');cg.drawImage(this.base,0,0);cg.globalCompositeOperation='source-in';cg.fillStyle=`rgb(${(r*255)|0},${(g*255)|0},${(b*255)|0})`;cg.fillRect(0,0,64,64);this.tintC.set(q,c);return c}
sprFor(r,g,b){const mx=Math.max(r,g,b,1e-4);return this.tint(Math.min(1,r/mx),Math.min(1,g/mx),Math.min(1,b/mx))}
/* splat gaussians [a,b) into grid E (dims/he from vol). Sliced so the
   per-frame cost stays bounded; exp via LUT, 2.5σ cutoff. */
bakeSlice(E,vol,a,b){const EX=vol.EX,EY=vol.EY,EZ=vol.EZ,he=vol.he;
const wx=2*he[0]/EX,wy=2*he[1]/EY,wz=2*he[2]/EZ,Q=9,QS=256/Q;
for(let i=a;i<b;i++){const cr=this.cr[i],cg=this.cg[i],cb=this.cb[i];
if((cr+cg+cb)/3<Math.min(.008,(this.dimT||.008)*.25))continue;
const sg=Math.exp(this.ls[i]);
const vx=(this.gx[i]/he[0]+1)/2*EX,vy=(this.gy[i]/he[1]+1)/2*EY,vz=(this.gz[i]/he[2]+1)/2*EZ;
let rx=Math.max(1.2,3*sg/wx),ry=Math.max(1.2,3*sg/wy),rz=Math.max(1.2,3*sg/wz);
const v3=rx*ry*rz;if(v3>700){const sc=Math.cbrt(700/v3);rx*=sc;ry*=sc;rz*=sc}
const x0=Math.max(0,Math.ceil(vx-rx)),x1=Math.min(EX-1,Math.floor(vx+rx));
const y0=Math.max(0,Math.ceil(vy-ry)),y1=Math.min(EY-1,Math.floor(vy+ry));
const z0=Math.max(0,Math.ceil(vz-rz)),z1=Math.min(EZ-1,Math.floor(vz+rz));
const s2=sg*sg;
for(let z=z0;z<=z1;z++)for(let y=y0;y<=y1;y++){const dz=(z+.5-vz)*wz,dy=(y+.5-vy)*wy,base=(z*EY+y)*EX;
for(let x=x0;x<=x1;x++){const dx=(x+.5-vx)*wx,q=(dx*dx+dy*dy+dz*dz)/s2;
if(q>=Q)continue;const G=EXPL[(q*QS)|0],o=(base+x)*3;
E[o]+=cr*G;E[o+1]+=cg*G;E[o+2]+=cb*G}}}}
bakeTo(E,vol){E.fill(0);this.bakeSlice(E,vol,0,this.N)}
draw(g,px,S,now){g.globalCompositeOperation='lighter';
for(let i=0;i<this.N;i++){const lum=(this.cr[i]+this.cg[i]+this.cb[i])/3,pb=this.pulse[i]>0?Math.exp(-(now-this.pulse[i])*2.5):0,a=Math.min(.85,lum*(this.vg||1)*1.35+.5*pb);if(a<.04)continue;
const p=px([this.gx[i],this.gy[i],this.gz[i]]),sz=Math.exp(this.ls[i])*p[2]*S*this.opt.sMul*(1+.4*pb);
g.globalAlpha=a;g.drawImage(this.sprFor(this.cr[i],this.cg[i],this.cb[i]),p[0]-sz,p[1]-sz,sz*2,sz*2)}
g.globalAlpha=1;g.globalCompositeOperation='source-over'}
}
return{NebVol,DataVol,GaiaVol,CField,Meter,frustum,SIZES};})();

