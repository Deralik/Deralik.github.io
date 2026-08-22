/* GLSL for the hero's GPU path (js/grt7-gl.js). The truth field is
   evaluated CONTINUOUSLY per sample here — the nebula densities are
   ports of js/grt-nebulae.js (itself a port of the Gaia Sky / Shadertoy
   GLSL, so this is a round trip home), the data volumes sample their
   vendored grids trilinearly, and shading (official TF + glow + AO)
   matches js/grt7-core.js rebuild() term for term. Three fragments:
   A = one 1-spp sample per pixel into TWO progressive accumulations —
       the raw estimator, and the same estimator terminating early into
       the cache (real prefix + cache remainder);
   B = tones the two accumulations at the seam;
   C = 64-step full march of the truth field (the reference inset). */
window.GRTGLSL = (() => {
  const VS = `#version 300 es
void main(){vec2 P[3]=vec2[3](vec2(-1,-1),vec2(3,-1),vec2(-1,3));gl_Position=vec4(P[gl_VertexID],0,1);}`;

  /* camera + ray/box helpers; uOff = viewport origin so passes rendered
     into a sub-rect (the inset) still build correct rays */
  const CAM = `
uniform vec3 uEye,uFwd,uRight,uUp,uHe,uCb0,uCb1;
uniform vec2 uRes,uOff;
uniform float uF;
vec2 boxT(vec3 e,vec3 d){
  vec3 a=(uCb0-e)/d,b=(uCb1-e)/d,lo=min(a,b),hi=max(a,b);
  return vec2(max(max(lo.x,lo.y),max(lo.z,0.)),min(min(hi.x,hi.y),hi.z));
}
vec3 ray(vec2 px){
  float vx=(px.x-uRes.x*.5)/(uRes.y*uF),vy=(px.y-uRes.y*.5)/(uRes.y*uF);
  return normalize(uFwd+vx*uRight+vy*uUp);
}`;

  /* the continuous truth field.
     Density ports (butterfly/ring) follow js/grt-nebulae.js exactly;
     the dust/glow shading follows GaiaVol.tf2/star in js/grt7-core.js;
     the data path samples the vendored scalar grid + the scene TF LUT. */
  const FIELD = `
uniform int uKind;            /* 0 butterfly · 1 ring · 2 data grid */
uniform float uS,uTf,uInvG,uKap;
uniform sampler3D tD;         /* data vols: raw scalar u */
uniform sampler3D tA;         /* baked AO over the he box */
uniform sampler2D tLUT;       /* data vols: scene TF (rgb + alpha) by u */

float h13(vec3 p){
  p=fract(p*.1031);
  float d=p.x*(p.z+31.32)+p.y*(p.y+31.32)+p.z*(p.x+31.32);
  p+=d;
  return fract((p.x+p.y)*p.z);
}
float vnoise(vec3 p){
  vec3 i=floor(p),f=p-i;
  f=f*f*(3.-2.*f);
  float x0=mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x),f.y);
  float x1=mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x),f.y);
  return 1.-.92*mix(x0,x1,f.z);
}
float fbm(vec3 p){return vnoise(p*.06125)*.5+vnoise(p*.125)*.25+vnoise(p*.25)*.125;}
float spiralC(vec3 p){
  const float nudge=.9,nrm=1./sqrt(1.+nudge*nudge);
  float n=0.,it=2.;
  for(int i=0;i<8;i++){
    n+=-abs(sin(p.y*it)+cos(p.x*it))/it;
    float t=(p.x+p.y*nudge)*nrm; p.y=(p.y-p.x*nudge)*nrm; p.x=t;
    t=(p.x+p.z*nudge)*nrm; p.z=(p.z-p.x*nudge)*nrm; p.x=t;
    it*=1.733733;
  }
  return n;
}
float sdCone(vec3 p,float h,float r1,float r2){
  vec2 q=vec2(length(p.xz),p.y),k2=vec2(r2-r1,2.*h);
  float dk=dot(k2,k2);
  vec2 ca=vec2(q.x-min(q.x,(q.y<0.)?r1:r2),abs(q.y)-h);
  float t=clamp(((r2-q.x)*k2.x+(h-q.y)*k2.y)/dk,0.,1.);
  vec2 cb=vec2(q.x-r2+k2.x*t,q.y-h+k2.y*t);
  return ((cb.x<0.&&ca.y<0.)?-1.:1.)*sqrt(min(dot(ca,ca),dot(cb,cb)));
}
vec3 rotAA(vec3 p,vec3 ax,float ang){
  ax=normalize(ax);
  float c=cos(ang),s=sin(ang);
  return p*c+cross(ax,p)*s+ax*dot(ax,p)*(1.-c);
}
float xr(float a,float b){return max(min(a,b),-max(a,b));}
float sigButterfly(vec3 w){
  vec3 p=rotAA(vec3(w.y,w.z,w.x)*4.2,vec3(-.1,1.,-.3),1.0471976);
  vec3 q=p*1.6;
  vec3 qa=vec3(q.x,q.y-5.8,q.z),qb=vec3(q.x,q.y+6.2,q.z);
  float s1=sdCone(qa,5.,.05,1.4)+fbm(qa*80.)+spiralC(qa*.002);
  float s2=sdCone(qb,-5.,.015,1.4)+fbm(qb*80.)+spiralC(qb*.001);
  return max(0.,.25-(abs(xr(s2,s1)*.45)+.086));
}
float sigRing(vec3 w){
  vec3 p=rotAA(w*3.4,vec3(0.,0.,1.),1.0471976);
  p=rotAA(p,vec3(0.,1.,0.),1.5707963);
  float q0=length(p.xy)-2.2,q1=p.z;
  float q02=q0*q0,q08=q02*q02,q12=q1*q1,q18=q12*q12;
  float a=pow(q08*q08+q18*q18,.125);
  float d1=max(a-1.,abs(p.z)-.3)+vnoise((p+.1)*17.)*.8;
  float d2=length(vec2(length(vec2(p.x*1.3,p.y*.9))-2.2,p.z));
  float neb=length(p)-3.5+fbm(p*10.)+spiralC(vec3(p.z,p.x,p.y)*.415);
  float d3=abs(neb*2.5*.8)+.12;
  float hh=clamp(.5+.5*(d2-d1),0.,1.);
  float sm=mix(d2,d1,hh)-hh*(1.-hh);
  return max(0.,.25-xr(d3,sm));
}
/* the medium is known: density drives both emission and transmittance */
float density(vec3 p){
  if(uKind==2){
    return texture(tD,(p/uHe+1.)*.5).g;
  }
  return (uKind==0?sigButterfly(p):sigRing(p))*3.2;
}
/* the known glow alone — computed along cache suffixes, never cached */
vec3 glowTerm(vec3 p){
  if(uKind==2)return vec3(0.);
  vec3 tc=(p/uHe+1.)*.5;
  float ao=texture(tA,tc).r;
  float lD=length(p)*uS,lDs=max(.03,lD);
  float g1=.7/((lDs*lDs+.12)*10.),e2=exp(-lDs*lDs*lDs*.09),T=lDs*2.3+2.6;
  return .012*(max(vec3(0.),.4+.5*cos(vec3(T-.785,T+.079,T+.785)))*e2+vec3(.57,1.85,1.)*g1)*ao*uInvG;
}
vec3 emissionD(vec3 p,float d){
  vec3 tc=(p/uHe+1.)*.5;
  float ao=texture(tA,tc).r;
  if(uKind==2){
    vec2 da=texture(tD,tc).rg;
    return da.g*ao*texture(tLUT,vec2(da.r,.5)).rgb*uInvG;
  }
  float lD=length(p)*uS;
  float m=min(lD/(2.6*(1.+(uTf-.5)*.9)),1.);
  vec3 dust=(1.-.5*min(1.,d*1.2))*(vec3(5.6,6.3,7.)-vec3(4.1,5.1,6.3)*m);
  float lDs=max(.03,lD);
  float g1=.7/((lDs*lDs+.12)*10.),e2=exp(-lDs*lDs*lDs*.09),T=lDs*2.3+2.6;
  vec3 glow=.012*(max(vec3(0.),.4+.5*cos(vec3(T-.785,T+.079,T+.785)))*e2+vec3(.57,1.85,1.)*g1);
  return (pow(d,2.0)*dust+glow)*ao*uInvG;
}`;

  const TONE = `
uniform float uExpo;
vec4 tone(vec3 L){
  return vec4(vec3(10.,13.,17.)/255.+vec3(245.,242.,238.)/255.*(1.-exp(-uExpo*max(L,vec3(0.)))),1.);
}`;

  /* pass A — BOTH estimators, one sample per pixel per frame, into two
     progressive accumulations (uN = samples held; motion resets to 1):
     R (right pane) — the raw estimate: one stratified sample of the whole
       ray under the known medium's transmittance;
     L (left pane)  — the same estimator with EARLY TERMINATION INTO THE
       CACHE: the first uTerm of the ray is sampled for real (one
       stratified sample), and from the termination point the cache
       supplies the remainder (a march of the cache texture under the
       same transmittance, scaled by the cache-brightness control).
       Its per-frame variance is only the short real prefix — that is
       the method's point. */
  const FSA = `#version 300 es
precision highp float;precision highp sampler3D;
uniform sampler2D tPrevR,tPrevL;
uniform sampler3D tC;
uniform float uSeed,uN,uCbr,uTau,uFrame;
${CAM}
${FIELD}
layout(location=0) out vec4 oR;
layout(location=1) out vec4 oL;
float hash(vec2 p,float s){return fract(sin(dot(p,vec2(12.9898,78.233))+s*.61803)*43758.5453);}
void main(){
  vec2 px=gl_FragCoord.xy,uv=px/uRes;
  vec3 d=ray(px);
  vec2 tt=boxT(uEye,d);
  vec3 radR=vec3(0.),radL=vec3(0.);
  if(tt.y>tt.x){
    /* ONE shared sample: per-pixel stratum offset (static) rotated by the
       frame index — every stratum is visited within M held frames */
    /* stratified-progressive, decorrelated: each pixel walks the strata
       with its own random phase AND its own co-prime stride — stochastic
       across the screen every frame (no coherent wave), yet every pixel
       visits all M strata within M held frames, so the accumulation
       converges to a clean image */
    float M=24.,so=floor(hash(px,3.)*M),h2=hash(px.yx+vec2(31.7,17.3),uSeed+7.);
    float sid=floor(hash(px+vec2(5.1,9.7),5.)*8.);
    float stride=sid<1.?1.:sid<2.?5.:sid<3.?7.:sid<4.?11.:sid<5.?13.:sid<6.?17.:sid<7.?19.:23.;
    float dt=(tt.y-tt.x)/M,st=mod(so+stride*uFrame,M),t=tt.x+(st+h2)*dt;
    /* one fine march: transmittance at the sample, total optical depth,
       and the interpolated tau0 crossing (continuous — no banding) */
    /* every deterministic march runs with a per-frame jittered phase:
       quadrature error becomes noise the accumulation averages away —
       fixed-phase marches leave structured (banded) error that never
       converges out */
    float jq=hash(px+vec2(11.3,29.1),uSeed+31.);
    float MS=32.,dq=(tt.y-tt.x)/MS,tau=0.,Tt=1.,sTerm=tt.y;
    bool gotT=false,gotS=false;
    for(float k=0.;k<32.;k++){
      float tk=tt.x+(k+jq)*dq;
      if(!gotT&&tk>t){Tt=exp(-tau);gotT=true;}
      float dtau=uKap*density(uEye+d*tk)*dq;
      if(!gotS&&tau+dtau>uTau){
        sTerm=tk-.5*dq+dq*clamp((uTau-tau)/max(dtau,1e-6),0.,1.);
        gotS=true;
      }
      tau+=dtau;
    }
    if(!gotT)Tt=exp(-tau);
    /* raw estimator (right) */
    vec3 p=uEye+d*t;
    radR=emissionD(p,density(p))*(tt.y-tt.x)*Tt;
    /* cached estimator (left): continuous policy — the cache carries a
       fraction w of the sample, the same shared sample carries the rest.
       w follows the medium (0 in empty space, 1 once tau0 is reached),
       so thin gas blends smoothly instead of flipping regimes */
    float w=clamp(tau/uTau,0.,1.);
    vec3 cm=vec3(0.);
    if(gotS){
      float jc=hash(px+vec2(3.7,17.9),uSeed+43.);
      float Ts=exp(-uTau),dts=(tt.y-sTerm)/28.;
      for(float k=0.;k<28.;k++){
        vec3 q=uEye+d*(sTerm+(k+jc)*dts);
        Ts*=exp(-uKap*density(q)*dts);
        cm+=texture(tC,(q/uHe+1.)*.5).rgb*uCbr*Ts*dts;
      }
    }
    radL=radR*((1.-w)+w*(t<sTerm?1.:0.))+w*cm;
  }
  vec3 pR=texture(tPrevR,uv).rgb,pL=texture(tPrevL,uv).rgb;
  oR=vec4(pR+(radR-pR)/uN,1.);
  oL=vec4(pL+(radL-pL)/uN,1.);
}`;

  /* pass B — the seam: tone the two accumulations */
  const FSB = `#version 300 es
precision highp float;
uniform sampler2D tAccR,tAccL;
uniform vec2 uRes;
uniform float uSu;
${TONE}
out vec4 o;
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec3 L=uv.x<uSu?texture(tAccL,uv).rgb:texture(tAccR,uv).rgb;
  o=tone(L);
}`;

  /* pass C — the reference inset: the truth field fully marched */
  const FSC = `#version 300 es
precision highp float;precision highp sampler3D;
${CAM}
${FIELD}
${TONE}
out vec4 o;
void main(){
  vec2 px=gl_FragCoord.xy-uOff;
  vec3 d=ray(px);
  vec2 tt=boxT(uEye,d);
  vec3 s=vec3(0.);
  if(tt.y>tt.x){
    float dt=(tt.y-tt.x)/64.,Tr=1.;
    for(float k=0.;k<64.;k++){
      vec3 p=uEye+d*(tt.x+(k+.5)*dt);
      float dd=density(p);
      Tr*=exp(-uKap*dd*dt);
      s+=emissionD(p,dd)*Tr*dt;
    }
  }
  o=tone(s);
}`;

  return { VS, FSA, FSB, FSC };
})();
