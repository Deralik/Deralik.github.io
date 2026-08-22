/* GRTCache skeleton wiring — panel mini + doc figures (hero, method pair,
   comparison). Mirrors cinr-skeleton.js's role. */
(() => {
  const $ = (id) => document.getElementById(id);
  /* Panel/card figure — the BUTTERFLY dataset's own cache view (owner
   2026-08-22): the same pre-trained field the hero adopts at D2, so the
   morph carries one object from card to doc and the first dataset is
   already built when the doc opens. The chip states what is true NOW:
   Running while frames tick, Held when the loop is paused. */
  /* decode the pre-generated placeholder (js/grt-card-cache.js) into
     draw-ready arrays — zero build, zero training */
  function cardData() {
    const C = window.GRT_CARD;
    if (!C) return null;
    const dec = (b64, T) => {
      const s = atob(b64),
        u = new Uint8Array(s.length);
      for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
      return new T(u.buffer);
    };
    return {
      n: C.n,
      pos: dec(C.pos, Int16Array),
      sz: dec(C.sz, Uint8Array),
      col: dec(C.col, Uint8Array),
      st: C.st,
      rays: C.rays,
    };
  }
  function panel(cv) {
    if (!cv) return;
    let sh = null,
      st = null,
      anim = null,
      pc = null,
      ray = null,
      rayAt = 0,
      lastT = 0;
    const cam = new GRT2.Cam2(cv, 0.9, 0.26, 4.6);
    cam.auto = 0.18;
    /* mini splat sprites (the CField draw language, data-driven) */
    const base = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g2 = c.getContext('2d'),
        gr = g2.createRadialGradient(32, 32, 1, 32, 32, 31);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.42, 'rgba(255,255,255,.42)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g2.fillStyle = gr;
      g2.beginPath();
      g2.arc(32, 32, 31, 0, 6.283);
      g2.fill();
      return c;
    })();
    const tints = new Map(),
      tint = (r, g2, b) => {
        const q = ((r >> 4) << 8) | ((g2 >> 4) << 4) | (b >> 4);
        let c = tints.get(q);
        if (c) return c;
        c = document.createElement('canvas');
        c.width = c.height = 64;
        const cg = c.getContext('2d');
        cg.drawImage(base, 0, 0);
        cg.globalCompositeOperation = 'source-in';
        cg.fillStyle = `rgb(${r},${g2},${b})`;
        cg.fillRect(0, 0, 64, 64);
        tints.set(q, c);
        return c;
      };
    GRT.loop(cv, (t, dt) => {
      const f = GRT.fit(cv);
      if (!f) return;
      lastT = performance.now() / 1000;
      const { g, w, h } = f;
      g.fillStyle = GRT.tok('--well');
      g.fillRect(0, 0, w, h);
      sh = sh || window.__grtBfly || null;
      pc = pc || cardData();
      cam.step(dt);
      const pr = cam.proj(),
        S = h * 0.46,
        cx = w / 2,
        cy = h * 0.5,
        px = (p) => {
          const q = pr(p);
          return [cx + q[0] * S, cy - q[1] * S, q[2]];
        };
      const stip = sh ? st || (st = sh.vol.stipple(240)) : pc && pc.st;
      if (stip) {
        for (const s of stip) {
          const p = px(s);
          g.globalAlpha = 0.05 + 0.1 * s[3];
          g.fillStyle = GRT.figPaper;
          g.fillRect(p[0], p[1], 1.2, 1.2);
        }
        g.globalAlpha = 1;
      }
      if (sh) {
        /* LIVE — the shared field the hero adopts; keeps training */
        const F = sh.field;
        if (F.iter < 1500) {
          F.step(90, t);
          F.pulse.fill(-9);
        }
        F.draw(g, px, S, t);
        if (!anim) anim = new GRT6.RayAnim(sh.vol, sh.field, 83);
        const cp = Math.cos(cam.pitch),
          eye = [
            cam.dist * cp * Math.cos(cam.yaw),
            cam.dist * Math.sin(cam.pitch),
            cam.dist * cp * Math.sin(cam.yaw),
          ];
        anim.update(t);
        if (!anim.paths.length) anim.next = Math.min(anim.next, t + 1.1);
        anim.maybeFire(t, eye);
        anim.draw(g, px, S, t, false, GRT.tok('--onwell'), GRT.figWarm, 'TRAINING RAY');
      } else if (pc) {
        /* PLACEHOLDER — pre-generated snapshot, replaced when the
           background build lands */
        g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < pc.n; i += 2) {
          const p = px([
              pc.pos[i * 3] / 2048,
              pc.pos[i * 3 + 1] / 2048,
              pc.pos[i * 3 + 2] / 2048,
            ]),
            szp = (pc.sz[i] / 1000) * p[2] * S * 0.85,
            a = pc.col[i * 4 + 3] / 255;
          if (a < 0.05 || szp <= 0) continue;
          g.globalAlpha = a;
          g.drawImage(
            tint(pc.col[i * 4], pc.col[i * 4 + 1], pc.col[i * 4 + 2]),
            p[0] - szp,
            p[1] - szp,
            szp * 2,
            szp * 2,
          );
        }
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        /* pre-generated training rays, same timing language as RayAnim */
        if (!ray || t > rayAt + ray.dur + 1.1) {
          const V = pc.rays[(Math.random() * pc.rays.length) | 0];
          ray = { V, dur: 0.7 + (V.length - 2) * 0.72 + 1.2 };
          rayAt = t;
        }
        const rt = t - rayAt,
          V = ray.V,
          conw = GRT.tok('--onwell');
        g.strokeStyle = conw;
        g.lineWidth = 1.1;
        g.globalAlpha = Math.min(1, (ray.dur - rt) / 0.7);
        g.beginPath();
        let started = false;
        for (let i = 1; i < V.length; i++) {
          const st2 = i === 1 ? 0 : 0.7 + (i - 2) * 0.72 + 0.3,
            dur = i === 1 ? 0.7 : 0.42,
            u = Math.min(1, Math.max(0, (rt - st2) / dur));
          if (u <= 0) break;
          const a2 = V[i - 1],
            b2 = V[i],
            q = px([
              a2[0] + (b2[0] - a2[0]) * u,
              a2[1] + (b2[1] - a2[1]) * u,
              a2[2] + (b2[2] - a2[2]) * u,
            ]);
          if (!started) {
            const p0 = px(a2);
            g.moveTo(p0[0], p0[1]);
            started = true;
          }
          g.lineTo(q[0], q[1]);
        }
        g.stroke();
        for (let i = 1; i < V.length; i++) {
          const en = i === 1 ? 0.7 : 0.7 + (i - 2) * 0.72 + 0.72;
          if (rt < en) break;
          const p = px(V[i]);
          g.fillStyle = conw;
          g.beginPath();
          g.arc(p[0], p[1], 1.8, 0, 6.283);
          g.fill();
        }
        if (rt > 0.7) {
          const a2 = V[0],
            b2 = V[1],
            dn = Math.hypot(b2[0] - a2[0], b2[1] - a2[1], b2[2] - a2[2]) || 1,
            k = 0.55 / dn,
            p = px([
              b2[0] + (a2[0] - b2[0]) * k,
              b2[1] + (a2[1] - b2[1]) * k,
              b2[2] + (a2[2] - b2[2]) * k,
            ]);
          g.globalAlpha = Math.min(1, (ray.dur - rt) / 0.7) * 0.6;
          g.fillStyle = conw;
          g.font = '500 8px monospace';
          g.fillText('TRAINING RAY', p[0] + 5, p[1] - 5);
        }
        g.globalAlpha = 1;
      }
      g.fillStyle = GRT.tok('--absence');
      g.font = '500 8.5px ' + GRT.tok('--mono');
      /* honest label: the snapshot is not live training */
      g.fillText(
        GRT.elide(
          g,
          sh
            ? 'THE CACHE — TRAINED LIVE IN THIS PAGE'
            : 'THE CACHE — SNAPSHOT · LIVE TRAINING STARTING',
          w - 12,
        ),
        6,
        h - 6,
      );
    });
    const chip = $('grt-chip');
    if (chip)
      setInterval(() => {
        const on = lastT && performance.now() / 1000 - lastT < 0.5;
        chip.textContent = on ? 'Running' : 'Held';
        chip.classList.toggle('run', !!on);
      }, 600);
    /* dragging the figure must not read as a click that opens the doc (cINR pattern) */
    let moved = 0,
      sx = 0,
      sy = 0;
    cv.addEventListener(
      'pointerdown',
      (e) => {
        moved = 0;
        sx = e.clientX;
        sy = e.clientY;
      },
      true,
    );
    cv.addEventListener(
      'pointermove',
      (e) => {
        if (sx) moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy));
      },
      true,
    );
    cv.addEventListener(
      'click',
      (e) => {
        if (moved > 6) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      true,
    );
  }
  function init() {
    panel($('grt-cv-panel'));
    const hero = $('grt-cv-hero');
    /* the hero's first volume rebuild is ~0.5s of density evaluation — build
   it off the first paint (the site never waits on a demo); its loop only
   draws once visible anyway */
    if (hero) {
      const build = () => {
        const R7 = new GRT7A(hero, { ui: $('grt-ro'), nEl: null });
        window.__grt = R7;
        const vb = [
          ['grt-v0', 'butterfly'],
          ['grt-v1', 'ring'],
          ['grt-v3', 'super'],
        ];
        const azw = $('grt-az') ? $('grt-az').parentElement : null;
        const azv = () => {
          if (azw) azw.style.display = R7.vol.tfr === false ? 'none' : '';
          const az2 = $('grt-az');
          if (az2) az2.value = R7.vol.tf * 6.28;
          /* the light-orbit slider exists only for the lit data volumes */
          const liw = $('grt-liw');
          if (liw) liw.style.display = R7.vol.T && R7.vol.T.lights ? '' : 'none';
          const li = $('grt-li');
          if (li) li.value = R7.vol.lightAz || 0;
        };
        for (const [id, k] of vb) {
          const el = $(id);
          if (el)
            el.onclick = () => {
              R7.setVol(k);
              azv();
              for (const [id2] of vb) $(id2).classList.toggle('on', id2 === id);
            };
        }
        azv();
        const rs = $('grt-reset');
        if (rs) rs.onclick = () => R7.resetField();
        const ob = $('grt-orbit');
        if (ob) {
          const IC = {
            /* pause bars while orbiting, play triangle while paused */
            on: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><line x1="5.6" y1="3.5" x2="5.6" y2="12.5"/><line x1="10.4" y1="3.5" x2="10.4" y2="12.5"/></g></svg>',
            off: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5.2 3.4v9.2L13 8z" fill="currentColor"/></svg>',
          };
          ob.onclick = () => {
            R7.setOrbit(!R7.orbitOn);
            const k = R7.orbitOn ? 'on' : 'off';
            ob.innerHTML = IC[k] + 'Orbit · ' + k;
          };
        }
        const az = $('grt-az');
        if (az) az.oninput = (e) => (R7.pendingAz = +e.target.value);
        const li2 = $('grt-li');
        if (li2) li2.oninput = (e) => (R7.pendingLi = +e.target.value);
      };
      const warmAll = () => {
        const rest = ['ring', 'super'];
        const one = () => {
          const k = rest.shift();
          if (!k || !window.__grt || !window.__grt.prewarm) return;
          window.__grt.prewarm(k);
          if (rest.length)
            window.requestIdleCallback
              ? requestIdleCallback(one, { timeout: 4000 })
              : setTimeout(one, 800);
        };
        window.requestIdleCallback
          ? requestIdleCallback(one, { timeout: 4000 })
          : setTimeout(one, 800);
      };
      const buildThenWarm = () => {
        /* the shared butterfly builds IN THE WORKER; the hero constructs
           only once it lands (adopting it), then the remaining volumes
           warm through the same worker — no main-thread build freezes */
        const done = () => {
          build();
          warmAll();
        };
        if (window.GRT7A && GRT7A.mkButterfly) GRT7A.mkButterfly().then(done, done);
        else done();
      };
      if (window.requestIdleCallback) requestIdleCallback(buildThenWarm, { timeout: 400 });
      else setTimeout(buildThenWarm, 50);
    }
    if ($('grt-cv-three')) new GRT8T($('grt-cv-three'));
    if ($('grt-cv-pipe')) new GRT9A($('grt-cv-pipe'));
    if ($('grt-cv-train')) new GRT9T($('grt-cv-train'));
  }
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', init) : init();
})();
