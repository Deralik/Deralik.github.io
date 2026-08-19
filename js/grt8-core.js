/* Round 8 shared — the method, explained. Crab volume + presets, a truth-in-world
   drawer, and a query-ray helper reused by 8a/8c. */
window.GRT8=(()=>{
const{rng}=GRT;const{NebVol}=GRT7;
const KC={s0:.038,sv:.014,lsMin:-4.0,lsMax:-1.8,sMul:.88,relocLs:Math.log(.048)};
const EYE=[-2.05,.42,1.3];
let _vol=null;
function vol(){if(!_vol){_vol=new NebVol('crab',33);_vol.light=[1.3*Math.cos(.9),1.05,1.3*Math.sin(.9)];_vol.rebuild()}return _vol}
/* truth field drawn in the world view from the field's own truth samples */
function drawTruthWorld(g,px,S,F){g.globalCompositeOperation='lighter';
for(let i=0;i<F.tp.length;i++){const r=F.tvc[i*3],gg=F.tvc[i*3+1],b=F.tvc[i*3+2],lu=(r+gg+b)/3;if(lu<.03)continue;
const p=px(F.tp[i]),sz=.05*p[2]*S*(.6+.5*lu);g.globalAlpha=Math.min(.5,lu*.8+.02);
g.drawImage(F.sprFor(r,gg,b),p[0]-sz,p[1]-sz,sz*2,sz*2)}
g.globalAlpha=1;g.globalCompositeOperation='source-over'}
/* one query ray: sphere-clipped march, cache vs truth integrals, crossed ids */
function queryRay(vol,F,o,d,flashT){const bq=o[0]*d[0]+o[1]*d[1]+o[2]*d[2],cq=o[0]*o[0]+o[1]*o[1]+o[2]*o[2]-2.25,disc=bq*bq-cq;
if(disc<=0)return null;const t0=-bq-Math.sqrt(disc),t1=-bq+Math.sqrt(disc),M=34,dt=(t1-t0)/M;let cI=0,tI=0;
for(let k=0;k<M;k++){const tt=t0+(k+.5)*dt,p=[o[0]+d[0]*tt,o[1]+d[1]*tt,o[2]+d[2]*tt];
if(Math.abs(p[0])>=1||Math.abs(p[1])>=1||Math.abs(p[2])>=1)continue;cI+=Math.max(0,F.pred(p))*dt;tI+=vol.gt(p)*dt}
if(flashT!==undefined)for(let i=0;i<F.N;i++){const rx=F.gx[i]-o[0],ry=F.gy[i]-o[1],rz=F.gz[i]-o[2],tt=rx*d[0]+ry*d[1]+rz*d[2];if(tt<t0||tt>t1)continue;
const per=Math.hypot(rx-d[0]*tt,ry-d[1]*tt,rz-d[2]*tt);if(per<.15&&flashT-F.pulse[i]>.5)F.pulse[i]=flashT}
return{t0,t1,cI,tI}}
function chip(g,x,y,v,l,mono,cab){const{cmap}=GRT,c=cmap(Math.min(1,v*.9));g.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;g.fillRect(x,y-8,10,10);g.fillStyle=cab;g.font='500 8.5px '+mono;g.fillText(l+' '+v.toFixed(2),x+16,y)}
return{KC,EYE,vol,drawTruthWorld,queryRay,chip};})();
