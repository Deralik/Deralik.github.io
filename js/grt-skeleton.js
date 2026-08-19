/* GRTCache skeleton wiring — panel mini + doc figures (hero, method pair,
   comparison). Mirrors cinr-skeleton.js's role. */
(()=>{const $=id=>document.getElementById(id);
/* Panel mini — the comparison figure's own GRTCache pane (GRT8T), background off. */
function panel(cv){if(!cv)return;
new GRT8T(cv,{solo:true,label:'THE CACHE — LIVE, TRAINING IN THIS PAGE'});
/* dragging the figure must not read as a click that opens the doc (cINR pattern) */
let moved=0,sx=0,sy=0;
cv.addEventListener('pointerdown',e=>{moved=0;sx=e.clientX;sy=e.clientY},true);
cv.addEventListener('pointermove',e=>{if(sx)moved=Math.max(moved,Math.hypot(e.clientX-sx,e.clientY-sy))},true);
cv.addEventListener('click',e=>{if(moved>6){e.stopPropagation();e.preventDefault()}},true);}
function init(){
panel($('grt-cv-panel'));
const hero=$('grt-cv-hero');
if(hero){const R7=new GRT7A(hero,{ui:$('grt-ro'),azl:$('grt-azl'),nEl:$('grt-n')});
const vb=[['grt-v0','crab'],['grt-v1','bh']];
for(const[id,k]of vb){const el=$(id);if(el)el.onclick=()=>{R7.setVol(k);for(const[id2]of vb)$(id2).classList.toggle('on',id2===id)}}
const rs=$('grt-reset');if(rs)rs.onclick=()=>R7.field.alloc(R7.field.N);
const n=$('grt-n');if(n)n.oninput=e=>R7.field.setN(+e.target.value,performance.now()/1000);
const az=$('grt-az');if(az)az.oninput=e=>R7.pendingAz=+e.target.value}
if($('grt-cv-three'))new GRT8T($('grt-cv-three'));
if($('grt-cv-pipe'))new GRT9A($('grt-cv-pipe'));
if($('grt-cv-train'))new GRT9T($('grt-cv-train'));
}
document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();
