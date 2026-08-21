#!/usr/bin/env python3
"""Render triage stills of raw volumes so the owner can pick demo datasets
and transfer functions. Output: design/local/volshots/ (gitignored).
Usage: python3 scripts/volshot.py [name ...]   (default: all known)"""
import sys, os
import numpy as np
from PIL import Image

G = os.path.expanduser('~/GitHub/gsrc/data/data')
SETS = {  # name: (path, dims xyz as stored (z-major reshape), dtype)
 'supernova':  (f'{G}/E_1296.dat',                            (432,432,432), '<f4'),
 'heptane':    (f'{G}/csafe_heptane_302x302x302_uint8.raw',   (302,302,302), 'u1'),
 'carp':       (f'{G}/carp_256x256x512_uint16.raw',           (512,256,256), '<u2'),
 'mechhand':   (f'{G}/MechHand_f_640x220x229_float32.raw',    (229,220,640), '<f4'),
 'smoke2':     (f'{G}/smoke2_density_191x610x178_float32.raw',(178,610,191), '<f4'),
 'plume':      (f'{G}/pbrt_smoke_plume_192x256x192_float32.raw',(192,256,192),'<f4'),
 'vorts':      (f'{G}/vorts1.data',                           (128,128,128), '<f4'),
}

def tf_ember(d):
    a = np.clip((d-.06)*2.2, 0, 1)**1.6
    c = np.stack([np.clip(d*2.6,0,1), np.clip(d*1.9-.15,0,1), np.clip(d*1.4-.3,0,1)], -1)
    return c, a
def tf_ice(d):
    a = np.clip((d-.05)*2.0, 0, 1)**1.4
    c = np.stack([np.clip(d*1.5-.25,0,1), np.clip(d*1.8-.1,0,1), np.clip(.35+d*1.6,0,1)], -1)
    return c, a
def tf_xray(d):
    a = np.clip(d*1.6, 0, 1)**1.2
    g = np.clip(.25+d*1.5, 0, 1); return np.stack([g,g,g], -1), a
def tf_veil(d):  # thin: reveals interior of dense volumes
    a = np.clip((d-.25)*1.1, 0, 1)**2.4*.25
    c = np.stack([np.clip(.2+d*1.6,0,1), np.clip(.1+d*1.35,0,1), np.clip(.45+d*.9,0,1)], -1)
    return c, a
TFS = {'ember': tf_ember, 'ice': tf_ice, 'xray': tf_xray, 'veil': tf_veil}

def load(name):
    path, dims, dt = SETS[name]
    a = np.fromfile(path, dtype=dt).astype(np.float32).reshape(dims)
    s = [max(1, x//160) for x in a.shape]            # keep <=~160 per axis
    a = a[::s[0], ::s[1], ::s[2]]
    lo, hi = np.percentile(a, [2, 99.8])
    return np.clip((a-lo)/max(hi-lo,1e-9), 0, 1)

def render(d, axis, tf, px=440):
    v = np.moveaxis(d, axis, 0)                       # composite along axis 0
    col = np.zeros(v.shape[1:] + (3,)); acc = np.zeros(v.shape[1:])
    step = 3.2/v.shape[0]
    for k in range(v.shape[0]):                       # front-to-back
        c, a = tf(v[k]); a = 1-(1-a)**(step*18)
        w = (1-acc)*a
        col += w[...,None]*c; acc += w
        if acc.min() > .995: break
    img = (np.clip(col,0,1)**(1/1.9)*255).astype(np.uint8)
    im = Image.fromarray(img); im = im.resize((int(px*im.width/max(im.size)), int(px*im.height/max(im.size))))
    return im

def main():
    out = 'design/local/volshots'; os.makedirs(out, exist_ok=True)
    names = sys.argv[1:] or list(SETS)
    tiles = []
    for n in names:
        try: d = load(n)
        except Exception as e: print(f'{n}: SKIP ({e})'); continue
        for tfn, tf in TFS.items():
            for ax in (0, 2):
                im = render(d, ax, tf)
                p = f'{out}/{n}-{tfn}-ax{ax}.png'; im.save(p); tiles.append((f'{n} {tfn} ax{ax}', im))
        print(n, 'done')
    # contact sheet
    if tiles:
        tw, th, cols = 470, 500, 6
        rows = -(-len(tiles)//cols)
        sheet = Image.new('RGB', (cols*tw, rows*th), (14,16,18))
        from PIL import ImageDraw
        dr = ImageDraw.Draw(sheet)
        for i, (label, im) in enumerate(tiles):
            x, y = (i%cols)*tw, (i//cols)*th
            sheet.paste(im, (x+(tw-im.width)//2, y+24+(th-48-im.height)//2))
            dr.text((x+10, y+6), label, fill=(200,205,210))
        sheet.save(f'{out}/CONTACT-SHEET.png'); print('sheet:', f'{out}/CONTACT-SHEET.png')

main()
