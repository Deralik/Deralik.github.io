/* GRT direction round — shared helpers: rng, canvas fit, raf loop, tokens, colormap, orbit cam, procedural volume. */
window.GRT=(()=>{
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}; /* privacy-ok: 2^32 rng divisor */
function fit(cv){const d=Math.min(2,window.devicePixelRatio||1);const r=cv.getBoundingClientRect();if(!r.width)return null;const w=Math.round(r.width*d),h=Math.round(r.height*d);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}const g=cv.getContext('2d');g.setTransform(d,0,0,d,0,0);return{g,w:r.width,h:r.height}}
/* prefers-reduced-motion: figures paint (and finish their idle warm-start),
   then hold still; direct engagement — pointer over or down — animates,
   because reader-driven motion is the reader's choice. */
const RMQ=matchMedia('(prefers-reduced-motion: reduce)');
function loop(el,fn){let on=true,frac=1,fc=0,lastMeasure=0,lastRun=performance.now(),eng=false;
const io=new IntersectionObserver(e=>{on=e[0].isIntersecting},{rootMargin:'150px'});io.observe(el);
if(RMQ.matches||RMQ.addEventListener){el.addEventListener('pointerenter',()=>eng=true);
el.addEventListener('pointerleave',()=>eng=false);el.addEventListener('pointerdown',()=>eng=true)}
function f(t){const still=RMQ.matches&&t>2600&&!eng;
if(on&&!still){
if(t-lastMeasure>800){const r=el.getBoundingClientRect();frac=r.width<130?4:r.width<270?2:1;lastMeasure=t}
if(fc++%frac===0){const dt=Math.min(.08,(t-lastRun)/1000);lastRun=t;fn(t/1000,dt)}}
else lastRun=t;
requestAnimationFrame(f)}requestAnimationFrame(f)}
const tok=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim()||'#888';
/* figure registers — values live in skeleton-tokens.css, read once (they are
   deliberately theme-independent) */
const figWell=tok('--render-well'),figPaper=tok('--render-paper'),figWarm=tok('--ray-warm');
/* canvas labels elide by dropping trailing " · " segments, never mid-word */
function elide(g,txt,maxw){if(g.measureText(txt).width<=maxw)return txt;
const seg=txt.split(' · ');
while(seg.length>1){seg.pop();const t=seg.join(' · ');if(g.measureText(t).width<=maxw)return t}
let t=seg[0];while(t.length>4&&g.measureText(t+'…').width>maxw)t=t.slice(0,-1);return t+'…'}
/* radiance colormap: well-black → deep teal → pa-2 teal → warm amber → near-white */
const stops=[[0,8,11,15],[.3,22,72,95],[.55,30,111,140],[.78,224,150,84],[1,255,241,218]];
const LUT=new Uint8Array(257*3);for(let i=0;i<=256;i++){const t=i/256;let a=stops[0],b=stops[stops.length-1];for(let k=0;k<stops.length-1;k++)if(t>=stops[k][0]&&t<=stops[k+1][0]){a=stops[k];b=stops[k+1];break}const u=(t-a[0])/Math.max(1e-6,b[0]-a[0]);for(let c=0;c<3;c++)LUT[i*3+c]=a[c+1]+(b[c+1]-a[c+1])*u|0}
const cmap=t=>{const i=Math.max(0,Math.min(256,t*256|0))*3;return[LUT[i],LUT[i+1],LUT[i+2]]};
const css=t=>{const c=cmap(t);return`rgb(${c[0]},${c[1]},${c[2]})`};
class Cam{constructor(cv,yaw,pitch,dist){this.yaw=yaw;this.pitch=pitch;this.dist=dist;this.auto=.05;if(cv){let px,py,dr=false;cv.addEventListener('pointerdown',e=>{dr=true;px=e.clientX;py=e.clientY;this.auto=0;cv.setPointerCapture(e.pointerId)});cv.addEventListener('pointermove',e=>{if(!dr)return;this.yaw+=(e.clientX-px)*.008;this.pitch=Math.max(-1.15,Math.min(1.15,this.pitch+(e.clientY-py)*.006));px=e.clientX;py=e.clientY});cv.addEventListener('pointerup',()=>dr=false)}}
 proj(){const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),D=this.dist;return p=>{const x=p[0]*cy+p[2]*sy,z0=-p[0]*sy+p[2]*cy,y=p[1]*cp-z0*sp,z=p[1]*sp+z0*cp+D,s=1.85/z;return[x*s,y*s,s,z]}}}
/* Vol3 — the shared 3-D test medium: analytic blob cloud, single-scatter radiance grid. */
class Vol3{constructor(seed){this.r=rng(seed||11);this.blobs=[[0,.02,0,.5,1],[-.44,-.18,.22,.36,.85],[.42,-.08,-.28,.38,.8],[.14,.42,.34,.27,.6],[-.24,.38,-.38,.26,.55]];this.RG=18;this.grid=new Float32Array(this.RG**3);this.gmax=1;this.light=[1.15,1.05,.45]}
 sig(x,y,z){let s=-.17;for(const b of this.blobs){const dx=x-b[0],dy=y-b[1],dz=z-b[2];s+=b[4]*Math.exp(-(dx*dx+dy*dy+dz*dz)/(b[3]*b[3]))}if(s<=0)return 0;return s*(.82+.4*Math.sin(5.1*x+2.3)*Math.sin(4.3*y-1.1)*Math.sin(4.7*z+.6))}
 rebuild(){const R=this.RG,L=this.light;let m=0;for(let k=0;k<R;k++)for(let j=0;j<R;j++)for(let i=0;i<R;i++){const x=-1+2*(i+.5)/R,y=-1+2*(j+.5)/R,z=-1+2*(k+.5)/R,s=this.sig(x,y,z);let v=0;if(s>0){const M=11,dx=(L[0]-x)/M,dy=(L[1]-y)/M,dz=(L[2]-z)/M,dl=Math.hypot(L[0]-x,L[1]-y,L[2]-z)/M;let tau=0,px=x,py=y,pz=z;for(let q=0;q<M;q++){px+=dx;py+=dy;pz+=dz;tau+=this.sig(px,py,pz)*dl}const d2=(x-L[0])**2+(y-L[1])**2+(z-L[2])**2;v=s*Math.exp(-2.6*tau)/(.35+.9*d2)}this.grid[(k*R+j)*R+i]=v;if(v>m)m=v}this.gmax=Math.max(m,1e-6)}
 gt(p){const R=this.RG,i=Math.max(0,Math.min(R-1,(p[0]+1)/2*R|0)),j=Math.max(0,Math.min(R-1,(p[1]+1)/2*R|0)),k=Math.max(0,Math.min(R-1,(p[2]+1)/2*R|0));return this.grid[(k*R+j)*R+i]/this.gmax}
 samples(n){const a=[];let g=0;while(a.length<n&&g<n*60){g++;const x=this.r()*2-1,y=this.r()*2-1,z=this.r()*2-1,s=this.sig(x,y,z);if(s>.04&&this.r()<s*1.2)a.push([x,y,z])}return a}
 stipple(n){const a=[];let g=0;while(a.length<n&&g<n*60){g++;const x=this.r()*2-1,y=this.r()*2-1,z=this.r()*2-1,s=this.sig(x,y,z);if(s>.02&&this.r()<.8)a.push([x,y,z,Math.min(1,s)])}return a}
 /* paper-style init: cast from a bounding shell toward the interior, take the first dense point */
 shellInit(){for(let t=0;t<4;t++){const th=this.r()*6.283,ph=Math.acos(2*this.r()-1),o=[1.7*Math.sin(ph)*Math.cos(th),1.7*Math.cos(ph),1.7*Math.sin(ph)*Math.sin(th)],tg=[(this.r()*2-1)*.5,(this.r()*2-1)*.5,(this.r()*2-1)*.5];const d=[tg[0]-o[0],tg[1]-o[1],tg[2]-o[2]],L=Math.hypot(...d);for(let s=0;s<60;s++){const u=s/60*L,p=[o[0]+d[0]/L*u,o[1]+d[1]/L*u,o[2]+d[2]/L*u];if(this.sig(p[0],p[1],p[2])>.07)return[p[0]+(this.r()-.5)*.06,p[1]+(this.r()-.5)*.06,p[2]+(this.r()-.5)*.06]}}return[(this.r()*2-1)*.4,(this.r()*2-1)*.4,(this.r()*2-1)*.4]}
}
function star(g,x,y,r,col){g.strokeStyle=col;g.lineWidth=1;g.beginPath();g.moveTo(x-r,y);g.lineTo(x+r,y);g.moveTo(x,y-r);g.lineTo(x,y+r);g.moveTo(x-r*.6,y-r*.6);g.lineTo(x+r*.6,y+r*.6);g.moveTo(x-r*.6,y+r*.6);g.lineTo(x+r*.6,y-r*.6);g.stroke();g.fillStyle=col;g.beginPath();g.arc(x,y,2.2,0,6.283);g.fill()}
return{rng,fit,loop,tok,cmap,css,Cam,Vol3,star,elide,figWell,figPaper,figWarm};})();
