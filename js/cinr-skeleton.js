/* cINR f1 — wiring: ONE bunny render shared by card and demo (owner
   2026-08-20: the render persists across depths — it MIGRATES between the
   card slot and the demo slot with a FLIP glide matched to the morph; card
   mode locks the LoD and mutes the cache). Markup in index.html; drawing
   in cinr-figs.js. */
(() => {
if(!window.CINR||!CINR.T)return;
const fl=document.querySelector('.fl[data-k="f1"]'); if(!fl)return;
const $=s=>fl.querySelector(s);
const cv=$('#cinr-cv'),cvM=$('#cinr-cv-map'),chip=$('#cinr-chip');
const slotP=$('.cfigp'),slotD=$('.cfigd');
const setChip=on=>{if(!chip)return;chip.textContent=on?'Running':'Held';chip.classList.toggle('run',on)};
const cvw=CINR.cacheView(cvM);
/* one saved view for the one render (the old per-face key is retired) */
let sv={};try{sv=JSON.parse(localStorage.getItem('cinr-view')||'{}')}catch(e){}
if(!(sv.zoom>0))sv.zoom=1.37;if(typeof sv.lod!=='number')sv.lod=-0.09;
const hero=CINR.bunny(cv,{mode:'card',onBricks:cvw.feed,fresh:cvw.fresh,anyFresh:cvw.anyFresh,onState:setChip,initZoom:sv.zoom,initLod:sv.lod});
const saveV=()=>{try{localStorage.setItem('cinr-view',JSON.stringify(hero.getView()))}catch(e){}};
cv.addEventListener('pointerup',saveV);cv.addEventListener('dblclick',saveV);
/* migrate the canvas to the slot its face shows; FLIP the jump so the
   render glides between positions in step with the depth morph */
const RMq=matchMedia('(prefers-reduced-motion: reduce)');
function place(){
  const mob=document.body.classList.contains('mob');
  const face=mob?'doc':fl.dataset.face;
  const target=(face==='panel')?slotP:slotD;
  if(!target||cv.parentNode===target)return;
  const r0=cv.getBoundingClientRect();
  target.appendChild(cv);
  hero.setMode(target===slotP?'card':'demo');
  if(r0.width&&!RMq.matches){
    /* chase-FLIP: the slot itself is still morphing, so each frame we
       re-aim at its CURRENT rect — the render travels a clean monotonic
       path from where it was to wherever the slot settles (a fixed-target
       FLIP bulges when the target keeps moving) */
    const t0=performance.now(),D=360,ease=p=>1-Math.pow(1-p,3);
    /* the slot itself is mid-morph, so its transient size mis-aims a naive
       lerp; the direction is known (the card is always the smaller slot),
       so clamp the size monotonic and no bulge can render */
    const shrink=target===slotP;let pw=r0.width,ph=r0.height;
    cv.style.transformOrigin='0 0';cv.style.transition='none';
    cancelAnimationFrame(place._raf);
    const step=()=>{
      const p=Math.min(1,(performance.now()-t0)/D),e=ease(p);
      const sr=target.getBoundingClientRect();
      if(!sr.width){cv.style.transform='';return}
      const L=r0.left+(sr.left-r0.left)*e,T=r0.top+(sr.top-r0.top)*e;
      let Wd=r0.width+(sr.width-r0.width)*e,Hh=r0.height+(sr.height-r0.height)*e;
      Wd=shrink?Math.min(pw,Wd):Math.max(pw,Wd);Hh=shrink?Math.min(ph,Hh):Math.max(ph,Hh);
      pw=Wd;ph=Hh;
      cv.style.transform='translate('+(L-sr.left)+'px,'+(T-sr.top)+'px) scale('+(Wd/sr.width)+','+(Hh/sr.height)+')';
      if(p<1)place._raf=requestAnimationFrame(step);
      else cv.style.transform='';
    };
    step();
  }
}
const animBtn=$('#cinr-anim'),resetBtn=$('#cinr-reset');
if(animBtn)animBtn.addEventListener('click',()=>{animBtn.textContent='Animation · '+(hero.toggle()?'on':'off')});
if(resetBtn)resetBtn.addEventListener('click',()=>{hero.reset();saveV()});
const clearBtn=$('#cinr-clear'),capIn=$('#cinr-cap'),lodIn=$('#cinr-lod');
if(clearBtn)clearBtn.addEventListener('click',()=>cvw.clear());
/* 'unranked sweep', not 'first-come': the demo's unranked mode fills by brick
   index, not true arrival order — the paper's baseline name would overclaim */
const ordBtn=$('#cinr-order');let ord='rank';
if(ordBtn)ordBtn.addEventListener('click',()=>{ord=ord==='rank'?'fifo':'rank';
  cvw.setOrder(ord);ordBtn.textContent='Fill order · '+(ord==='rank'?'ranked':'unranked sweep')});
if(capIn)capIn.addEventListener('input',()=>cvw.setCap(capIn.value/100));
if(lodIn&&hero){lodIn.value=Math.round(sv.lod*100);lodIn.addEventListener('input',()=>{hero.setLod(lodIn.value/100);saveV()})}
CINR.pipeline($('#cinr-cv-pipe'));
CINR.rankPanel($('#cinr-cv-pri'));
CINR.fpsPanel($('#cinr-cv-t1'),'inr');
CINR.fpsPanel($('#cinr-cv-t2'),'preload');
const lg=(el,names)=>{if(el)el.innerHTML=names.map(n=>'<span><i class="csw" style="background:'+CINR.DS(CINR.DSN[n])+'"></i>'+n+'</span>').join('')};
lg($('#cinr-tlg'),Object.keys(CINR.DSN).sort());
lg($('#cinr-prilg'),['flower','miranda','richtmyer']);
/* the table, derived from the same array the plot draws — one source */
const tb=$('#cinr-table');
if(tb){
  const gmax=Math.max.apply(null,CINR.T.map(r=>r[1]/r[2]).concat(CINR.T.map(r=>r[3]/r[4])))*1.28;
  const cell=(r,i,a,b)=>{const g=r[a]/r[b];
    return '<span class="cmode '+(a===1?'rm':'pt')+'"><em class="cfps">'+r[b].toFixed(1)+' → '+r[a].toFixed(1)+'</em>'+
      '<span class="cbar"><b style="width:'+(g/gmax*100).toFixed(1)+'%;background:'+CINR.DS(i)+'"></b><i>'+g.toFixed(2)+'×</i></span></span>'};
  const bySize=CINR.T.map((r,i)=>[r,i]).sort((a,b)=>(a[0][5][0]*a[0][5][1]*a[0][5][2]*(a[0][0]==='DNS'?8:4))-(b[0][5][0]*b[0][5][1]*b[0][5][2]*(b[0][0]==='DNS'?8:4)));
  const rows=bySize.map(([r,i])=>'<div class="ctr"><span>'+r[0]+'</span><span class="cdim">'+CINR.SZ(r,i)+'</span>'+cell(r,i,1,2)+cell(r,i,3,4)+'</div>').join('');
  tb.innerHTML='<div class="ctr cth"><span>dataset</span><span class="cdim">size</span><span>ray-march · INR → cached FPS · gain</span><span>path-trace · INR → cached FPS · gain</span></div>'+rows;
  const mm=sel=>{const a=CINR.T.map(sel);return (a.reduce((s,v)=>s+v,0)/a.length).toFixed(2)};
  const nts=tb.nextElementSibling;
  if(nts&&nts.classList.contains('cnotes'))nts.insertAdjacentHTML('afterbegin',
    '<span>row means, derived: '+mm(r=>r[1]/r[2])+'× ray-march · '+mm(r=>r[3]/r[4])+'× path-trace — the basis of the ~5× and ~2× above</span>');
}
/* the one canvas computes whenever its field shows a face that carries it */
const setFocus=()=>{const mob=document.body.classList.contains('mob');
  const face=mob?(fl.classList.contains('opened')?'doc':null):fl.dataset.face;
  window.__cinrFocus=(face==='doc'||face==='panel')?cv:null;
  place()};
new MutationObserver(setFocus).observe(fl,{attributes:true,attributeFilter:['data-face','class']});
new MutationObserver(setFocus).observe(document.body,{attributes:true,attributeFilter:['class']});
setFocus();
/* dragging the figure must not read as a click that opens the doc */
let moved=0,sx=0,sy=0;
cv.addEventListener('pointerdown',e=>{moved=0;sx=e.clientX;sy=e.clientY},true);
cv.addEventListener('pointermove',e=>{if(sx)moved=Math.max(moved,Math.hypot(e.clientX-sx,e.clientY-sy))},true);
cv.addEventListener('click',e=>{if(moved>6){e.stopPropagation();e.preventDefault()}},true);
})();
