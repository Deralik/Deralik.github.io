/* GRT round 2 — shared: grab-orbit camera (inverted, inertial). */
window.GRT2=(()=>{
const{rng,fit,cmap,css}=GRT;
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
return{Cam2};})();
