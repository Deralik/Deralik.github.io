/* Skeleton — the depth machine.

   One object, three depths, driven by one config. FIELDS is the only place
   the composition is decided: change a weight and the panel, the rail, the
   strip, the boundary and the tints all follow. Nothing about the layout is
   written in the markup.

   Mobile is deliberately NOT the same machine: it is locked at depth 2 with the
   strip always on top and no dashboard, because a partition needs two
   dimensions and 390px has one to spare. */
(() => {
const MOB=matchMedia('(max-width: 760px)');
const isMob=()=>MOB.matches;

/* ── the config ───────────────────────────────────────────────────────────
   b: 1 = above the boundary, 2 = below it. w: share within the band.
   About takes a fixed column and spans both bands, so it has no b or w. */
const FIELDS=[{k:'about',slug:'about'},{k:'f1',slug:'cinr',b:1,w:6.1},{k:'f2',slug:'grtcache',b:1,w:3.9},{k:'f3',slug:'melioraos',b:2,w:3.6},{k:'f4',slug:'okibi',b:2,w:3.1},{k:'f5',slug:'splat',b:2,w:2.8}];

const body=document.body;
const pbody=document.getElementById('pbody');
const meter=document.getElementById('cbar');
const mstrip=document.getElementById('mstrip');
const F={}; pbody.querySelectorAll('.fl').forEach(e=>{F[e.dataset.k]=e});

let depth=0, open=null, commit=0, dir=0, timer=null;
const CS=getComputedStyle(document.documentElement);
const px=n=>parseInt(CS.getPropertyValue(n),10);
const ABOUT=px('--about')||252, RAIL=px('--rail')||180, STRIP=px('--strip')||34;

const fields=()=>FIELDS;
const proj=()=>fields().filter(f=>f.k!=='about');

/* ── layout ───────────────────────────────────────────────────────────────
   Band height is proportional to the band's total weight; width within a band
   is proportional to the field's weight. */
function geom(){
  const r=pbody.getBoundingClientRect();
  return {W:Math.round(r.width),H:Math.round(r.height)};
}
function depth0(){
  const {W,H}=geom(), out={};
  const b1=proj().filter(f=>f.b===1), b2=proj().filter(f=>f.b===2);
  const s1=b1.reduce((s,f)=>s+f.w,0), s2=b2.reduce((s,f)=>s+f.w,0);
  const h1=s2?Math.round(H*s1/(s1+s2)):H, h2=H-h1;
  out.about=[0,0,ABOUT,H];
  const lay=(arr,y,h,tot)=>{let x=ABOUT;arr.forEach((f,i)=>{
    const w=(i===arr.length-1)?(W-x):Math.round((W-ABOUT)*f.w/tot);
    out[f.k]=[x,y,w,h]; x+=w;});};
  lay(b1,0,h1,s1); if(b2.length)lay(b2,h1,h2,s2);
  return {r:out,h1:h1,f:{}};
}
function layout(){
  if(depth===0)return depth0();
  const {W,H}=geom();
  const others=fields().filter(f=>f.k!==open), tot=others.reduce((s,f)=>s+area(f.k),0);
  const r={},f={}; f[open]='doc';
  if(depth===1){
    r[open]=[0,0,W-RAIL,H];
    let y=0; others.forEach((o,i)=>{const h=(i===others.length-1)?H-y:Math.round(H*area(o.k)/tot);
      r[o.k]=[W-RAIL,y,RAIL,h]; f[o.k]='rail'; y+=h;});
  }else{
    r[open]=[0,STRIP,W,H-STRIP];
    let x=0; others.forEach((o,i)=>{const w=(i===others.length-1)?W-x:Math.round(W*area(o.k)/tot);
      r[o.k]=[x,0,w,STRIP]; f[o.k]='strip'; x+=w;});
  }
  return {r:r,f:f};
}
let AREA={};
function area(k){return AREA[k]||1}

function apply(){
  const fs=fields(), keys=fs.map(f=>f.k);
  Object.keys(F).forEach(k=>{F[k].hidden=keys.indexOf(k)<0});
  fs.forEach((f,i)=>{F[f.k].dataset.band=f.b||'span'; F[f.k].dataset.pa=i||1;});
  if(isMob()){mobile();return}
  const d0=depth0(); AREA={}; fs.forEach(f=>{AREA[f.k]=d0.r[f.k][2]*d0.r[f.k][3]});
  const L=(depth===0)?d0:layout();
  fs.forEach(f=>{
    const el=F[f.k], b=L.r[f.k]; if(!b)return;
    el.style.cssText='';
    el.style.left=b[0]+'px'; el.style.top=b[1]+'px'; el.style.width=b[2]+'px'; el.style.height=b[3]+'px';
    el.dataset.face=L.f[f.k]||'panel';
    el.classList.toggle('opened',L.f[f.k]==='doc');
  });
  dense();
  /* dense() measures the rendered box, which mid-morph is still the OLD
     geometry — re-measure once the transition lands so slots hidden for a
     transitional squeeze come back */
  clearTimeout(apply._dq);
  const td=parseFloat(CS.getPropertyValue('--t'))||0;
  if(td)apply._dq=setTimeout(dense,td*1000+60);
  pbody.dataset.depth=depth;
  syncHash();
}

/* ── URL state: #/slug at depth 1, #/slug/doc at depth 2, none at home.
   replaceState keeps the history clean; ↑/Esc remain the way back up. */
function syncHash(){
  const f=open&&fields().find(x=>x.k===open);
  const h=f?('#/'+f.slug+(depth===2&&!isMob()?'/doc':'')):'';
  if(location.hash===h||(!h&&!location.hash))return;
  history.replaceState(null,'',h||location.pathname+location.search);
}
function fromHash(){
  const m=location.hash.match(/^#\/([\w-]+)(\/doc)?$/); if(!m)return false;
  const f=fields().find(x=>x.slug===m[1]); if(!f)return false;
  open=f.k; depth=m[2]?2:1; if(isMob())depth=2;
  return true;
}
addEventListener('hashchange',()=>{
  if(fromHash())apply();
  else if(!location.hash){depth=0;open=null;pbody.classList.remove('to1','to2');apply()}
});

/* A field carries what it has room for. Priority is caption, then prose, then
   quantities, then the capability chip, and last the figure itself — the title
   and the tier never drop, because they are what makes the field a field.
   Measured every time from the rendered box, so the floor moves with the real
   content rather than with a number typed here. */
function dense(){
  fields().forEach(f=>{
    const fl=F[f.k], g=fl.querySelector('.face-panel .slot.grow');
    if(g)g.style.minHeight=Math.max(56,Math.round(fl.getBoundingClientRect().height*0.5))+'px';
  });
  fields().forEach(f=>{
    const el=F[f.k], fa=el.querySelector('.face-panel'); if(!fa||el.dataset.face!=='panel')return;
    el.removeAttribute('data-dense');
    const over=()=>{
      const kids=[].slice.call(fa.children).filter(c=>getComputedStyle(c).display!=='none');
      const last=kids[kids.length-1]; if(!last)return 0;
      return last.getBoundingClientRect().bottom-(fa.getBoundingClientRect().bottom-13);
    };
    for(let lvl=1;lvl<=5&&over()>1;lvl++)el.dataset.dense=lvl;
  });
}

/* ── mobile: locked at depth 2, strip on top, one document at a time ───── */
function mobile(){
  if(!open)open=proj()[0].k;
  fields().forEach(f=>{const el=F[f.k]; el.style.cssText=''; el.dataset.face='doc';
    el.classList.toggle('opened',f.k===open);});
  pbody.dataset.depth=2;
  mstrip.innerHTML='';
  fields().forEach(f=>{
    const b=document.createElement('button');
    b.textContent=F[f.k].dataset.label||f.k;
    b.setAttribute('aria-current',f.k===open?'true':'false');
    b.onclick=()=>{open=f.k;mobile();window.scrollTo(0,0)};
    mstrip.appendChild(b);
  });
  const idl=document.querySelector('.idl');
  document.documentElement.style.setProperty('--mtop',Math.round(idl.getBoundingClientRect().height)+'px');
  syncHash();
}

/* ── committed depth changes ─────────────────────────────────────────────
   1 ⇄ 2 costs a sustained scroll in one direction; letting go throws it away. */
function meterTo(v){
  meter.style.height=Math.min(1,v)*100+'%';
  meter.parentNode.style.opacity=v>0.02?1:0;
}
const RM=matchMedia('(prefers-reduced-motion: reduce)');
/* the page leans with the reader: the open document shifts a few px in the
   scroll direction while commitment builds, and eases back if they let go */
function react(v){
  if(RM.matches)return;
  const doc=open?F[open].querySelector('.face-doc'):null;if(!doc)return;
  if(dir>0&&depth===1){
    /* leaning toward D2 genuinely reveals more of it: the doc pre-scrolls,
       so the reference title rises into view rather than sliding off */
    doc.style.transition='';doc.style.transform='';
    if(v)doc.scrollTop=Math.min(1,v)*26;else doc.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  doc.style.transition=v?'transform .06s linear':'transform .35s';
  doc.style.transform=v?'translateY('+(-dir*Math.min(1,v)*18)+'px)':'';
}
function cross(d){
  const doc0=open?F[open].querySelector('.face-doc'):null;
  if(doc0){doc0.style.transition='';doc0.style.transform=''}
  commit=0;dir=0;meterTo(0);
  const doc=open?F[open].querySelector('.face-doc'):null;
  if(d>0&&depth===1){depth=2;pbody.classList.remove('to1');pbody.classList.add('to2');apply();
    if(doc){const s=doc.querySelector('.dsec');
      setTimeout(()=>{doc.scrollTop=s?Math.max(0,s.offsetTop-STRIP-8):0},RM.matches?0:340);}}
  else if(d<0&&depth===2){depth=1;pbody.classList.remove('to2');pbody.classList.add('to1');apply();if(doc)doc.scrollTop=0}
  else if(d<0&&depth===1){depth=0;open=null;pbody.classList.remove('to1','to2');apply()}
}
function push(d,amt){
  if(d!==dir){dir=d;commit=0}
  commit+=amt; meterTo(commit); react(commit);
  clearTimeout(timer); timer=setTimeout(()=>{commit=0;meterTo(0);react(0);dir=0},420);
  if(commit>=1)cross(d);
}
pbody.addEventListener('wheel',e=>{
  if(isMob()||depth===0)return;
  const doc=F[open].querySelector('.face-doc');
  if(depth===2){ if(e.deltaY>0)return; if(doc&&doc.scrollTop>2)return; }
  e.preventDefault(); push(e.deltaY>0?1:-1,Math.abs(e.deltaY)/440);
},{passive:false});

pbody.addEventListener('click',e=>{
  const fl=e.target.closest('.fl'); if(!fl||isMob())return;
  if(e.target.closest('.bk')){cross(-1);if(depth===1)cross(-1);return}
  if(e.target.closest('.face-doc'))return;
  open=fl.dataset.k; depth=1; pbody.classList.remove('to1','to2'); apply();
});
addEventListener('keydown',e=>{
  const tg=e.target; if(tg&&tg.matches&&tg.matches('select,input,textarea'))return;
  if(isMob())return;
  if(e.key==='ArrowDown'){e.preventDefault(); if(depth===0){open=proj()[0].k;depth=1;apply()}else cross(1)}
  if(e.key==='ArrowUp'){e.preventDefault(); cross(-1)}
  if(e.key==='Escape'){depth=0;open=null;apply()}
  const n=parseInt(e.key,10);
  if(n>=1&&n<=7){const p=proj()[n-1]; if(p){open=p.k;depth=1;apply()}}
});
addEventListener('resize',()=>{body.classList.toggle('mob',isMob());apply()});

/* ── theme toggle — writes the override; the inline head script owns first
   paint and the system-change fallback. Canvases re-read tokens per frame. */
const thm=document.getElementById('thm');
if(thm){
  const bs=[].slice.call(thm.querySelectorAll('button'));
  const mark=()=>{const t=document.documentElement.dataset.theme;
    bs.forEach(b=>b.classList.toggle('on',b.dataset.t===t))};
  bs.forEach(b=>b.onclick=()=>{
    try{localStorage.setItem('theme',b.dataset.t)}catch(err){}
    document.documentElement.dataset.theme=b.dataset.t; mark();});
  new MutationObserver(mark).observe(document.documentElement,
    {attributes:true,attributeFilter:['data-theme']});
  mark();
}

body.classList.toggle('mob',isMob());
fromHash();
apply();
addEventListener('load',()=>{apply()});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>apply());
if(window.ResizeObserver){
  let q=false;
  new ResizeObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;apply()})}).observe(pbody);
}
})();
