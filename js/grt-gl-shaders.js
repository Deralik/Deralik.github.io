/* GLSL for the hero's GPU path (js/grt7-gl.js). The truth field is
   evaluated CONTINUOUSLY per sample here — the nebula densities are
   ports of js/grt-nebulae.js (itself a port of the Gaia Sky / Shadertoy
   GLSL, so this is a round trip home), the data volumes sample their
   vendored grids trilinearly, and shading (official TF + glow + AO)
   matches js/grt7-core.js rebuild() term for term. Three fragments:
   A = one jittered 1-spp estimator sample, progressive-accumulated;
   B = 28-step march of the cache texture + display of A's accumulation,
       split at the seam;
   C = 48-step full march of the truth field (the reference inset). */
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
uniform float uS,uTf,uInvG;
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
  return max(0.,.28-(abs(xr(s2,s1)*.45)+.086));
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
  return max(0.,.28-xr(d3,sm));
}
vec3 emission(vec3 p){
  vec3 tc=(p/uHe+1.)*.5;
  float ao=texture(tA,tc).r;
  if(uKind==2){
    vec4 lut=texture(tLUT,vec2(texture(tD,tc).r,.5));
    return lut.a*ao*lut.rgb*uInvG;
  }
  float d=(uKind==0?sigButterfly(p):sigRing(p))*3.2;
  float lD=length(p)*uS;
  float m=min((lD+.05)/(.9*(1.+(uTf-.5)*.8)),1.);
  vec3 dust=(1.-.5*min(1.,d*1.2))*(vec3(5.6,6.3,7.)-vec3(4.1,5.1,6.3)*m);
  float lDs=max(.03,lD);
  float g1=.7/((lDs*lDs+.12)*10.),e2=exp(-lDs*lDs*lDs*.05),T=lDs*2.3+2.6;
  vec3 glow=.08*(max(vec3(0.),.4+.5*cos(vec3(T-.785,T+.079,T+.785)))*e2+vec3(.57,1.85,1.)*g1);
  return (pow(d,1.6)*dust+glow)*ao*uInvG;
}`;

  const TONE = `
uniform float uExpo;
vec4 tone(vec3 L){
  return vec4(vec3(10.,13.,17.)/255.+vec3(245.,242.,238.)/255.*(1.-exp(-uExpo*max(L,vec3(0.)))),1.);
}`;

  /* pass A — the estimator: ONE jittered stratified sample of the truth
     field per pixel per frame, progressive-mean accumulated (uN = samples
     held; motion resets it to 1 upstream) */
  const FSA = `#version 300 es
precision highp float;precision highp sampler3D;
uniform sampler2D tPrev;
uniform float uSeed,uN;
${CAM}
${FIELD}
out vec4 o;
float hash(vec2 p,float s){return fract(sin(dot(p,vec2(12.9898,78.233))+s*.61803)*43758.5453);}
void main(){
  vec2 px=gl_FragCoord.xy,uv=px/uRes;
  vec3 d=ray(px);
  vec2 tt=boxT(uEye,d);
  vec3 rad=vec3(0.);
  if(tt.y>tt.x){
    float M=24.,h1=hash(px,uSeed),h2=hash(px.yx+vec2(31.7,17.3),uSeed+7.);
    float dt=(tt.y-tt.x)/M,t=tt.x+(floor(h1*M)+h2)*dt;
    rad=emission(uEye+d*t)*(tt.y-tt.x);
  }
  vec3 prev=texture(tPrev,uv).rgb;
  o=vec4(prev+(rad-prev)/uN,1.);
}`;

  /* pass B — the seam: left, a 28-step march of the cache texture under
     the global cache-brightness scalar; right, pass A's accumulation */
  const FSB = `#version 300 es
precision highp float;precision highp sampler3D;
uniform sampler3D tC;
uniform sampler2D tAcc;
uniform float uSu,uCbr;
${CAM}
${TONE}
out vec4 o;
void main(){
  vec2 px=gl_FragCoord.xy,uv=px/uRes;
  vec3 L;
  if(uv.x<uSu){
    vec3 s=vec3(0.);
    vec3 d=ray(px);
    vec2 tt=boxT(uEye,d);
    if(tt.y>tt.x){
      float dt=(tt.y-tt.x)/28.;
      for(float k=0.;k<28.;k++){
        vec3 p=uEye+d*(tt.x+(k+.5)*dt);
        s+=texture(tC,(p/uHe+1.)*.5).rgb*dt;
      }
    }
    L=s*uCbr;
  } else {
    L=texture(tAcc,uv).rgb;
  }
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
    float dt=(tt.y-tt.x)/48.;
    for(float k=0.;k<48.;k++) s+=emission(uEye+d*(tt.x+(k+.5)*dt))*dt;
  }
  o=tone(s);
}`;

  return { VS, FSA, FSB, FSC };
})();
