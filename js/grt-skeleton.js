/* GRTCache skeleton wiring — panel mini + doc figures (hero, method pair,
   comparison). Mirrors cinr-skeleton.js's role. */
(()=>{const $=id=>document.getElementById(id);
/* Panel mini — the comparison figure's own GRTCache pane (GRT8T), background off.
   The chip states what is true NOW: Running while frames tick, Held when the
   loop is paused (off-screen, reduced motion) — same vocabulary as cINR's. */
function panel(cv){if(!cv)return;
const t8=new GRT8T(cv,{solo:true,label:'THE CACHE — TRAINED LIVE IN THIS PAGE'});
const chip=$('grt-chip');
if(chip)setInterval(()=>{const on=t8.lastT&&performance.now()/1000-t8.lastT<.5;
  chip.textContent=on?'Running':'Held';chip.classList.toggle('run',!!on)},600);
/* dragging the figure must not read as a click that opens the doc (cINR pattern) */
let moved=0,sx=0,sy=0;
cv.addEventListener('pointerdown',e=>{moved=0;sx=e.clientX;sy=e.clientY},true);
cv.addEventListener('pointermove',e=>{if(sx)moved=Math.max(moved,Math.hypot(e.clientX-sx,e.clientY-sy))},true);
cv.addEventListener('click',e=>{if(moved>6){e.stopPropagation();e.preventDefault()}},true);}
function init(){
panel($('grt-cv-panel'));
const hero=$('grt-cv-hero');
/* the hero's first volume rebuild is ~0.5s of density evaluation — build
   it off the first paint (the site never waits on a demo); its loop only
   draws once visible anyway */
if(hero){const build=()=>{
const R7=new GRT7A(hero,{ui:$('grt-ro'),azl:$('grt-azl'),nEl:$('grt-n')});window.__grt=R7;
const vb=[['grt-v0','butterfly'],['grt-v1','ring'],['grt-v2','mech'],['grt-v3','super']];
const azw=$('grt-az')?$('grt-az').parentElement:null;
const azv=()=>{if(azw)azw.style.display=R7.vol.tfr===false?'none':''};
for(const[id,k]of vb){const el=$(id);if(el)el.onclick=()=>{R7.setVol(k);azv();for(const[id2]of vb)$(id2).classList.toggle('on',id2===id)}}
azv();
const rs=$('grt-reset');if(rs)rs.onclick=()=>R7.resetField();
const n=$('grt-n');if(n)n.oninput=e=>R7.field.setN(+e.target.value,performance.now()/1000);
const az=$('grt-az');if(az)az.oninput=e=>R7.pendingAz=+e.target.value};
if(window.requestIdleCallback)requestIdleCallback(build,{timeout:400});else setTimeout(build,50)}
if($('grt-cv-three'))new GRT8T($('grt-cv-three'));
if($('grt-cv-pipe'))new GRT9A($('grt-cv-pipe'));
if($('grt-cv-train'))new GRT9T($('grt-cv-train'));
}
document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();
