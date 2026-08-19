/* About depth-1, v2.1 — plain-language strips, purposeful geometry.
   Provenance and precision live in about-record.json; the reader-facing strips
   speak about the experience itself. Geometry rules (each drawn only where its
   meaning applies): wash = date resolution · open ring = ongoing · dotted lead
   = unknown start · dashed = in submission · thin tail = supporting role. */
(() => {
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const D=new Date(),NOW=D.getFullYear()+(D.getMonth()+.5)/12,NOWLAB='now · '+MONTHS[D.getMonth()]+' '+D.getFullYear();
const PREC_MO={day:0,month:.5,season:1.5,term:2,year:6};
function parse(s){
  if(!s)return null;
  if(s.length===4)return{t:+s+.5,p:'year'};
  const y=+s.slice(0,4),m=+s.slice(5,7);
  if(s.length===7)return{t:y+(m-.5)/12,p:'month'};
  return{t:y+((m-1)+(+s.slice(8,10)-1)/31)/12,p:'day'};
}
const LEARN=[
 {id:'r-ucd',label:'UC Davis',sub:'Bachelor’s & Master’s',spans:['ucd','ucd-ms'],kind:'edu'},
 {id:'r-arc',label:'American River College',sub:'6 associate degrees',spans:['arc'],kind:'edu'},
 {id:'r-hs',label:'Visions In Education',sub:'HS, under college',spans:['hs'],kind:'edu'}
];
const DOING=[
 {id:'r-res',label:'Research',sub:'VIDI Lab',spans:['cinr-work'],kind:'res'},
 {id:'r-teach',label:'Teaching',sub:'ARC tutor → 3× TA',spans:['tutor-arc','ta-algo','ta-cv','ta-arch'],kind:'teach'},
 {id:'r-vz',label:'VZ Plumbing',sub:'family business',spans:['vz'],kind:'work'},
 {id:'r-snd',label:'Grace Family Church',sub:'live sound, weekly',spans:['sound'],kind:'vol'},
 {id:'r-prod',label:'Products',sub:'MelioraOS · Okibi',spans:['meliora','okibi'],kind:'proj',labelSide:'below',dy:8}
];
const MARKROW={'hs-grad':'r-hs','cc-degrees':'r-arc','bs':'r-ucd','ms-candidacy':'r-ucd','ms-awarded':'r-ucd','cinr-accepted':'r-res','cinr-published':'r-res','grt-rejected':'r-res','mel-beta':'r-prod','okb-public':'r-prod'};
const SHORT={'hs-grad':'HS diploma','bs':'BS awarded','ms-candidacy':'candidacy','ms-awarded':'MS awarded','cc-degrees':'six associate degrees — HIGHEST HONORS','cinr-accepted':'accepted','cinr-published':'presented','grt-rejected':'rejected','mel-beta':'private beta','okb-public':'public'};
const TWOLINE={};
const TIER={'ms-candidacy':1,'cinr-accepted':1};
const MTICK={'mel-beta':{top:-13,h:12},'okb-public':{top:2,h:11}};
const MSIDE={'mel-beta':'up'}; /* short tick: crosses Meliora's bar only, not Okibi's below it */
/* reader-facing copy: experience, not provenance */
const STRIP={
 'r-ucd':{t:'UC Davis — BS → MS, Computer Science',d:'Sep 2021 – Jun 2023 · Jan 2025 – Jun 2026',c:'Joined as a junior and completed my BS in under two years with a 3.78 GPA, added to the Dean\u2019s List spring of 2022. I returned for my MS a year and a half later, finishing at a 3.96 GPA with broad graduate coursework in machine learning, generative models, computer architecture, and security. I joined the VIDI Lab as an undergraduate in my final quarter and stayed on through the gap between degrees, with TA appointments in Winter 2022, Fall 2025, and Winter 2026 alongside.'},
 'r-arc':{t:'American River College — six associate degrees',d:'Fall 2017 – Spring 2021',c:'Computer science as the primary field, alongside economics, mathematics and physics — Highest Honors: 3.88 over 107 units, up to seven courses and 22 units in a term, with a broad range of electives covering foreign languages, music, and physical education. Active in the CS club from the second term, treasurer in the last.',ev:['19 May 2021 — all conferred · Highest Honors','AA-T Economics','AS-T Mathematics','AS Mathematics','AS-T Physics','AS Physical Science & Math','AS Computer Science','IGETC certificate'],evGrid:true},
 'r-hs':{t:'Visions In Education — high school',d:'graduated Jun 2019',c:'Graduated with about 366 units against the ~220 required — took nearly every elective offered, 8–10 classes a term, at a ~4.2 GPA — with dual-enrollment in community college beginning at age 16.'},
 'r-res':{t:'Research — VIDI Lab, UC Davis',d:'Summer 2024 – present',c:'Work on cINR — a GPU cache pipeline over a neural volume representation — ran from the summer of 2024 through acceptance at EGPGV 2025, presented in Luxembourg on June 2nd: first author, Honorable Mention. GRTCache followed near the end of that summer — a neural radiance cache over ray-traced 3D Gaussians, submitted to HPG 2026 and rejected on 8 May; improvements toward resubmission continue.',ev:['<u>   Mar 2025</u>— cINR accepted','<u> 2 Jun 2025</u>— cINR presented · EGPGV','<u> 8 May 2026</u>— GRTCache rejected · HPG']},
 'r-teach':{t:'Teaching — ARC and UC Davis',d:'tutoring Sep 2020 – May 2021 · TA Win 2022 · Fal 2025 · Win 2026',c:'A year tutoring C++ at ARC, then TAs for Algorithm Design, Computer Vision and Computer Architecture — led sections, co-designed exams, held office hours.'},
 'r-vz':{t:'VZ Plumbing — technician & financial officer',d:'~2016 – present',c:'Started around fifteen — working more through breaks and the gaps between programs than during terms. Estimates, invoicing, permitting and legal paperwork for the family trade business, part time in the field. The domain knowledge MelioraOS is built on.'},
 'r-snd':{t:'Grace Family Church — assistant sound engineer',d:'~2019 – present',c:'Started around 2019 — mentored by the church\u2019s professional sound engineer since mid-2021, and running the front-of-house board as the primary live-sound engineer since late 2025. Weekly mixing for a congregation of 300+, plus event setup and maintenance.'},
 'r-prod':{t:'Products — MelioraOS · Okibi',d:'May 2026 – present',c:'MelioraOS: construction management built solo with an agent fleet — first commit to closed beta with a live customer in 47 days, 29 dated releases through 25 Jul, development continuing.<br>Okibi: a task and habit tracker in daily use, where unfinished work burns to a permanent record — 16 releases since mid-June, in private beta.',ev:['<u> 5 May 2026</u>— MelioraOS first commit','<u>15 Jun 2026</u>— Okibi first commit','<u>21 Jun 2026</u>— MelioraOS private beta','<u> 2 Aug 2026</u>— Okibi first public release']}
};

fetch('data/about-record.json').then(r=>r.json()).then(rec=>{
  const S={};rec.spans.forEach(s=>{
    const a=parse(s.start),b=parse(s.end);
    S[s.id]={raw:s,t0:a?a.t:2017.15,t1:b?b.t:NOW,unk:!a,
      ongo:!s.end&&(s.ongoing||(s.precision&&s.precision.end==='ongoing')),
      p0:s.precision?s.precision.start:'unknown',p1:s.precision?s.precision.end:'—'};
  });
  const marks=rec.marks.filter(m=>MARKROW[m.id]).map(m=>({raw:m,t:parse(m.date).t,row:MARKROW[m.id],lab:SHORT[m.id]!==undefined?SHORT[m.id]:m.label}));
  const pf=document.getElementById('about-plots');if(pf)pf.textContent=rec.spans.length+' spans, every one dated · 2017 → now';
  const rv=document.getElementById('about-railv');if(rv)rv.textContent=Math.floor(NOW-2017.05);
  document.querySelectorAll('[data-count]').forEach(e=>{
    e.textContent=rec.spans.length+' spans · '+(LEARN.length+DOING.length)+' rows · '+marks.length+' events — drawn from the project record';
  });
  const rndr=()=>{try{draw(S,marks,rec)}catch(e){console.warn('tl',e)}};
  const mcr=()=>{try{drawVRec(S,rec)}catch(e){}};
  rndr();mcr();
  if(window.ResizeObserver){let q;const ro=new ResizeObserver(()=>{clearTimeout(q);q=setTimeout(()=>{rndr();mcr()},140)});
    const t1=document.getElementById('about-tl');if(t1)ro.observe(t1);
    const m1=document.getElementById('about-vrec');if(m1)ro.observe(m1);}
}).catch(err=>{
  const e=document.getElementById('about-tl');
  if(e)e.innerHTML='<div style="padding:30px;font:11px var(--mono);color:var(--absence)">about-record.json failed to load — '+err+'</div>';
});

function draw(S,marks,rec){
  const host=document.getElementById('about-tl');
  if(!host)return;host.innerHTML='';
  /* the reference tier peeks below the record at depth 1: the timeline takes
     what the viewport gives, minus the legend and ~a title's worth of D2 */
  const dv=host.closest('.face-doc'),pbEl=document.getElementById('pbody');
  /* height is set once, from the depth-1 viewport, and held through depth
     changes — crossing 1⇄2 squishes the record horizontally only */
  if(dv&&pbEl&&pbEl.dataset.depth==='1'&&dv.clientHeight>560){
    const top=host.getBoundingClientRect().top-dv.getBoundingClientRect().top+dv.scrollTop;
    host.dataset.h=Math.max(470,Math.round(dv.clientHeight-top-28-34));
  }
  if(host.dataset.h)host.style.height=host.dataset.h+'px';
  /* variant by the width the figure will actually be SEEN at: at page load
     the doc face is hidden inside a 252px field, so raw clientWidth picks
     the vertical form and the first open flashes it before the observer
     redraws. When the face is hidden on desktop, predict the depth-1 doc
     width (panel minus rail minus the dsec margins) instead. */
  let dw=host.clientWidth;
  const fl=host.closest('.fl');
  if(fl&&fl.dataset.face!=='doc'&&!document.body.classList.contains('mob')){
    const pb=document.getElementById('pbody');
    if(pb)dw=Math.max(dw,pb.clientWidth-244);
  }
  if(dw<950){drawV(host,S,marks);return}
  host.classList.remove('vert');
  const ovl=document.getElementById('about-vlist');if(ovl)ovl.remove();
  const LBL=170,W=dw-14,T0=2017.05,T1=NOW+.35;
  const X=t=>LBL+(t-T0)/(T1-T0)*(W-LBL);
  const Y0=238,PITCH=36,EXPL=156,EXPD=124;
  const yLearn=i=>Y0-48-i*PITCH, yDoing=i=>Y0+48+i*PITCH;
  const el=(c,css)=>{const d=document.createElement('div');d.className=c;if(css)Object.assign(d.style,css);host.appendChild(d);return d};
  const cand=parse((rec.marks.find(m=>m.id==='ms-candidacy')||{}).date||'2026-04-01').t;

  for(let y=2018;y<=Math.floor(NOW);y++){
    el('yg',{left:X(y)+'px'});
    const t=el('yt',{left:X(y)+'px',top:(Y0+7)+'px'});t.textContent=y;
  }
  el('axmid',{left:LBL+'px',width:(X(T1)-LBL)+'px',top:Y0+'px'});
  el('nowln',{left:X(NOW)+'px'});
  const nl=el('nowlab',{left:(X(NOW)-4)+'px',top:'2px'});nl.textContent=NOWLAB;
  const bl1=el('bband',{left:'0',top:(Y0-16)+'px'});bl1.textContent='↑ learning';
  const bl2=el('bband',{left:'0',top:(Y0+8)+'px'});bl2.textContent='↓ doing';

  const rows=[],joints=[];
  function buildRow(r,idx,band){
    const cy=(band==='L'?yLearn(idx):yDoing(idx))+(r.dy||0);
    const g={cfg:r,band:band,idx:idx,cy:cy,els:[],baseTops:{}};
    const hbg=el('rowbg',{left:'0',width:W+'px',top:(cy-17)+'px'});g.els.push(hbg);
    g.els.push(el('trk2',{left:LBL+'px',width:(X(T1)-LBL)+'px',top:cy+'px'}));
    const lab=el('rowlab',{top:(cy-13)+'px'});
    lab.innerHTML='<b>'+r.label+'</b><i>'+r.sub+'</i>';g.els.push(lab);
    const hot=el('rowhot',{left:'0',width:W+'px',top:(cy-17)+'px'});g.els.push(hot);
    hot.dataset.row=r.id;hot.tabIndex=0;
    hot.onmouseenter=()=>hbg.classList.add('hov');
    hot.onmouseleave=()=>hbg.classList.remove('hov');
    r.spans.forEach(sid=>{
      const s=S[sid];if(!s)return;
      const sub=(sid==='flc');
      let x0=X(s.t0),x1=X(s.ongo?NOW:s.t1);
      if(sid==='ucd'&&S.vidi){
        /* the lab rides the institution row as a captioned wash; TA terms are
           underline markings; the thin line bridges BS to MS — not enrolled,
           still in the lab */
        const xv=X(S.vidi.t0);
        g.els.push(el('wash',{left:xv+'px',width:Math.max(3,X(NOW)-xv)+'px',top:(cy-11)+'px'}));
        const vc=el('duallab',{left:(xv+4)+'px',top:(cy+13)+'px'});vc.textContent='VIDI Lab →';g.els.push(vc);
        g.els.push(el('term',{left:(X(NOW)-4)+'px',top:(cy-4)+'px'}));
        ['ta-algo','ta-cv','ta-arch'].forEach(tid=>{
          const t=S[tid];if(!t)return;
          g.els.push(el('tmark',{left:X(t.t0)+'px',width:Math.max(4,X(t.t1)-X(t.t0))+'px',top:(cy+10)+'px'}));
          const tc=el('duallab',{left:(X(t.t0)+5)+'px',top:(cy+16)+'px'});tc.textContent='TA';g.els.push(tc);
        });
      }
      if(sid==='ucd-ms'&&S.ucd){
        g.els.push(el('bridge',{left:X(S.ucd.t1)+'px',width:Math.max(3,X(s.t0)-X(S.ucd.t1))+'px',top:(cy-1)+'px'}));
      }
      if(sid==='arc'&&s.raw.club&&S.hs){
        /* load was capped at two classes a term until HS ended: thin stretch,
           then the full ribbon; the CS-club years wash the background, the
           treasurer term a step darker */
        const xh=X(S.hs.t1),xc=X(parse(s.raw.club.start).t),xt=X(parse(s.raw.club.treasurer).t);
        g.els.push(el('wash',{left:xc+'px',width:Math.max(3,x1-xc)+'px',top:(cy-11)+'px'}));
        g.els.push(el('tmark',{left:xt+'px',width:Math.max(3,x1-xt)+'px',top:(cy+10)+'px'}));
        const sa=el('seg edu thin',{left:x0+'px',width:Math.max(5,xh-x0)+'px',top:(cy-3)+'px'});sa.dataset.row=r.id;g.els.push(sa);
        const sb=el('seg edu',{left:xh+'px',width:Math.max(5,x1-xh)+'px',top:(cy-7)+'px'});sb.dataset.row=r.id;g.els.push(sb);
        const c1=el('duallab',{left:(xc+4)+'px',top:(cy+13)+'px'});c1.textContent='CS club →';g.els.push(c1);
        const ttx='treasurer',tj=S['tutor-arc']?X(S['tutor-arc'].t1)-2:x1;
        const c2=el('duallab',{left:(tj-6-ttx.length*6)+'px',top:(cy+16)+'px'});c2.textContent=ttx;g.els.push(c2);
        return;
      }
      if(sid==='hs'&&S.arc){
        /* the dual-enrolled stretch reads as a background wash behind the bar
           (the ARC edge-wash register), with dotted joints tying it to ARC */
        const xa=X(S.arc.t0);
        g.els.push(el('wash hi',{left:xa+'px',width:Math.max(3,x1-xa)+'px',top:(cy-11)+'px'}));
        const xL=s.unk?LBL:x0;
        const s1=el('seg edu',{left:xL+'px',width:Math.max(5,x1-xL)+'px',top:(cy-7)+'px'});s1.dataset.row=r.id;g.els.push(s1);
        const dl=el('duallab',{left:(xa+7)+'px',top:(cy+11)+'px'});dl.textContent='dual-enrolled →';g.els.push(dl);
        [xa,x1].forEach((cx,k)=>{joints.push({el:el('conn',{left:(cx-(k?2:0))+'px',top:(cy+7)+'px',height:'22px'}),a:'r-hs',b:'r-arc',t:cy+7,h:22})});
        return;
      }
      if(sid==='meliora'){
        const sv=el('seg proj',{left:x0+'px',width:Math.max(5,x1-x0)+'px',top:(cy-9)+'px',height:'8px'});sv.dataset.row=r.id;g.els.push(sv);
        g.els.push(el('term',{left:(X(NOW)-4)+'px',top:(cy-9)+'px'}));
        const mc=el('duallab',{left:'0px',top:(cy-8)+'px'});mc.textContent='MelioraOS';g.els.push(mc);
        mc.style.left=Math.max(2,x0-4-mc.getBoundingClientRect().width)+'px';
        return;
      }
      if(sid==='okibi'){
        const sv=el('seg proj',{left:x0+'px',width:Math.max(5,x1-x0)+'px',top:(cy+3)+'px',height:'6px'});sv.dataset.row=r.id;g.els.push(sv);
        g.els.push(el('term',{left:(X(NOW)-4)+'px',top:(cy+2)+'px'}));
        const oc=el('duallab',{left:'0px',top:(cy+3)+'px'});oc.textContent='Okibi';g.els.push(oc);
        oc.style.left=Math.max(2,x0-4-oc.getBoundingClientRect().width)+'px';
        return;
      }
      if(sid==='sound'){
        const m0=X(parse('2021-07').t),f0=X(parse('2025-07').t),xn=X(NOW);
        const px=[x0,m0,f0,xn],th=[3,6,10];
        g.els.push(el('wash',{left:m0+'px',width:Math.max(3,xn-m0)+'px',top:(cy-11)+'px'}));
        for(let k=0;k<3;k++){const L=px[k],Rt=px[k+1];if(Rt-L<2)continue;
          const sv=el('seg vol',{left:L+'px',width:(Rt-L)+'px',top:(cy-th[k]/2)+'px',height:th[k]+'px'});
          sv.dataset.row=r.id;g.els.push(sv);}
        const mc=el('duallab',{left:(m0+4)+'px',top:(cy+13)+'px'});mc.textContent='mentored →';g.els.push(mc);
        g.els.push(el('term',{left:(xn-4)+'px',top:(cy-4)+'px'}));
        return;
      }
      if(sid==='vz'){
        const cd=parse('2026-04-01').t;
        const px=[LBL,S.arc?X(S.arc.t1):x0,S.ucd?X(S.ucd.t0):x0,S.ucd?X(S.ucd.t1):x0,S['ucd-ms']?X(S['ucd-ms'].t0):x0,X(cd),X(NOW)];
        const th=[6,12,6,12,6,12];
        for(let k=0;k<6;k++){const L=px[k],Rt=px[k+1];if(Rt-L<2)continue;
          const sv=el('seg work',{left:L+'px',width:(Rt-L+(k<5?1.5:0))+'px',top:(cy-th[k]/2)+'px',height:th[k]+'px'});
          sv.dataset.row=r.id;g.els.push(sv);}
        g.els.push(el('term',{left:(X(NOW)-4)+'px',top:(cy-4)+'px'}));
        return;
      }
      const seg=el('seg '+r.kind+(sub?' sub':''),{left:x0+'px',width:Math.max(5,x1-x0)+'px',top:(cy-(sub?-4:(r.kind==='proj'?8:r.kind==='teach'?4:r.kind==='vol'?2:7)))+'px'});
      seg.dataset.row=r.id;g.els.push(seg);
      if(sid==='cinr-work'){
        g.els.push(el('wash',{left:x0+'px',width:Math.max(3,x1-x0)+'px',top:(cy-11)+'px'}));
        const cl=el('grtlab',{left:(x0+5)+'px',top:(cy+14)+'px'});cl.textContent='cINR →';g.els.push(cl);
      }
      if(r.id==='r-teach'){
        const TOPIC={'tutor-arc':'C++ tutor','ta-algo':'Algorithms','ta-cv':'Computer Vision','ta-arch':'Architecture'};
        const tc=el('duallab',{left:x0+'px',top:(cy+11)+'px'});tc.textContent=TOPIC[sid]||'';g.els.push(tc);
        const nx0=r.spans[r.spans.indexOf(sid)+1]&&S[r.spans[r.spans.indexOf(sid)+1]];
        if(nx0){const w=tc.getBoundingClientRect().width;
          if(x0+w>X(nx0.t0)-6)tc.style.left=Math.min(x0,x1-w)+'px';}
        const nx=r.spans[r.spans.indexOf(sid)+1]&&S[r.spans[r.spans.indexOf(sid)+1]];
        if(nx&&X(nx.t0)>x1+2)g.els.push(el('bridge teach',{left:x1+'px',width:(X(nx.t0)-x1)+'px',top:(cy-1)+'px'}));
      }
      if(s.unk)g.els.push(el('lead',{left:(x0-22)+'px',width:'22px',top:(cy-1)+'px'}));
      if(s.ongo)g.els.push(el('term',{left:(X(NOW)-4)+'px',top:(cy-4)+'px'}));
      if(sub){const fl=el('flclab',{left:(x0-26)+'px',top:(cy+6)+'px'});fl.textContent='FLC';g.els.push(fl)}
    });
    /* GRTCache: washed stretch over the engagement; full-weight bar until the
       HPG 2026 rejection (8 May 2026), thin after — improvements at lower pace */
    if(r.id==='r-res'&&S.grtcache){
      const g0=X(S.grtcache.t0),rj=S.grtcache.raw.rejected?X(parse(S.grtcache.raw.rejected).t):g0;
      if(S['cinr-work'])g.els.push(el('bridge',{left:X(S['cinr-work'].t1)+'px',width:Math.max(2,g0-X(S['cinr-work'].t1))+'px',top:(cy-1)+'px'}));
      g.els.push(el('wash',{left:g0+'px',width:Math.max(3,X(NOW)-g0)+'px',top:(cy-11)+'px'}));
      const sf=el('seg res',{left:g0+'px',width:Math.max(5,rj-g0)+'px',top:(cy-7)+'px'});sf.dataset.row=r.id;g.els.push(sf);
      g.els.push(el('tail',{left:rj+'px',width:Math.max(3,X(NOW)-rj)+'px',top:(cy-1)+'px'}));
      const gl=el('grtlab',{left:(g0+5)+'px',top:(cy+14)+'px'});gl.textContent='GRTCache →';g.els.push(gl);
      g.els.push(el('term',{left:(X(NOW)-4)+'px',top:(cy-4)+'px'}));
    }
    const rms=marks.filter(m=>m.row===r.id).sort((a,b)=>a.t-b.t);
    const below=r.labelSide==='below';
    for(let i=0;i<rms.length;i++){
      const m=rms[i],tier=TIER[m.raw.id]?1:0,pair=(r.id!=='r-res'&&!tier&&!MTICK[m.raw.id]&&i+1<rms.length&&X(rms[i+1].t)-X(m.t)<120&&!TIER[rms[i+1].raw.id]&&!MTICK[rms[i+1].raw.id])?rms[i+1]:null;
      const big=m.raw.kind==='paper';
      const mt=MTICK[m.raw.id];
      g.els.push(el('stopk',{left:X(m.t)+'px',top:(cy+(mt?mt.top:-(big?16:13)-(tier?14:0)))+'px',width:big?'3px':'',height:(mt?mt.h:(big?32:26)+(tier?14:0))+'px'}));
      const two=TWOLINE[m.raw.id];
      let txt=two?two.t:m.lab,tA=m.t;
      if(pair){g.els.push(el('stopk',{left:X(pair.t)+'px',top:(cy-13)+'px'}));txt=[txt,(SHORT[pair.raw.id]!==undefined?SHORT[pair.raw.id]:pair.lab)].filter(Boolean).join(' → ');
        /* a merged label anchors on the tick it names — an unlabeled first
           tick must not pull the text leftward */
        if(!(two?two.t:m.lab))tA=pair.t;i++}
      if(!txt)continue;
      const ms=MSIDE[m.raw.id];
      const sl=el('stoplab'+(two?' two':''),{left:'0px',top:(ms==='up'?cy-27:below?cy+17:tier?cy-42:(two?cy-38:cy-27))+'px'});
      if(two)sl.innerHTML=txt+'<b>'+two.b+'</b>';else sl.textContent=txt;
      /* position from the label's REAL width: inside the right margin, and
         never through the now line */
      const rw=sl.getBoundingClientRect().width;
      let lx=X(tA)-3;

      lx=Math.min(lx,W+20-rw);
      sl.style.left=lx+'px';
      g.els.push(sl);
    }
    g.els.forEach(e2=>{g.baseTops[g.els.indexOf(e2)]=parseFloat(e2.style.top)||0});
    rows.push(g);
  }
  LEARN.forEach((r,i)=>buildRow(r,i,'L'));
  DOING.forEach((r,i)=>buildRow(r,i,'D'));

  /* vertical joints — the HS↔ARC device generalized: dotted ties at a
     stretch's two ends, binding it to the row it belongs to. Hidden, like all
     joints, while a row is expanded. */
  const cyOf=id=>{const g3=rows.find(r3=>r3.cfg.id===id);return g3?g3.cy:null};
  const cyU=cyOf('r-ucd'),cyR=cyOf('r-res'),cyT=cyOf('r-teach'),cyA=cyOf('r-arc');
  ['ta-algo','ta-cv','ta-arch'].forEach(id2=>{const t=S[id2];if(!t||cyU==null||cyT==null)return;
    [t.t0,t.t1].forEach((tt,k)=>joints.push({el:el('conn',{left:(X(tt)-(k?2:0))+'px',top:(cyU+13)+'px',height:((cyT-4)-(cyU+13))+'px'}),a:'r-ucd',b:'r-teach',t:cyU+13,h:(cyT-4)-(cyU+13)}));
  });
  if(S['tutor-arc']&&cyA!=null&&cyT!=null)[S['tutor-arc'].t0,S['tutor-arc'].t1].forEach((t,k)=>{
    joints.push({el:el('conn',{left:(X(t)-(k?2:0))+'px',top:(cyA+7)+'px',height:((cyT-4)-(cyA+7))+'px'}),a:'r-arc',b:'r-teach',t:cyA+7,h:(cyT-4)-(cyA+7)});
  });

  const strip=el('xstrip',{left:LBL+'px',width:(X(T1)-LBL-16)+'px'});
  let open=null;
  function detail(r){
    const fD=s=>s.length===10?String(+s.slice(8,10)).padStart(2,' ')+' '+MONTHS[+s.slice(5,7)-1]+' '+s.slice(0,4):s.length===7?'   '+MONTHS[+s.slice(5,7)-1]+' '+s.slice(0,4):'       '+s;
    const sc=STRIP[r.cfg.id]||{t:r.cfg.label,d:'',c:''};
    const mk=marks.filter(m=>m.row===r.cfg.id);
    const ev=(sc.ev?sc.ev.map(x=>'<span>'+x+'</span>'):mk.map(m=>mk.length===1?'<span>'+fD(m.raw.date).trim()+' — '+(SHORT[m.raw.id]||m.raw.label)+'</span>':'<span><u>'+fD(m.raw.date)+'</u>— '+(SHORT[m.raw.id]||m.raw.label)+'</span>')).join('');
    return'<div class="xs"><b>'+sc.t+'</b><i>'+sc.d+'</i><em>'+sc.c+'</em></div>'+(ev?'<div class="xev'+(sc.evGrid?' g':'')+'">'+ev+'</div>':'');
  }
  function layout(){
    rows.forEach(g=>{
      let dy=0;
      if(open&&g.band===open.band&&g.idx>open.idx)dy=open.band==='L'?-EXPL:EXPD;
      g.els.forEach((e2,i)=>{e2.style.top=(g.baseTops[i]+dy)+'px'});
      g.els.forEach(e2=>{
        /* row labels stay legible while another row is expanded */
        e2.classList.toggle('dim',!!open&&g!==open&&!/(^|\s)rowlab(\s|$)/.test(e2.className));
        /* only captions the strip would actually cover yield to it: event labels
           on the strip's side. Annotation captions (dual-enrolled, CS club,
           treasurer, supporting tail) stay visible. */
      });
    });
    host.classList.toggle('open',!!open);
    const dyOf=id=>{if(!open)return 0;const gg=rows.find(r2=>r2.cfg.id===id);if(!gg)return 0;return(gg.band===open.band&&gg.idx>open.idx)?(open.band==='L'?-EXPL:EXPD):0};
    joints.forEach(j=>{const da=dyOf(j.a),db=dyOf(j.b);j.el.style.top=(j.t+da)+'px';j.el.style.height=(j.h+db-da)+'px';j.el.classList.toggle('dim',!!open)});
    const last=!!open&&open.band==='D'&&open.idx===DOING.length-1;
    const tf=document.getElementById('about-tl-foot');if(tf)tf.classList.toggle('gone',last);
    if(open){
      strip.style.top=(open.band==='L'?(open.cy-4-EXPL):(open.cy+29))+'px';
      strip.classList.add('on');strip.innerHTML=detail(open);
    } else {strip.classList.remove('on');strip.innerHTML=''}
    setTimeout(audit,320);
  }
  function audit(){
    const vis=e=>!e.classList.contains('gone')&&e.offsetWidth>0;
    const lab=[...host.querySelectorAll('.stoplab,.duallab,.grtlab,.taillab,.flclab')].filter(vis);
    const lines=[...host.querySelectorAll('.stopk,.conn')].filter(e=>vis(e)&&!e.classList.contains('dim'));
    const B=e=>e.getBoundingClientRect();
    const hit=(a,b)=>a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1;
    let ll=0,lt=0,clip=0;
    for(let i=0;i<lab.length;i++)for(let j=i+1;j<lab.length;j++)if(hit(B(lab[i]),B(lab[j])))ll++;
    for(const L of lab){if(L.classList.contains('grtlab')||L.classList.contains('stoplab'))continue;const r=B(L);for(const k of lines)if(hit(r,B(k)))lt++}
    document.querySelectorAll('.xstrip .xev span,.xstrip .xs em,.xstrip .xs i,.xstrip .xs b').forEach(e=>{if(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+2)clip++});
    let so=0;const st=host.querySelector('.xstrip');
    if(st&&st.classList.contains('on')){const sr=st.getBoundingClientRect();for(const L of lab)if(hit(B(L),sr))so++}
    const out=document.querySelector('[data-audit]');
    if(out)out.textContent='audit — label overlaps '+ll+' · lines through text '+lt+' · clipped card lines '+clip+' · card overlaps '+so;
  }
  host.onclick=e=>{
    const t=e.target.closest('[data-row]');
    if(!t){open=null;layout();return}
    const g=rows.find(g2=>g2.cfg.id===t.dataset.row);
    open=(open===g)?null:g;layout();
  };
  host.onkeydown=e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.row)e.target.click()};

  setTimeout(audit,600);
}

/* Mobile: the record turned on its side — time flows down, learning left of
   the axis, doing right. Same tone and thickness logic as the desktop record;
   names and detail live in the tappable list below the figure. */
function drawV(host,S,marks){
  host.innerHTML='';host.classList.add('vert');
  const W2=host.clientWidth,T0=2017.05,T1=NOW+.25,H=Math.round((T1-T0)*64)+78;
  host.style.height=H+'px';
  const Y=t=>26+(Math.max(T0,t)-T0)/(T1-T0)*(H-78);
  const CX=Math.round(W2*0.44);
  const el=(c,css)=>{const d=document.createElement('div');d.className=c;if(css)Object.assign(d.style,css);host.appendChild(d);return d};
  /* band heads flank the axis, arrows pointing into their own halves */
  const b1=el('bband',{top:'0px'});b1.textContent='← learning';b1.style.right=(W2-CX+10)+'px';
  const b2=el('bband',{left:(CX+10)+'px',top:'0px'});b2.textContent='doing →';
  el('vax',{left:CX+'px',top:Y(T0)+'px',height:(Y(NOW)-Y(T0))+'px'});
  for(let y=2018;y<=Math.floor(NOW);y++){const t=el('vyt',{left:CX+'px',top:Y(y)+'px'});t.textContent=y}
  /* lanes spread across the full width, each on its own hairline track,
     named at the foot — a reader with no desktop context can read columns */
  const L0=CX-44,lst=Math.max(30,(L0-8)/2),xU=L0,xA=L0-lst,xH=L0-2*lst;
  const R0=CX+38,rst=Math.max(26,(W2-30-R0)/4),xR=R0,xT=R0+rst,xV=R0+2*rst,xSd=R0+3*rst,xP=R0+4*rst;
  const lanes=[[xU,'UC Davis'],[xA,'ARC'],[xH,'High school'],[xR,'Research'],[xT,'Teaching'],[xV,'VZ Plumbing'],[xSd,'GFC'],[xP,'Products']];
  const lvls=[[],[],[]];
  lanes.forEach(ln=>{
    el('vlane',{left:ln[0]+'px',top:Y(T0)+'px',height:(Y(NOW)-Y(T0))+'px'});
    const lb=el('vlanelab',{top:'0px'});lb.textContent=ln[1];
    const w=lb.offsetWidth;
    const x=Math.max(w/2+2,Math.min(ln[0],W2-2-w/2)),a2=x-w/2-4,b2=x+w/2+4;
    let L=lvls.findIndex(v=>v.every(s=>b2<s[0]||a2>s[1]));
    if(L<0)L=2;
    lvls[L].push([a2,b2]);
    lb.style.left=x+'px';lb.style.top=(Y(NOW)+11+L*13)+'px';
    /* the name hangs from its own lane, not in space */
    el('vlane',{left:ln[0]+'px',top:(Y(NOW)+2)+'px',height:(8+L*13)+'px'});
  });
  el('vnow',{left:'4px',width:(W2-8)+'px',top:Y(NOW)+'px'});
  const nc=el('vyt',{left:CX+'px',top:Y(NOW)+'px'});nc.textContent='now';
  const bar=(x,t0,t1,w,col)=>el('vseg',{left:(x-w/2)+'px',top:Y(t0)+'px',width:w+'px',height:Math.max(3,Y(t1)-Y(t0))+'px',background:'var(--'+col+')'});
  const ring=x=>el('vterm',{left:(x-4)+'px',top:(Y(NOW)-4)+'px'});
  /* the desktop's captioned washes, vertical: caption runs down the lane's
     outer side, clear of the event-label corridor by the axis */
  const wash=(x,t0,t1,cap,left)=>{
    el('vwash',{left:(x-10)+'px',width:'20px',top:Y(t0)+'px',height:Math.max(4,Y(t1)-Y(t0))+'px'});
    if(cap){const c2=el('vwcap',{left:(left?x-24:x+12)+'px',top:(Y(t0)+3)+'px'});c2.textContent=cap;c2.dataset.vw=1}
  };
  if(S.vidi){wash(xU,S.vidi.t0,NOW,'VIDI Lab',false);ring(xU)}
  if(S.arc&&S.arc.raw.club)wash(xA,parse(S.arc.raw.club.start).t,S.arc.t1,'CS club',false);
  if(S['cinr-work'])wash(xR,S['cinr-work'].t0,S['cinr-work'].t1,'cINR',false);
  if(S.grtcache)wash(xR,S.grtcache.t0,NOW,'GRTCache',true);
  if(S.sound)wash(xSd,parse('2021-07').t,NOW,'mentored',false);
  if(S.ucd){bar(xU,S.ucd.t0,S.ucd.t1,10,'ink');
    if(S['ucd-ms']){bar(xU,S.ucd.t1,S['ucd-ms'].t0,2,'ink');bar(xU,S['ucd-ms'].t0,S['ucd-ms'].t1,10,'ink')}}
  if(S.arc){const hs1=S.hs?S.hs.t1:S.arc.t0;bar(xA,S.arc.t0,hs1,5,'ink');bar(xA,hs1,S.arc.t1,10,'ink')}
  if(S.hs)bar(xH,T0,S.hs.t1,10,'ink');
  if(S['cinr-work'])bar(xR,S['cinr-work'].t0,S['cinr-work'].t1,10,'ink');
  if(S.grtcache){const rj=S.grtcache.raw.rejected?parse(S.grtcache.raw.rejected).t:NOW;
    if(S['cinr-work'])bar(xR,S['cinr-work'].t1,S.grtcache.t0,2,'ink');
    bar(xR,S.grtcache.t0,rj,10,'ink');bar(xR,rj,NOW,3,'ink');ring(xR)}
  {const ts=['tutor-arc','ta-algo','ta-cv','ta-arch'].map(id2=>S[id2]).filter(Boolean);
   ts.forEach((t,i)=>{bar(xT,t.t0,t.t1,6,'prose');if(ts[i+1])bar(xT,t.t1,ts[i+1].t0,2,'prose')});}
  if(S.vz){const cd=parse('2026-04-01').t;
    const ps=[T0,S.arc?S.arc.t1:T0,S.ucd?S.ucd.t0:T0,S.ucd?S.ucd.t1:T0,S['ucd-ms']?S['ucd-ms'].t0:T0,cd,NOW],ws=[4,8,4,8,4,8];
    for(let k=0;k<6;k++)if(ps[k+1]>ps[k])bar(xV,ps[k],ps[k+1],ws[k],'prose');
    ring(xV)}
  if(S.sound){const ps=[S.sound.t0,parse('2021-07').t,parse('2025-07').t,NOW],ws=[3,5,8];
    for(let k=0;k<3;k++)bar(xSd,ps[k],ps[k+1],ws[k],'prose');ring(xSd)}
  if(S.meliora){bar(xP,S.meliora.t0,NOW,8,'ink');ring(xP)}
  if(S.okibi){bar(xP+9,S.okibi.t0,NOW,5,'ink');ring(xP+9)}
  /* events: labels gather by the axis, a dotted leader running out to the
     tick on the lane they belong to */
  const LANE={'r-ucd':xU,'r-arc':xA,'r-hs':xH,'r-res':xR,'r-prod':xP};
  const VSHORT={'cc-degrees':'6 AS degrees'};
  const VDROP={'ms-candidacy':1,'cinr-published':1,'mel-beta':1,'okb-public':1};
  const VDIR={'hs-grad':'R','cc-degrees':'R','bs':'L','ms-awarded':'L','cinr-accepted':'R','grt-rejected':'R'};
  const VFAR={'hs-grad':1}; /* rides near the axis, tied back by its leader */
  const VGAP={'cc-degrees':17};
  const VNUDGE={'hs-grad':-1,'cc-degrees':1,'ms-awarded':1,'cinr-accepted':1,'grt-rejected':-1};
  const VDX={'cinr-accepted':5,'grt-rejected':5};
  const placedChips=[];
  marks.forEach(m=>{const x=LANE[m.row];if(x==null||VDROP[m.raw.id])return;
    const txt=VSHORT[m.raw.id]||m.lab;if(!txt)return;
    el('vtick',{left:(x-9)+'px',width:'18px',top:Y(m.t)+'px'});
    const lb=el('vlab',{top:'0px'});lb.textContent=txt;
    const w=lb.offsetWidth;
    const dirR=(VDIR[m.raw.id]||(x<CX?'L':'R'))==='R';
    const gp=VGAP[m.raw.id]||(m.row==='r-res'?34:26);
    let lx=dirR?x+gp:x-gp-w;
    if(VFAR[m.raw.id])lx=dirR?CX-10-w:CX+10;
    if(dirR&&x<CX)lx=Math.min(lx,CX-2-w); /* up to the axis line, never past */
    if(!dirR&&x>CX)lx=Math.max(lx,CX+2);
    lx=Math.max(2,Math.min(lx,W2-2-w))+(VDX[m.raw.id]||0);
    /* chip CENTER sits on the tick's center, measured, not assumed */
    const h2=lb.offsetHeight,tc=Y(m.t)+1;
    let y=Math.min(tc-h2/2,Y(NOW)-h2-1)+(VNUDGE[m.raw.id]||0);
    for(let g=0;g<8;g++){const clash=placedChips.some(q=>lx<q.r+4&&q.l<lx+w+4&&y<q.b+2&&q.t<y+h2+2);if(!clash)break;y-=h2+2}
    lb.style.left=lx+'px';lb.style.top=y+'px';
    /* the lead runs at the chip's center and meets the tick's center; a
       vertical jog closes any gap a nudge opened */
    const cy2=y+h2/2;
    const hx=Math.round(cy2)-1;
    if(dirR&&lx-2-(x+9)>3)el('vlead',{left:(x+9)+'px',width:(lx-2-(x+9))+'px',top:hx+'px'});
    if(!dirR&&(x-9)-(lx+w+2)>3)el('vlead',{left:(lx+w+2)+'px',width:((x-9)-(lx+w+2))+'px',top:hx+'px'});
    if(Math.abs(cy2-tc)>2)el('vleadv',{left:(dirR?x+9:x-10)+'px',top:(Math.min(cy2,tc)-1)+'px',height:Math.abs(cy2-tc)+'px'});
    placedChips.push({l:lx,r:lx+w,t:y,b:y+h2});
  });
  /* measured last pass: a wash caption that intersects any chip (or another
     caption) slides down its wash until clear — captions yield to events */
  const chipRects=[...host.querySelectorAll('.vlab')].map(e2=>e2.getBoundingClientRect());
  const placedCaps=[];
  [...host.querySelectorAll('.vwcap')].forEach(cp=>{
    const hitAny=()=>{const r=cp.getBoundingClientRect();
      return chipRects.concat(placedCaps).some(q=>r.left<q.right+2&&q.left<r.right+2&&r.top<q.bottom+2&&q.top<r.bottom+2)};
    const start=parseFloat(cp.style.top),maxT=Y(NOW)-cp.offsetHeight-6;
    let ok=false;
    for(let t=start;t<=maxT;t+=10){cp.style.top=t+'px';if(!hitAny()){ok=true;break}}
    if(!ok)for(let t=start-10;t>=26;t-=10){cp.style.top=t+'px';if(!hitAny()){ok=true;break}}
    if(!ok)cp.style.top=Math.min(start,maxT)+'px';
    placedCaps.push(cp.getBoundingClientRect());
  });
  /* a lead whose height falls inside a caption starts at the caption's far
     edge instead of the lane — no line runs through or behind the text */
  const hostR=host.getBoundingClientRect();
  const capRs=[...host.querySelectorAll('.vwcap')].map(e2=>e2.getBoundingClientRect());
  [...host.querySelectorAll('.vlead')].forEach(ld=>{
    const r=ld.getBoundingClientRect();
    capRs.forEach(q=>{
      if(r.top<q.bottom&&q.top<r.bottom&&r.left<q.right&&q.left<r.right){
        const nl=q.right-hostR.left+2,ow=parseFloat(ld.style.width),ol=parseFloat(ld.style.left);
        const nw=ol+ow-nl,stubW=(q.left-hostR.left-2)-ol;
        if(stubW>2){const st=ld.cloneNode();st.style.left=ol+'px';st.style.width=stubW+'px';host.appendChild(st)}
        if(nw>3){ld.style.left=nl+'px';ld.style.width=nw+'px'}else ld.remove();
      }
    });
  });
  /* names + detail: the tappable list is the mobile card */
  let list=document.getElementById('about-vlist');
  if(!list){list=document.createElement('div');list.id='about-vlist';
    const ft=document.getElementById('about-tl-foot');
    if(ft&&ft.parentNode===host.parentNode)host.parentNode.insertBefore(list,ft.nextSibling);
    else host.parentNode.insertBefore(list,host.nextSibling)}
  list.innerHTML='';
  const fD=s=>s.length===10?String(+s.slice(8,10)).padStart(2,' ')+' '+MONTHS[+s.slice(5,7)-1]+' '+s.slice(0,4):s.length===7?'   '+MONTHS[+s.slice(5,7)-1]+' '+s.slice(0,4):'       '+s;
  LEARN.concat(DOING).forEach(r=>{
    const sc=STRIP[r.id]||{t:r.label,d:'',c:''};
    const it=document.createElement('button');it.className='vit';
    it.innerHTML='<b>'+r.label+'</b><i>'+r.sub+'</i><span>+</span>';
    const bd=document.createElement('div');bd.className='vbd';
    const mk=marks.filter(m=>m.row===r.id);
    const ev=(sc.ev?sc.ev.map(x=>'<span>'+x+'</span>'):mk.map(m=>'<span><u>'+fD(m.raw.date)+'</u>— '+(SHORT[m.raw.id]||m.raw.label)+'</span>')).join('');
    bd.innerHTML='<i>'+sc.d+'</i><em>'+sc.c+'</em>'+(ev?'<div class="ev">'+ev+'</div>':'');
    it.onclick=()=>{const on=!bd.classList.contains('on');bd.classList.toggle('on',on);it.querySelector('span').textContent=on?'–':'+'};
    list.appendChild(it);list.appendChild(bd);
  });
}
/* D0 record: the two-lane vertical figure (mock E, merged thickness).
   Learning | date spine | Doing; thickness = concurrent commitments;
   headline marks and teaching brackets read from the record. */
function drawVRec(S,rec){
  const host=document.getElementById('about-vrec');if(!host)return;
  let cv=host.firstElementChild;
  if(!cv||cv.tagName!=='CANVAS'){host.innerHTML='';cv=document.createElement('canvas');host.appendChild(cv)}
  const r=host.getBoundingClientRect();if(r.width<40||r.height<60)return;
  const dpr=Math.min(devicePixelRatio||1,2);
  cv.width=r.width*dpr;cv.height=r.height*dpr;
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
  const W=r.width,H=r.height;
  const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim();
  const inkC=v('--ink'),absC=v('--absence'),hairC=v('--hair'),knock=v('--band1'),mono=v('--mono');
  const T0=2017.0,T1=NOW+.12;
  const LEARNIDS=['hs','arc','ucd','ucd-ms'];
  const SET=['ucd','ucd-ms','arc','hs','cinr-work','tutor-arc','ta-algo','ta-cv','ta-arch','vz','sound','meliora','okibi','grtcache'];
  const sp=SET.map(id=>S[id]).filter(Boolean).map(s=>({id:s.raw.id,t0:s.t0,t1:s.t1}));
  const laneSS=k=>sp.filter(s=>(k==='learn')===(LEARNIDS.indexOf(s.id)>=0)).sort((a,b)=>a.t0-b.t0);
  const padT=18,padB=12,Y=t=>padT+(t-T0)/(T1-T0)*(H-padT-padB);
  /* density ladder: below ~24px/yr the figure sheds its secondary layer
     (teach brackets, mid year labels) instead of letting them collide */
  const pxYr=(H-padT-padB)/(T1-T0),compact=pxYr<24;
  ctx.clearRect(0,0,W,H);
  ctx.font='400 9px '+mono;
  const cx2=Math.round(W/2)+.5,yN=Y(NOW)+.5;
  ctx.strokeStyle=hairC;ctx.beginPath();ctx.moveTo(cx2,Y(2017));ctx.lineTo(cx2,yN);ctx.stroke();
  ctx.textAlign='center';
  for(let yr=2017;yr<=2026;yr++){const y=Y(yr)+.5;
    ctx.strokeStyle=hairC;ctx.beginPath();ctx.moveTo(cx2-3,y);ctx.lineTo(cx2+3,y);ctx.stroke();
    if(compact?yr===2017:(yr-2017)%3===0){ctx.fillStyle=knock;ctx.fillRect(cx2-12,y-5,24,11);
      ctx.fillStyle=absC;ctx.fillText(''+yr,cx2,y+3)}}
  ctx.fillStyle=knock;ctx.fillRect(cx2-12,yN-5,24,11);
  ctx.fillStyle=absC;ctx.fillText('now',cx2,Math.min(yN+3,H-2));
  ctx.textAlign='left';
  const lanes=[{lab:'Learning',x:26,dir:1,ss:laneSS('learn')},{lab:'Doing',x:W-26,dir:-1,ss:laneSS('doing')}];
  const sw=6,step=6;
  const cnt=(ss,t)=>{let n=0;for(const s of ss)if(s.t0<=t&&t<=s.t1)n++;return n};
  const nAt=(ss,t)=>Math.max(cnt(ss,t),cnt(ss,t-1/12));
  const edgeOf=(ln,t)=>ln.dir>0?ln.x+Math.max(1,nAt(ln.ss,t))*step:ln.x-Math.max(1,nAt(ln.ss,t))*step;
  for(const ln of lanes){
    ctx.fillStyle=absC;
    const lw=ctx.measureText(ln.lab).width;
    ctx.fillText(ln.lab,ln.dir>0?ln.x:ln.x-lw,11);
    for(let t=T0;t<NOW;t+=1/12){
      const y0=Y(t),y1=Y(Math.min(t+1/12,NOW));
      const n=cnt(ln.ss,t+1/24);if(!n)continue;
      const w=n*sw;
      ctx.fillStyle=inkC;
      ctx.fillRect(ln.dir>0?ln.x:ln.x-w,y0,w,Math.max(1.6,y1-y0+.4));
    }
    if(ln.ss.some(s=>s.t1>=NOW-.02)){
      ctx.strokeStyle=inkC;ctx.lineWidth=1;
      ctx.strokeRect(ln.dir>0?ln.x-.5:ln.x-sw+.5,yN+1,sw,4)}
  }
  const MLAB={'hs-grad':'HS','cc-degrees':'6 AS','bs':'BS','ms-awarded':'MS','cinr-accepted':'cINR accepted'};
  const MK=(rec.marks||[]).filter(m=>MLAB[m.id]).map(m=>({id:m.id,t:parse(m.date).t,lab:MLAB[m.id],doing:m.id==='cinr-accepted'}));
  /* greedy collision pass, most recent achievements first: a label needs
     12px of air on its side or it is dropped, not squeezed */
  const prio={'ms-awarded':0,'cinr-accepted':1,'bs':2,'cc-degrees':3,'hs-grad':4};
  const keptY={L:[],D:[]};
  for(const m of MK.slice().sort((a,b)=>prio[a.id]-prio[b.id])){
    const side=m.doing?'D':'L',y=Y(m.t);
    if(keptY[side].some(yy=>Math.abs(yy-y)<12))continue;
    keptY[side].push(y);m.keep=true;
  }
  /* degree marks meet the drawn END of their span's bar: recompute the
     last month-cell exactly as the fill loop draws it, so the line lands
     on the bar's final pixel at every scale */
  const SNAP={'hs-grad':'hs','cc-degrees':'arc','bs':'ucd','ms-awarded':'ucd-ms'};
  const endY=id=>{const s=sp.find(x=>x.id===id);if(!s)return null;
    const k=Math.floor((Math.min(s.t1,NOW)-T0)*12-.5);
    const y0c=Y(T0+k/12),y1c=Y(Math.min(T0+(k+1)/12,NOW));
    return y0c+Math.max(1.6,y1c-y0c+.4)};
  for(const m of MK){
    if(!m.keep)continue;
    const snap=SNAP[m.id]?endY(SNAP[m.id]):null;
    const y=snap!==null?Math.round(snap)-.5:Math.round(Y(m.t))+.5,ln=m.doing?lanes[1]:lanes[0];
    const x0=edgeOf(ln,m.t),x1=m.doing?W-54:54;
    ctx.strokeStyle=inkC;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
    ctx.fillStyle=inkC;ctx.beginPath();ctx.arc(x1,y,1.8,0,7);ctx.fill();
    ctx.fillStyle=absC;
    if(m.doing){const lw=ctx.measureText(m.lab).width;ctx.fillText(m.lab,x1-5-lw,y+3)}
    else ctx.fillText(m.lab,x1+5,y+3);
  }
  const TEACH=['tutor-arc','ta-algo','ta-cv','ta-arch'];
  if(!compact)for(const id of TEACH){
    const s=S[id];if(!s)continue;
    const y0=Math.round(Y(s.t0))+.5,y1=Math.round(Y(Math.min(s.t1,NOW)))+.5;
    let mn=1;for(let t=s.t0;t<=s.t1;t+=1/12)mn=Math.max(mn,nAt(lanes[1].ss,t));
    const bx=Math.round(W-26-mn*step-5)+.5;
    ctx.strokeStyle=absC;ctx.beginPath();
    ctx.moveTo(bx+3,y0);ctx.lineTo(bx,y0);ctx.lineTo(bx,y1);ctx.lineTo(bx+3,y1);ctx.stroke();
    const lab=id==='tutor-arc'?'Tutor':'TA',lw=ctx.measureText(lab).width;
    ctx.fillStyle=absC;ctx.fillText(lab,bx-5-lw,(y0+y1)/2+3);
  }
}
/* live GitHub contributions — real data or an honest note, never decoration */
(function gh(){
  const grids=[...document.querySelectorAll('.ghgrid')];if(!grids.length)return;
  fetch('https://github-contributions-api.jogruber.de/v4/Deralik?y=last')
  .then(r=>r.ok?r.json():Promise.reject(r.status))
  .then(j=>{
    const fill=g3=>{
      /* the mock's proportions: D1 carries the full year, cells sized to the
         column; the D0 grid keeps its fixed 26-week size */
      const sm=g3.classList.contains('sm');
      const wk=sm?26:52;
      if(!sm){const w=g3.clientWidth||330,cell=Math.max(3.5,(w-(wk-1)*1.5)/wk);
        g3.style.gridTemplateRows='repeat(7,'+cell.toFixed(2)+'px)';g3.style.gridAutoColumns=cell.toFixed(2)+'px'}
      g3.innerHTML='';
      const days=j.contributions.slice(-wk*7);
      const pad=new Date(days[0].date+'T00:00:00').getDay();
      for(let k=0;k<pad;k++){const c=document.createElement('i');c.style.opacity=0;g3.appendChild(c)}
      days.forEach(dd=>{const c=document.createElement('i');c.style.opacity=dd.level?(0.15+dd.level*0.21):0.07;c.title=dd.date+' — '+dd.count;g3.appendChild(c)});
      if(!sm){const we=document.querySelector('.gh .ghw');if(we)we.textContent=wk+' weeks · live'}
    };
    grids.forEach(fill);
    if(window.ResizeObserver)grids.forEach(g3=>{let q,lw=g3.clientWidth;const ro=new ResizeObserver(()=>{if(Math.abs(g3.clientWidth-lw)<2)return;lw=g3.clientWidth;clearTimeout(q);q=setTimeout(()=>fill(g3),150)});ro.observe(g3)});
  })
  .catch(()=>{grids.forEach(g3=>{g3.outerHTML='<span class="ghnote">live GitHub activity — unreachable in this preview; wires to the contributions feed on the real site</span>'})});
})();
})();
