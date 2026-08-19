/* Round 9 (owner 2026-08-18b): two figures, side by side.
   GRT9A — the overall pipeline, abstract in the cINR hand: washes, boxes,
   numbered arrows, NO pictures per section.
   GRT9T — the training step, traced back: one path diagram after NRC's
   training figure (Müller et al. 2021), whose scheme ours follows almost
   one-to-one; termination heuristic identical. Static, paper ground. */
(()=>{const{tok}=GRT;
function mkHelpers(ctx,mono){
const ink=tok('--ink'),prose=tok('--prose'),abs=tok('--absence'),mat=tok('--mat'),paper=tok('--paper');
const T=(x,y,s,col,align)=>{ctx.fillStyle=col||prose;ctx.textAlign=align||'center';ctx.fillText(s,x,y);ctx.textAlign='left'};
const box=(x,y,w,h,title)=>{ctx.strokeStyle=ink;ctx.lineWidth=1.2;ctx.strokeRect(x,y,w,h);ctx.lineWidth=1;if(title)T(x+w/2,y+h/2+3.5,title,ink)};
const seg=(x0,y0,x1,y1,dash)=>{ctx.strokeStyle=abs;if(dash)ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.setLineDash([])};
const arr=(x0,y0,x1,y1,dash)=>{seg(x0,y0,x1,y1,dash);const a2=Math.atan2(y1-y0,x1-x0);ctx.fillStyle=abs;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-6*Math.cos(a2-.42),y1-6*Math.sin(a2-.42));ctx.lineTo(x1-6*Math.cos(a2+.42),y1-6*Math.sin(a2+.42));ctx.fill()};
const circ=(x,y,n)=>{ctx.font='500 9.5px '+mono;const w2=ctx.measureText(n).width;ctx.fillStyle=paper;ctx.fillRect(x-w2/2-5,y-8,w2+10,16);ctx.fillStyle=mat;ctx.globalAlpha=.7;ctx.fillRect(x-w2/2-5,y-8,w2+10,16);ctx.globalAlpha=1;T(x,y+3,n,prose);ctx.font='400 9.5px '+mono};
return{T,box,seg,arr,circ,ink,prose,abs,mat,paper}}
function setup(cv,AW,drawBody){const ctx=cv.getContext('2d'),mono=tok('--mono');
function draw(){const rc=cv.getBoundingClientRect();if(!rc.width)return;const dpr=Math.min(2,devicePixelRatio||1);
cv.width=rc.width*dpr;cv.height=rc.height*dpr;
const fig=Math.min(1,rc.width/AW);ctx.setTransform(dpr*fig,0,0,dpr*fig,0,0);
const H=rc.height/fig,hp=mkHelpers(ctx,mono);
ctx.fillStyle=tok('--paper');ctx.fillRect(0,0,Math.max(rc.width/fig,AW),H);ctx.font='400 9.5px '+mono;
drawBody(ctx,hp,H,mono)}
draw();addEventListener('resize',draw);
if(window.ResizeObserver)new ResizeObserver(draw).observe(cv);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw)}
/* ── the pipeline, abstract ─────────────────────────────────────────── */
window.GRT9A=function(cv){setup(cv,640,(ctx,hp,H,mono)=>{
const{T,box,seg,arr,circ,abs,mat}=hp;
/* washes */
ctx.fillStyle=tok('--band1');ctx.fillRect(16,64,150,150);
ctx.fillStyle=tok('--hair');ctx.globalAlpha=.8;ctx.fillRect(180,64,300,150);ctx.globalAlpha=1;
ctx.fillStyle=mat;ctx.globalAlpha=.45;ctx.fillRect(494,64,130,150);ctx.globalAlpha=1;
ctx.font='500 9.5px '+mono;
T(22,78,'THE LOOP',abs,'left');T(186,78,'TRAINING — EVERY STEP',abs,'left');T(500,78,'WORLD SPACE',abs,'left');
ctx.font='400 9.5px '+mono;
/* PCD pass — once, dashed, into the cache */
box(16,14,204,24,'PCD pass — first-hit positions');
seg(220,26,559,26,true);arr(559,26,559,98,true);circ(388,26,'1');
/* the row */
box(28,118,126,44,'path tracer');
box(192,118,100,44,'samples');
box(318,118,148,44,'optimization + MCMC');
box(506,102,106,60,'the cache');
T(559,176,'world-space',abs);T(559,188,'gaussians',abs);
arr(154,140,188,140);circ(171,124,'2');
arr(292,140,314,140);
arr(466,140,502,140);circ(484,124,'3');
T(242,176,'bounces · NEE',abs);T(242,188,'trace-back',abs);
T(392,176,'fit · relocate',abs);T(392,188,'add · nudge',abs);
/* rays terminate into the cache — return mid-path */
seg(559,162,559,236);seg(559,236,91,236);arr(91,236,91,166);circ(330,236,'4');
T(330,252,'rays terminate into the cache — the bounces they skip are the savings',abs)})};
/* ── the training step, traced back (after NRC) ─────────────────────── */
window.GRT9T=function(cv){setup(cv,640,(ctx,hp,H,mono)=>{
const{T,seg,arr,circ,ink,prose,abs}=hp;
const warm='#E8A24C',acc=tok('--accw');
const cam=[38,150],v=[[150,118],[258,162],[366,114]],sfx=[[470,152],[562,106]];
/* light + NEE */
const lp=[586,38];GRT.star(ctx,lp[0],lp[1],5,warm);
T(lp[0]-4,lp[1]+18,'light',abs);
for(const q of[...v,...sfx]){ctx.strokeStyle=warm;ctx.globalAlpha=.38;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(lp[0],lp[1]);ctx.stroke();ctx.globalAlpha=1}
/* camera + rendering path */
ctx.strokeStyle=ink;ctx.lineWidth=1.2;ctx.strokeRect(cam[0]-4,cam[1]-4,8,8);ctx.lineWidth=1;
T(cam[0],cam[1]+18,'camera',abs);
ctx.strokeStyle=prose;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cam[0]+4,cam[1]);
for(const q of v)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.lineWidth=1;
for(const q of v){ctx.fillStyle=prose;ctx.beginPath();ctx.arc(q[0],q[1],2.2,0,6.283);ctx.fill()}
/* termination into the cache */
ctx.fillStyle=acc;ctx.fillRect(v[2][0]-3,v[2][1]-3,6,6);
T(v[2][0],v[2][1]-14,'terminates into the cache',abs);circ(v[2][0]-108,v[2][1]-14,'1');
/* extended — training suffix, dashed */
ctx.strokeStyle=prose;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(v[2][0],v[2][1]);
for(const q of sfx)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.setLineDash([]);
for(const q of sfx){ctx.strokeStyle=prose;ctx.beginPath();ctx.arc(q[0],q[1],2.2,0,6.283);ctx.stroke()}
T(516,86,'extended — training only',abs);circ(516,100,'2');
/* trace-back: targets composed walking back at every vertex */
const chain=[...v,...sfx];
for(let i=chain.length-1;i>0;i--){const a=chain[i],b=chain[i-1];
const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2+16,an=Math.atan2(b[1]+16-my,b[0]-mx);
ctx.strokeStyle=warm;ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(a[0],a[1]+16);ctx.lineTo(b[0],b[1]+16);ctx.stroke();ctx.globalAlpha=1;
ctx.fillStyle=warm;ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+5*Math.cos(an-.42)*-1,my+5*Math.sin(an-.42)*-1);ctx.lineTo(mx+5*Math.cos(an+.42)*-1,my+5*Math.sin(an+.42)*-1);ctx.fill()}
for(const q of chain){ctx.fillStyle=warm;ctx.fillRect(q[0]-2.4,q[1]+16-2.4,4.8,4.8);
ctx.strokeStyle=warm;ctx.beginPath();ctx.arc(q[0],q[1]+16,4.8,0,6.283);ctx.stroke()}
circ(196,158,'3');
T(320,214,'walking back along the ray, radiance composes into a training target at every vertex',abs);
T(320,228,'NEE at each bounce adds direct-light samples — the direct component only',abs)})};
})();
