/* cINR f1 — wiring: figures in, focus management, derived table.
   All content markup is in Skeleton.html; all drawing in cinr-figs.js. */
(() => {
if(!window.CINR||!CINR.T)return;
const fl=document.querySelector('.fl[data-k="f1"]'); if(!fl)return;
const $=s=>fl.querySelector(s);
const cvP=$('#cinr-cv-panel'),cvD=$('#cinr-cv-doc'),cvM=$('#cinr-cv-map'),chip=$('#cinr-chip');
const setChip=on=>{if(!chip)return;chip.textContent=on?'Running':'Held';chip.classList.toggle('run',on)};
const cvw=CINR.cacheView(cvM);
let svP={};try{svP=JSON.parse(localStorage.getItem('cinr-view-panel')||'{}')}catch(e){}
const pnl=CINR.bunny(cvP,{ground:'--band1',onState:setChip,initZoom:svP.zoom>0?svP.zoom:1.3});
const savePV=()=>{try{localStorage.setItem('cinr-view-panel',JSON.stringify(pnl.getView()))}catch(e){}};
cvP.addEventListener('pointerup',savePV);cvP.addEventListener('dblclick',savePV);
/* the tuned view is the default; any later adjustment persists as the new one */
let sv={};try{sv=JSON.parse(localStorage.getItem('cinr-view')||'{}')}catch(e){}
if(!(sv.zoom>0))sv.zoom=1.37;if(typeof sv.lod!=='number')sv.lod=-0.09;
const hero=CINR.bunny(cvD,{onBricks:cvw.feed,fresh:cvw.fresh,anyFresh:cvw.anyFresh,initZoom:sv.zoom,initLod:sv.lod});
const saveV=()=>{try{localStorage.setItem('cinr-view',JSON.stringify(hero.getView()))}catch(e){}};
cvD.addEventListener('pointerup',saveV);cvD.addEventListener('dblclick',saveV);
const animBtn=$('#cinr-anim'),resetBtn=$('#cinr-reset');
if(animBtn&&hero)animBtn.addEventListener('click',()=>{animBtn.textContent='Animation · '+(hero.toggle()?'on':'off')});
if(resetBtn&&hero)resetBtn.addEventListener('click',()=>{hero.reset();saveV()});
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
    '<span>row means, derived: '+mm(r=>r[1]/r[2])+'× ray-march · '+mm(r=>r[3]/r[4])+'× path-trace — the basis of the ~5× and 2× above</span>');
}
/* one figure computes at a time, and only on the face being looked at */
const setFocus=()=>{const mob=document.body.classList.contains('mob');
  const f=mob?(fl.classList.contains('opened')?'doc':null):fl.dataset.face;
  window.__cinrFocus=f==='doc'?cvD:f==='panel'?cvP:null};
new MutationObserver(setFocus).observe(fl,{attributes:true,attributeFilter:['data-face','class']});
new MutationObserver(setFocus).observe(document.body,{attributes:true,attributeFilter:['class']});
setFocus();
/* dragging the panel figure must not read as a click that opens the doc */
let moved=0,sx=0,sy=0;
cvP.addEventListener('pointerdown',e=>{moved=0;sx=e.clientX;sy=e.clientY},true);
cvP.addEventListener('pointermove',e=>{if(sx)moved=Math.max(moved,Math.hypot(e.clientX-sx,e.clientY-sy))},true);
cvP.addEventListener('click',e=>{if(moved>6){e.stopPropagation();e.preventDefault()}},true);
})();
