#!/usr/bin/env python3
"""Offline twin of the browser hero pipeline (js/grt7-core.js rebuild + march).
Renders what the truth pane should look like for the real datasets, using the
research repo's official scalar domains + transfer functions, so TF choices are
verified against the gsrc reference figures before they are ported to JS.
Outputs: design/local/volshots/hero-<vol>-a<az>.png
"""
import numpy as np, os, sys
from PIL import Image

GSRC='/home/deralik/GitHub/gsrc/data/data'
OUT='design/local/volshots'
os.makedirs(OUT,exist_ok=True)

def load_raw(path,dims,dtype):
    v=np.fromfile(path,dtype=dtype).astype(np.float32)
    return v.reshape(dims[::-1])            # (z,y,x)

def boxdown(v,f):
    """block-mean by factor f per axis, ragged tail blocks included"""
    def red(a,ax):
        n=a.shape[ax]; idx=np.arange(0,n,f)
        s=np.add.reduceat(a,idx,axis=ax)
        cnt=np.diff(np.append(idx,n)).astype(np.float32)
        sh=[1]*a.ndim; sh[ax]=len(idx)
        return s/cnt.reshape(sh)
    for ax in range(3): v=red(v,ax)
    return v

def pw(u,pts):
    """piecewise-linear through [(pos,r,g,b),...] -> (...,3)"""
    p=np.array([q[0] for q in pts]); c=np.array([q[1:] for q in pts])
    out=np.empty(u.shape+(3,),np.float32)
    for ch in range(3): out[...,ch]=np.interp(u,p,c[:,ch])
    return out

def pw1(u,p,a): return np.interp(u,p,a).astype(np.float32)

# ── official TFs (gsrc scene JSONs, recovered 2026-08-21) ──
MECH_RGB=[(0,1,1,1),(.0993,1,.972,.930),(.2855,.961,.475,0),
          (.4420,.8,0,0),(.5890,.204,.396,.643),(1,.361,.208,.400)]
MECH_A=([0,.0625,.125,.25,.375,.5,.625,.75,.875,1],
        [0,.057,.108,.211,.335,.449,.591,.701,.830,1])
SUP_RGB=[(0,1,1,1),(.0852,1,1,1),(.1157,0,.365,1),(.2344,.102,.873,.503),
         (.5532,.988,.914,.310),(.6343,.961,.475,0),(.7718,.937,.161,.161),
         (1,.937,.161,.161)]
SUP_A=([0,.586,.625,.75,.875,1],[0,0,.068,.243,.590,.854])

def emit_grid(U,he,dims_e,rgb_pts,alpha,afloor=None):
    """U: u-grid (z,y,x) over slab he; EMIT at dims_e=(ex,ey,ez) — mirrors rebuild()"""
    ez,ey,ex=dims_e[2],dims_e[1],dims_e[0]
    xs=(-1+2*(np.arange(ex)+.5)/ex)*he[0]
    ys=(-1+2*(np.arange(ey)+.5)/ey)*he[1]
    zs=(-1+2*(np.arange(ez)+.5)/ez)*he[2]
    Z,Y,X=np.meshgrid(zs,ys,xs,indexing='ij')
    def usamp(x,y,z):
        nz,ny,nx=U.shape
        fx=np.clip((x/he[0]+1)/2*(nx-1),0,nx-1.001)
        fy=np.clip((y/he[1]+1)/2*(ny-1),0,ny-1.001)
        fz=np.clip((z/he[2]+1)/2*(nz-1),0,nz-1.001)
        i,j,k=fx.astype(int),fy.astype(int),fz.astype(int)
        u,v,w=fx-i,fy-j,fz-k
        g=lambda I,J,K:U[K,J,I]
        i1,j1,k1=np.minimum(i+1,nx-1),np.minimum(j+1,ny-1),np.minimum(k+1,nz-1)
        c00=g(i,j,k)*(1-u)+g(i1,j,k)*u; c10=g(i,j1,k)*(1-u)+g(i1,j1,k)*u
        c01=g(i,j,k1)*(1-u)+g(i1,j,k1)*u; c11=g(i,j1,k1)*(1-u)+g(i1,j1,k1)*u
        return (c00*(1-v)+c10*v)*(1-w)+(c01*(1-v)+c11*v)*w
    def dget(x,y,z):
        uu=usamp(x,y,z); a=pw1(uu,*alpha)
        if afloor is not None: a=np.maximum(a,afloor(uu))
        return a,uu
    d,uu=dget(X,Y,Z)
    step=2*he[0]/ex
    nb=np.zeros_like(d)
    for dx,dy,dz in [(step,0,0),(-step,0,0),(0,step,0),(0,-step,0),(0,0,step),(0,0,-step)]:
        nb+=dget(X+dx,Y+dy,Z+dz)[0]
    nb/=6
    ao=np.exp(-1.9*nb)
    c=pw(uu,rgb_pts)
    E=(d*ao)[...,None]*c
    E[d<=.004]=0
    m=max(E.mean(-1).max(),1e-6)
    return (E/m).astype(np.float32)

def march(E,he,eye,f=1.05,W=352,H=242,M=22):
    fw=-np.array(eye); fw/=np.linalg.norm(fw)
    rt=np.cross(fw,[0,1,0]); rt/=np.linalg.norm(rt)
    up=np.cross(rt,fw)
    j,i=np.mgrid[0:H,0:W]
    vx=((i+.5)/W*W-W/2)/(H*f); vy=(H/2-(j+.5))/(H*f)
    d=fw+vx[...,None]*rt+vy[...,None]*up
    d/=np.linalg.norm(d,axis=-1,keepdims=True)
    e=np.array(eye)
    bq=d@e; cq=e@e-2.25; disc=bq*bq-cq
    hit=disc>0; sq=np.sqrt(np.where(hit,disc,0))
    t0=-bq-sq; dt=(2*sq)/M
    ez,ey_,ex=E.shape[:3]
    acc=np.zeros((H,W,3),np.float32)
    for k in range(M):
        t=t0+(k+.5)*dt
        p=e+d*t[...,None]
        inside=hit&(np.abs(p[...,0])<he[0])&(np.abs(p[...,1])<he[1])&(np.abs(p[...,2])<he[2])
        ii=np.clip(((p[...,0]/he[0]+1)/2*ex).astype(int),0,ex-1)
        jj=np.clip(((p[...,1]/he[1]+1)/2*ey_).astype(int),0,ey_-1)
        kk=np.clip(((p[...,2]/he[2]+1)/2*ez).astype(int),0,ez-1)
        acc+=np.where(inside[...,None],E[kk,jj,ii],0)*dt[...,None]
    return acc

def calibrate(E,he):
    ls=[]
    for a in range(26):
        for b in range(10):
            th=a/26*6.283; eye=[2.1*np.cos(th),.15+b*.09,2.1*np.sin(th)]
            L=march(E,he,eye,W=8,H=6)
            s=L.mean(-1)
            ls+=list(s[s>0].ravel())
    ls=np.sort(np.array(ls))
    p=ls[int(len(ls)*.97)] if len(ls) else 1
    return 3.0/max(p,1e-4)

def tone(L,expo):
    img=np.empty(L.shape,np.uint8)
    base=[10,13,17]; span=[245,242,238]
    for ch in range(3):
        img[...,ch]=(base[ch]+span[ch]*(1-np.exp(-expo*np.maximum(0,L[...,ch])))).astype(np.uint8)
    return img

def eye_at(a,p=0.15):
    hr=np.cos(p)
    return [2.1*hr*np.cos(a),.5+.28*np.sin(.6*a)+2.1*np.sin(p),2.1*hr*np.sin(a)]

def render_set(name,E,he,azs=(0,1.2,2.4,3.8,5.0)):
    expo=calibrate(E,he)
    print(f'{name}: expo={expo:.2f}')
    for a in azs:
        L=march(E,he,eye_at(a))
        Image.fromarray(tone(L,expo)).save(f'{OUT}/hero-{name}-a{a:.1f}.png')

def vendor(U,path,var,head):
    import base64
    b=base64.b64encode((np.clip(U,0,1)*255+.5).astype(np.uint8).tobytes()).decode()
    nz,ny,nx=U.shape
    open(path,'w').write(f"{head}window.{var}={{nx:{nx},ny:{ny},nz:{nz},b64:'{b}'}};\n")
    print(path,U.shape,os.path.getsize(path)//1024,'KB')

which=sys.argv[1] if len(sys.argv)>1 else 'all'

if which=='vendor':
    raw=load_raw(f'{GSRC}/MechHand_f_640x220x229_float32.raw',(640,220,229),np.float32)
    U=np.clip(boxdown(raw,5)/0.964286,0,1)
    U=np.transpose(U,(0,2,1))   # hand upright: world y = the CT's long axis
    vendor(U,'js/grt-vol-mechhand.js','GRT_MECHHAND',
"""/* GRT hero demo volume — REAL DATA, vendored for the browser.
   Source: MechHand industrial CT (640x220x229 float32), the "Mechanical
   Hand" benchmark volume of the GRTCache research repo. This file: 5^3
   box-filtered, mapped to the scene's official scalar domain
   (0..0.964286), quantized uint8, long axis stored as y so the hand
   stands upright. Prepared 2026-08-21. */
""")
    raw=load_raw(f'{GSRC}/E_1296.dat',(432,432,432),np.float32)
    U=np.clip(boxdown(raw,6)/0.135840,0,1)
    vendor(U,'js/grt-vol-supernova.js','GRT_SUPERNOVA',
"""/* GRT hero demo volume — REAL DATA, vendored for the browser.
   Source: supernova simulation timestep E_1296 (John M. Blondin, NCSU),
   the "supernova" entry of the Open SciVis Datasets collection
   (klacansky.com/open-scivis-datasets) — the same dataset the GRTCache
   research repo benchmarks on. Original: 432^3 float32. This file: 6^3
   box-filtered to 72^3, mapped to the scene's official scalar domain
   (0..0.13584), quantized uint8, z-major. Prepared 2026-08-21; credit
   the source wherever the demo renders. */
""")
    sys.exit()

if which in('all','mech'):
    raw=load_raw(f'{GSRC}/MechHand_f_640x220x229_float32.raw',(640,220,229),np.float32)
    U=np.clip(boxdown(raw,5)/0.964286,0,1)     # (29,28,80) z,y,x
    he=[1.32*e for e in (1,220/640,229/640)]
    render_set('mech',emit_grid(U,he,(104,36,37),MECH_RGB,MECH_A),he)

if which in('all','super','superfloor'):
    raw=load_raw(f'{GSRC}/E_1296.dat',(432,432,432),np.float32)
    U=np.clip(boxdown(raw,8)/0.135840,0,1)
    he=[1.25,1.25,1.25]
    if which!='superfloor':
        render_set('super',emit_grid(U,he,(56,56,56),SUP_RGB,SUP_A),he)
    else:
        fl=lambda u:(.05*np.clip((u-.05)/.2,0,1)).astype(np.float32)
        render_set('superfloor',emit_grid(U,he,(56,56,56),SUP_RGB,SUP_A,afloor=fl),he)
