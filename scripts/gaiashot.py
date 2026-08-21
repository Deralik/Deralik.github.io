#!/usr/bin/env python3
"""Faithful numpy port of the Gaia Sky nebula shaders (crab / helix) —
their own raymarcher and computeColor ARE the official transfer function.
PREVIEW ONLY: shaders are Shadertoy-derived, CC-BY-NC-SA.
Usage: python3 scripts/gaiashot.py [crab] [helix]"""
import sys, os
import numpy as np
from PIL import Image

def hash13(p):
    p = (p * .1031) % 1.0
    d = (p[...,0]*(p[...,2]+31.32) + p[...,1]*(p[...,1]+31.32) + p[...,2]*(p[...,0]+31.32))
    p = p + d[...,None]
    return ((p[...,0]+p[...,1]) * p[...,2]) % 1.0

def vnoise(x):
    p = np.floor(x); f = x-p; f = f*f*(3-2*f)
    def h(o): return hash13(p+np.array(o))
    l = lambda a,b,t: a+(b-a)*t
    x0 = l(l(h((0,0,0)),h((1,0,0)),f[...,0]), l(h((0,1,0)),h((1,1,0)),f[...,0]), f[...,1])
    x1 = l(l(h((0,0,1)),h((1,0,1)),f[...,0]), l(h((0,1,1)),h((1,1,1)),f[...,0]), f[...,1])
    return 1.0-0.92*l(x0,x1,f[...,2])

def fbm(p): return vnoise(p*.06125)*.5 + vnoise(p*.125)*.25 + vnoise(p*.25)*.125

def spiralC(p):
    p = p.copy(); n = np.zeros(p.shape[:-1]); nudge=.9; norm=1/np.sqrt(1+nudge*nudge); it=2.0
    for _ in range(8):
        n += -np.abs(np.sin(p[...,1]*it)+np.cos(p[...,0]*it))/it
        x,y = p[...,0].copy(), p[...,1].copy()
        p[...,0],p[...,1] = (x+y*nudge)*norm, (y-x*nudge)*norm
        x,z = p[...,0].copy(), p[...,2].copy()
        p[...,0],p[...,2] = (x+z*nudge)*norm, (z-x*nudge)*norm
        it *= 1.733733
    return n

def disk(p, t, zmul):  # p: (...,3) already swizzled to shader's p.xzy convention
    q0 = np.sqrt(p[...,0]**2+p[...,1]**2) - t[0]
    q1 = p[...,2]*zmul
    a = q0**8 + q1**8
    return np.maximum(a**(1/8.) - t[1], np.abs(p[...,2]) - t[2])

def rot_axis(v, axis, ang):
    ax = np.array(axis,float); ax/=np.linalg.norm(ax)
    c,s = np.cos(ang), np.sin(ang); d=(v*ax).sum(-1)[...,None]
    return v*c + np.cross(np.broadcast_to(ax,v.shape), v)*s + ax*d*(1-c)

def map_crab(p):
    p = p[...,[1,2,0]]                       # p.yzx
    p = rot_axis(p,(1,1,1),-np.pi/3)
    q = p/0.5
    neb = disk(q[...,[0,2,1]],(2,2,.3),.7) + fbm(q*60) + spiralC(q[...,[2,0,1]]*.7+1.6)*2
    return np.abs(neb*0.5)+0.07

def map_helix(p):
    q = p/0.5
    neb = disk(q[...,[0,2,1]],(2,1.8,1.25),.5) + fbm(q*20) + spiralC(q[...,[2,0,1]]*.5123+100.)*3
    return np.abs(neb*0.5)+0.07

def sphere(p,r): return np.linalg.norm(p,axis=-1)-r
def xor_(a,b): return np.maximum(np.minimum(a,b),-np.maximum(a,b))
def smin(a,b,k):
    h=np.clip(.5+.5*(b-a)/k,0,1); return b+(a-b)*h-k*h*(1-h)
def capped_cone(p,h,r1,r2):
    qx=np.sqrt(p[...,0]**2+p[...,2]**2); qy=p[...,1]
    k1=np.array([r2,h]); k2=np.array([r2-r1,2*h])
    cax=qx-np.minimum(qx,np.where(qy<0,r1,r2)); cay=np.abs(qy)-h
    t=np.clip(((k1[0]-qx)*k2[0]+(k1[1]-qy)*k2[1])/(k2@k2),0,1)
    cbx=qx-k1[0]+k2[0]*t; cby=qy-k1[1]+k2[1]*t
    sg=np.where((cbx<0)&(cay<0),-1.,1.)
    return sg*np.sqrt(np.minimum(cax**2+cay**2,cbx**2+cby**2))
def spiral3D(p):
    p=p.copy(); n=np.zeros(p.shape[:-1]); nudge=.9; norm=1/np.sqrt(1+nudge*nudge); it=1.0
    for _ in range(5):
        n+=(np.sin(p[...,1]*it)+np.cos(p[...,0]*it))/it
        x,z=p[...,0].copy(),p[...,2].copy()
        p[...,0],p[...,2]=(x+z*nudge)*norm,(z-x*nudge)*norm
        it*=1.33733
    return n
def map_catseye(p):
    p=p[...,[1,2,0]]; p=rot_axis(p,(-0.5,1,0),np.pi/4); q=p/0.645
    neb=disk(q[...,[0,2,1]],(1.4,1.8,1.25),.5)+fbm(q*90)+spiralC(q[...,[2,0,1]]*.7123)*2.3
    return np.abs(neb*0.45)+0.086
def map_box(p):
    p=rot_axis(p,(0.2,0.1,1),np.pi/2); q=p/0.645
    neb=disk(q[...,[0,2,1]],(1,2.2,1.05),.5)+fbm(q*20)+spiralC(q)
    return np.abs(neb*0.35)+0.098
def map_butterfly(p):
    p=p[...,[1,2,0]]; p=rot_axis(p,(-0.1,1,-0.3),np.pi/3); q=p*1.6
    p1=q.copy(); p1[...,1]-=5.8
    s1=capped_cone(p1,5.,.05,1.4)+fbm(p1*80)+spiralC(p1*.002)
    p2=q.copy(); p2[...,1]+=6.2
    s2=capped_cone(p2,-5.,.015,1.4)+fbm(p2*80)+spiralC(p2*.001)
    return np.abs(xor_(s2,s1)*0.45)+0.086
def map_hourglass(p):
    p=p[...,[1,2,0]]; p=rot_axis(p,(1,1,1),-np.pi/8); q=p/0.645
    p1=q.copy(); p1[...,1]-=1.0
    s1=sphere(p1,1.4)+fbm(p1*10)+spiralC(p1*.222)
    p2=q.copy(); p2[...,1]+=2.1
    s2=sphere(p2,1.4)+fbm(p2*10)+spiralC(p2*.33)
    return np.abs(xor_(s2,s1)*0.45)+0.086
def map_ring(p):
    p=rot_axis(p,(0,0,1),np.deg2rad(60)); p=rot_axis(p,(0,1,0),np.deg2rad(90))
    d1=disk(p[...,[0,1,2]]*1,(2.2,1.,0.3),1.0)+vnoise((p+0.1)*17)*0.8
    rp=p.copy(); rx=p[...,0]*1.3; ry=p[...,1]*0.9
    d2=np.sqrt((np.sqrt(rx**2+ry**2)-2.2)**2+p[...,2]**2)
    neb=sphere(p[...,[0,2,1]],3.5)+fbm(p*10)+spiralC(p[...,[2,0,1]]*.415)
    d3=np.abs(neb*2.5*0.8)+0.07
    return xor_(d3,smin(d1,d2,1.0))
def map_trifid(p):
    p=rot_axis(p,(0,0,1),np.deg2rad(80)); q=p/0.5
    neb=q[...,1]+4.5-spiralC(q)+spiralC(q[...,[2,0,1]]*.523+10.)*4.0-spiral3D(q)
    return np.abs(neb*0.33)+0.04
MAPS={'crab':map_crab,'helix':map_helix,'catseye':map_catseye,'box':map_box,
      'butterfly':map_butterfly,'hourglass':map_hourglass,'ring':map_ring,'trifid':map_trifid}

def render(kind, cam, W=460, H=340, fov=.9):
    MAP=MAPS[kind]
    ro=np.array(cam,float); fwd=-ro/np.linalg.norm(ro)
    right=np.cross(fwd,[0,1,0]); right/=np.linalg.norm(right); up=np.cross(right,fwd)
    i,j=np.meshgrid(np.arange(W),np.arange(H))
    u=(i-W/2)/H*fov; v=-(j-H/2)/H*fov
    rd=fwd+u[...,None]*right+v[...,None]*up; rd/=np.linalg.norm(rd,axis=-1,keepdims=True)
    t=np.full((H,W),np.linalg.norm(ro)-3.2); alive=np.ones((H,W),bool)
    ld=np.zeros((H,W)); td=np.zeros((H,W)); sum_=np.zeros((H,W,4))
    for _ in range(70):
        pos=ro+t[...,None]*rd
        d=np.maximum(MAP(pos),0.0)
        ldst=-pos; lD=np.maximum(np.linalg.norm(ldst,axis=-1),.001)
        T=lD*2.3+2.6
        lc=.4+.5*np.cos(T[...,None]+np.pi*.5*np.array([-.5,.05,.5]))
        m=alive[...,None]
        sum_[...,:3]+=m*(np.array([.57,1.85,1.])/(lD*lD*10)[...,None]/70)
        sum_[...,:3]+=m*(lc/np.exp(lD**3*.05)[...,None]/50)
        hit=(d<.1)&alive
        ldn=np.where(hit,.1-d,0.0); ld=np.where(hit,ldn,ld)
        w=(1-td)*ldn
        td=td+np.where(hit,w+1/200.,0.0)
        # computeColor(td, lDist)
        res=(1+ (0.5-1)*td)[...,None]*np.ones(3)
        colC=7*np.array([.8,.9,1.]); colE=1.5*np.array([.48,.53,.5])
        mixr=np.clip((lD+.05)/.9,None,1.15)[...,None]
        col3=res*(colC+(colE-colC)*np.minimum(mixr,1.0))
        a=(td*.2)[...,None]
        sum_+= np.where(hit[...,None], np.concatenate([col3*a,a],-1)*(1-sum_[...,3:4]),0)
        sum_[...,:3]+=sum_[...,3:4]*sum_[...,:3]*.2*hit[...,None]
        td=td+np.where(alive,1/60.,0)
        step=np.maximum(d*.1*np.maximum(np.minimum(lD,np.linalg.norm(ro)),1.),.01)
        t=t+np.where(alive,step,0)
        alive=alive&(td<=.9)&(sum_[...,3]<=.99)&(t<np.linalg.norm(ro)+3.2)
        if not alive.any(): break
    s=np.clip(sum_/np.exp(ld*.2)[...,None]*.6,0,1)
    s=s*s*(3-2*s)
    return Image.fromarray((s[...,:3]*255).astype(np.uint8))

def main():
    out='design/local/volshots'; os.makedirs(out,exist_ok=True)
    for kind in (sys.argv[1:] or ['crab','helix']):
        for name,cam in [('a',(0,1.2,5.2)),('b',(4.2,2.2,2.2))]:
            im=render(kind,cam)
            p=f'{out}/gaia-{kind}-{name}.png'; im.save(p); print(p)

main()
