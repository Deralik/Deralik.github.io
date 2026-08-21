/* GL pane renderer for the hero — the same two integrals as the CPU path
   (js/grt7-a.js march()), at full pane resolution with trilinear grids:
   right of the seam, one jittered 1-spp sample of the truth field per
   frame, EMA-accumulated in a linear float buffer; left, a 28-step march
   of the cache's baked field under the global cache-brightness scalar;
   one fixed exposure, the research renderer's display curve. Returns
   null when WebGL2/float buffers are missing — the CPU path stands. */
window.GRT7GL=function(){
const cv=document.createElement('canvas');
const gl=cv.getContext('webgl2',{alpha:false,antialias:false,preserveDrawingBuffer:false});
if(!gl)return null;
if(!gl.getExtension('EXT_color_buffer_float'))return null;
const VS=`#version 300 es
void main(){vec2 P[3]=vec2[3](vec2(-1,-1),vec2(3,-1),vec2(-1,3));gl_Position=vec4(P[gl_VertexID],0,1);}`;
const CAM=`
uniform vec3 uEye,uFwd,uRight,uUp,uHe,uCb0,uCb1;uniform vec2 uRes;uniform float uF;
vec2 boxT(vec3 e,vec3 d){vec3 a=(uCb0-e)/d,b=(uCb1-e)/d;vec3 lo=min(a,b),hi=max(a,b);
return vec2(max(max(lo.x,lo.y),max(lo.z,0.)),min(min(hi.x,hi.y),hi.z));}
vec3 ray(vec2 px){float vx=(px.x-uRes.x*.5)/(uRes.y*uF),vy=(px.y-uRes.y*.5)/(uRes.y*uF);
return normalize(uFwd+vx*uRight+vy*uUp);}`;
const FSA=`#version 300 es
precision highp float;precision highp sampler3D;
uniform sampler3D tE;uniform sampler2D tPrev;uniform float uSeed,uAlpha;
${CAM}
out vec4 o;
float hash(vec2 p,float s){return fract(sin(dot(p,vec2(12.9898,78.233))+s*.61803)*43758.5453);}
void main(){vec2 px=gl_FragCoord.xy,uv=px/uRes;
vec3 d=ray(px);vec2 tt=boxT(uEye,d);vec3 rad=vec3(0.);
if(tt.y>tt.x){float M=24.,h1=hash(px,uSeed),h2=hash(px.yx+vec2(31.7,17.3),uSeed+7.);
float dt=(tt.y-tt.x)/M,t=tt.x+(floor(h1*M)+h2)*dt;
vec3 p=uEye+d*t;rad=texture(tE,(p/uHe+1.)*.5).rgb*(tt.y-tt.x);}
o=vec4(mix(texture(tPrev,uv).rgb,rad,uAlpha),1.);}`;
const FSB=`#version 300 es
precision highp float;precision highp sampler3D;
uniform sampler3D tC;uniform sampler2D tAcc;uniform float uSu,uCbr,uExpo;
${CAM}
out vec4 o;
void main(){vec2 px=gl_FragCoord.xy,uv=px/uRes;vec3 L;
if(uv.x<uSu){vec3 s=vec3(0.);vec2 tt=boxT(uEye,ray(px));
if(tt.y>tt.x){float dt=(tt.y-tt.x)/28.;vec3 d=ray(px);
for(float k=0.;k<28.;k++){vec3 p=uEye+d*(tt.x+(k+.5)*dt);s+=texture(tC,(p/uHe+1.)*.5).rgb*dt;}}
L=s*uCbr;}
else L=texture(tAcc,uv).rgb;
o=vec4(vec3(10.,13.,17.)/255.+vec3(245.,242.,238.)/255.*(1.-exp(-uExpo*max(L,vec3(0.)))),1.);}`;
function sh(t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);
if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('grt7-gl',gl.getShaderInfoLog(s));return null}return s}
function prog(fs){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.warn('grt7-gl',gl.getProgramInfoLog(p));return null}return p}
const pA=prog(FSA),pB=prog(FSB);if(!pA||!pB)return null;
const U=(p,n)=>gl.getUniformLocation(p,n);
function tex3(){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_3D,t);
gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_R,gl.CLAMP_TO_EDGE);return t}
const S={tE:tex3(),tC:tex3(),dims:null,vol:null,acc:[null,null],fbo:[null,null],aw:0,ah:0,ai:0,rgba:null};
function upload(t,grid){const[EX,EY,EZ]=S.dims,n=EX*EY*EZ;
if(!S.rgba||S.rgba.length!==n*4)S.rgba=new Float32Array(n*4);
const R=S.rgba;for(let i=0;i<n;i++){R[i*4]=grid[i*3];R[i*4+1]=grid[i*3+1];R[i*4+2]=grid[i*3+2];R[i*4+3]=1}
gl.bindTexture(gl.TEXTURE_3D,t);gl.texSubImage3D(gl.TEXTURE_3D,0,0,0,0,EX,EY,EZ,gl.RGBA,gl.FLOAT,R)}
function allocVol(vol){S.dims=[vol.EX,vol.EY,vol.EZ];
for(const t of[S.tE,S.tC]){gl.bindTexture(gl.TEXTURE_3D,t);gl.texImage3D(gl.TEXTURE_3D,0,gl.RGBA16F,vol.EX,vol.EY,vol.EZ,0,gl.RGBA,gl.FLOAT,null)}}
function accAlloc(w,h){S.aw=w;S.ah=h;
for(let i=0;i<2;i++){if(S.acc[i])gl.deleteTexture(S.acc[i]);if(S.fbo[i])gl.deleteFramebuffer(S.fbo[i]);
const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,w,h,0,gl.RGBA,gl.FLOAT,null);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
S.acc[i]=t;S.fbo[i]=f}
gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
function cam(p,o){gl.uniform3f(U(p,'uEye'),o.eye[0],o.eye[1],o.eye[2]);
gl.uniform3f(U(p,'uFwd'),o.fwd[0],o.fwd[1],o.fwd[2]);gl.uniform3f(U(p,'uRight'),o.rt[0],o.rt[1],o.rt[2]);
gl.uniform3f(U(p,'uUp'),o.up[0],o.up[1],o.up[2]);gl.uniform3f(U(p,'uHe'),o.he[0],o.he[1],o.he[2]);
gl.uniform3f(U(p,'uCb0'),o.cb[0],o.cb[2],o.cb[4]);gl.uniform3f(U(p,'uCb1'),o.cb[1],o.cb[3],o.cb[5]);
gl.uniform2f(U(p,'uRes'),cv.width,cv.height);gl.uniform1f(U(p,'uF'),o.f)}
return{cv,
setVol(vol){if(!S.dims||S.dims[0]!==vol.EX||S.dims[1]!==vol.EY||S.dims[2]!==vol.EZ)allocVol(vol);
S.vol=vol;upload(S.tE,vol.grid);
if(S.aw){for(const f of S.fbo){gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT)}gl.bindFramebuffer(gl.FRAMEBUFFER,null)}},
uploadC(CG){upload(S.tC,CG)},
draw(o){const w=Math.max(8,o.w|0),h=Math.max(8,o.h|0);
if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
if(S.aw!==w||S.ah!==h)accAlloc(w,h);
gl.viewport(0,0,w,h);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
const ni=1-S.ai;
gl.bindFramebuffer(gl.FRAMEBUFFER,S.fbo[ni]);
gl.useProgram(pA);cam(pA,o);
gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_3D,S.tE);gl.uniform1i(U(pA,'tE'),0);
gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,S.acc[S.ai]);gl.uniform1i(U(pA,'tPrev'),1);
gl.uniform1f(U(pA,'uSeed'),o.seed%997);gl.uniform1f(U(pA,'uAlpha'),.12);
gl.drawArrays(gl.TRIANGLES,0,3);
gl.bindFramebuffer(gl.FRAMEBUFFER,null);
gl.useProgram(pB);cam(pB,o);
gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_3D,S.tC);gl.uniform1i(U(pB,'tC'),0);
gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,S.acc[ni]);gl.uniform1i(U(pB,'tAcc'),1);
gl.uniform1f(U(pB,'uSu'),o.su);gl.uniform1f(U(pB,'uCbr'),o.cbr);gl.uniform1f(U(pB,'uExpo'),o.expo);
gl.drawArrays(gl.TRIANGLES,0,3);
S.ai=ni}}
};
