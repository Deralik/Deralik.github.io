/* 8b — three ways to hold a light field, revised: NRC = a true black box
   (rays in, radiance out). GSCache = one medium, rays routed by bounce count
   into three per-depth caches — each box plots this volume's own field at that
   depth (sharp direct crust → softer deep scatter → diffuse residue).
   GRTCache = the finished cache, a world-space object you can grab. */
(() => {
  const { rng, fit, loop, tok, cmap, star } = GRT;
  const { Cam2 } = GRT2;
  const { box } = GRT6;
  const { CField } = GRT7;
  const { KC, EYE, vol } = GRT8;
  class T8 {
    constructor(cv, o = {}) {
      this.cv = cv;
      this.rand = rng(19);
      this.frameN = 0;
      this.solo = !!o.solo;
      this.label = o.label || null;
      this.vol = vol();
      this.F = new CField(this.vol, 760, 21, KC);
      /* warm-start off the first paint: the same 200ms of training, run at idle;
   until it lands the field trains live in view — visually identical within
   a beat of load (handoff production task 6) */
      /* warm in ~45ms idle slices — one 200ms block was the page's
         second-longest first-visit task */
      let warmLeft = 200;
      const warmup = () => {
        const bt = performance.now();
        while (performance.now() - bt < 45 && warmLeft > 0) {
          this.F.step(120, 0);
          warmLeft -= 45;
        }
        this.F.pulse.fill(-9);
        if (warmLeft > 0)
          window.requestIdleCallback
            ? requestIdleCallback(warmup, { timeout: 900 })
            : setTimeout(warmup, 60);
      };
      if (window.requestIdleCallback) requestIdleCallback(warmup, { timeout: 900 });
      else setTimeout(warmup, 60);
      this.cam = new Cam2(cv, 0.9, 0.26, 4.6);
      this.cam.auto = 0.07;
      this._p3 = null;
      if (!this.solo) {
        this.cam.gate = (e) => {
          const b = cv.getBoundingClientRect(),
            mx = e.clientX - b.left;
          return !(this._p3 && mx >= this._p3);
        };
        this.st = this.vol.stipple(240);
        this.stMini = this.vol.stipple(150);
        this.c0 = new Cam2(null, 0.92, 0.3, 4.6);
        this.rays = [];
        this.nextRay = 0.6;
        this.chips = [];
        this.paths = this.mkPaths();
        this.depth = this.mkDepth();
      }
      this.rays3 = this.mkRays3();
      this.retok();
      this.warm = GRT.figWarm;
      loop(cv, (t, dt) => this.frame(t, dt));
    }
    mkPaths() {
      const r = rng(13),
        V = this.vol;
      const pick = () => {
        for (let k = 0; k < 400; k++) {
          const p = [r() * 1.3 - 0.65, r() * 1.1 - 0.55, r() * 1.3 - 0.65];
          if (
            V.sig(p[0], p[1], p[2]) > 0.09 &&
            Math.hypot(p[0] - EYE[0], p[1] - EYE[1], p[2] - EYE[2]) > 2.45
          )
            return p;
        }
        return [0.3, 0, -0.2];
      };
      const walk = (p) => {
        for (let a = 0; a < 60; a++) {
          const th = r() * 6.283,
            ph = Math.acos(2 * r() - 1),
            L = 0.42 + 0.3 * r(),
            q = [
              p[0] + Math.sin(ph) * Math.cos(th) * L,
              p[1] + Math.cos(ph) * L,
              p[2] + Math.sin(ph) * Math.sin(th) * L,
            ];
          if (V.sig(q[0], q[1], q[2]) > 0.06) return q;
        }
        return p;
      };
      const mk = (n) => {
        const a = [EYE.slice()];
        let p = pick();
        a.push(p);
        for (let i = 1; i < n; i++) {
          p = walk(p);
          a.push(p);
        }
        return a;
      };
      return [mk(1), mk(2), mk(4)];
    }
    mkRays3() {
      const r = rng(47),
        V = this.vol,
        out = [];
      const walk = (p) => {
        for (let a = 0; a < 40; a++) {
          const th = r() * 6.283,
            ph = Math.acos(2 * r() - 1),
            L = 0.26 + 0.32 * r(),
            q = [
              p[0] + Math.sin(ph) * Math.cos(th) * L,
              p[1] + Math.cos(ph) * L,
              p[2] + Math.sin(ph) * Math.sin(th) * L,
            ];
          if (V.sig(q[0], q[1], q[2]) > 0.06) return q;
        }
        return p;
      };
      for (let i = 0; i < 4; i++) {
        const th = r() * 6.283,
          o = [2.2 * Math.cos(th), 0.4 + 0.5 * r(), 2.2 * Math.sin(th)],
          V0 = [o];
        let p = null;
        for (let k = 0; k < 220; k++) {
          const tt = 0.5 + k * 0.03;
          const q = [
            o[0] + ((0 - o[0]) * tt) / 2.4,
            o[1] + ((0.05 - o[1]) * tt) / 2.4,
            o[2] + ((0 - o[2]) * tt) / 2.4,
          ];
          if (
            Math.abs(q[0]) < 1 &&
            Math.abs(q[1]) < 1 &&
            Math.abs(q[2]) < 1 &&
            V.sig(q[0], q[1], q[2]) > 0.08 &&
            r() < 0.4
          ) {
            p = q;
            break;
          }
        }
        if (!p) continue;
        V0.push(p);
        const nb = 1 + ((r() * 2.4) | 0);
        for (let k2 = 0; k2 < nb; k2++) {
          p = walk(p);
          V0.push(p);
        }
        out.push({ V: V0, t0: 1.2 + i * 2.3 });
      }
      return out;
    }
    mkDepth() {
      const r = rng(29),
        V = this.vol,
        pts = V.samples(250),
        out = [[], [], []];
      const avg = (p, rad, m, sc) => {
        let cr = 0,
          cg = 0,
          cb = 0;
        for (let k = 0; k < m; k++) {
          const c = V.gtc([
            p[0] + (r() * 2 - 1) * rad,
            p[1] + (r() * 2 - 1) * rad,
            p[2] + (r() * 2 - 1) * rad,
          ]);
          cr += c[0];
          cg += c[1];
          cb += c[2];
        }
        return [(cr / m) * sc, (cg / m) * sc, (cb / m) * sc];
      };
      for (const p of pts) {
        out[0].push({ p, c: V.gtc(p), s: 1.7 });
        out[1].push({ p, c: avg(p, 0.17, 5, 0.55), s: 2.6 });
        out[2].push({ p, c: avg(p, 0.36, 5, 0.32), s: 3.6 });
      }
      return out;
    }
    retok() {
      this.cw = tok('--well');
      this.cab = tok('--absence');
      this.conw = tok('--onwell');
      this.cacc = tok('--accw');
      this.mono = tok('--mono');
    }
    frame(t, dt) {
      const f = fit(this.cv);
      if (!f) return;
      this.retok();
      const { g, w, h } = f;
      this.frameN++;
      this.lastT = t;
      const F = this.F;
      this.cam.step(dt);
      if (F.iter < 900) {
        F.step(60, t);
        F.step(60, t);
        F.pulse.fill(-9);
      }
      if (this.solo) {
        g.clearRect(0, 0, w, h);
        this.ours(g, 0, w, h, t);
        return;
      }
      g.fillStyle = this.cw;
      g.fillRect(0, 0, w, h);
      const gap = 10,
        pw = (w - 2 * gap) / 3;
      this._p3 = 2 * (pw + gap);
      g.fillStyle = GRT.alpha(GRT.figPaper, 0.18);
      g.fillRect(pw + gap / 2, 0, 1, h);
      g.fillRect(2 * pw + gap * 1.5, 0, 1, h);
      this.nrc(g, 0, pw, h, t);
      this.gsc(g, pw + gap, pw, h, t);
      this.ours(g, 2 * (pw + gap), pw, h, t);
    }
    nrc(g, x0, pw, h, t) {
      g.save();
      g.beginPath();
      g.rect(x0, 0, pw, h);
      g.clip();
      const bw = pw * 0.36,
        bh = h * 0.3,
        bx = x0 + pw / 2 - bw / 2,
        by = h / 2 - bh / 2;
      if (t > this.nextRay) {
        this.rays.push({
          y: h * (0.3 + 0.4 * this.rand()),
          born: t,
          v: 0.2 + 0.65 * this.rand(),
        });
        this.nextRay = t + 0.9 + this.rand() * 0.8;
      }
      this.rays = this.rays.filter((r) => t - r.born < 1.9);
      for (const r of this.rays) {
        const u = Math.min(1, (t - r.born) / 0.7);
        g.strokeStyle = this.conw;
        g.globalAlpha = Math.min(1, (1.9 - (t - r.born)) / 0.4);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x0 + 12, r.y);
        const ex = x0 + 12 + (bx - x0 - 12) * u,
          ey = r.y + (h / 2 - r.y) * u * 0.9;
        g.lineTo(ex, ey);
        g.stroke();
        g.fillStyle = this.conw;
        g.beginPath();
        g.arc(ex, ey, 1.7, 0, 6.283);
        g.fill();
        g.globalAlpha = 1;
        if (u >= 1) {
          const uo = (t - r.born - 0.7) / 0.6;
          if (uo > 0 && uo < 1) {
            const c = cmap(r.v);
            g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
            g.globalAlpha = 1 - uo;
            g.fillRect(bx + bw + 12 + 34 * uo, h / 2 - 5, 9, 9);
            g.globalAlpha = 1;
          }
        }
      }
      g.fillStyle = GRT.figWell;
      g.fillRect(bx, by, bw, bh);
      g.strokeStyle = GRT.alpha(GRT.figPaper, 0.45);
      g.lineWidth = 1;
      g.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      g.fillStyle = this.cab;
      g.font = '500 11px ' + this.mono;
      g.fillText('MLP', bx + bw / 2 - 12, by + bh / 2 + 4);
      g.font = '500 8.5px ' + this.mono;
      g.fillText('RAYS IN', x0 + 12, h * 0.24);
      g.fillText('RADIANCE OUT', bx + bw + 12, h / 2 - 12);
      g.fillText(GRT.elide(g, 'NRC — QUERIABLE, BUT A BLACK BOX', pw - 12), x0 + 6, h - 6);
      g.restore();
    }
    gsc(g, x0, pw, h, t) {
      g.save();
      g.beginPath();
      g.rect(x0, 0, pw, h);
      g.clip();
      const pr = this.c0.proj(),
        S = h * 0.25,
        cx = x0 + pw * 0.5,
        cy = h * 0.29,
        px = (p) => {
          const q = pr(p);
          return [cx + q[0] * S, cy - q[1] * S, q[2]];
        };
      const cam0 = [x0 + pw * 0.5, 46];
      for (const s of this.stMini) {
        const p = px(s);
        g.globalAlpha = 0.05 + 0.11 * s[3];
        g.fillStyle = GRT.figPaper;
        g.fillRect(p[0], p[1], 1.2, 1.2);
      }
      g.globalAlpha = 1;
      /* three skewed windows across the lower half — cropped views INTO each cache.
   slant edges are parallel, so the visible gap = LX step − lw */
      const sk = 14,
        gp = 8,
        lw = (pw - 40 - 2 * sk - 2 * gp) / 3,
        lh = h * 0.4,
        names = ['CACHE 1', 'CACHE 2', 'CACHE 3'],
        bounce = ['1 BOUNCE', '2 BOUNCES', '3+ BOUNCES'];
      const LX = (k) => x0 + 20 + sk + k * (lw + gp),
        LY = h * 0.5;
      const T = 10.5,
        slot = 3.5,
        act = Math.min(2, ((t % T) / slot) | 0),
        ph = ((t % T) - act * slot) / slot;
      for (let k = 0; k < 3; k++) {
        const lx = LX(k),
          ly = LY,
          pulse = k === act && ph > 0.55 ? Math.max(0, 1 - (ph - 0.55) / 0.45) : 0;
        g.save();
        g.beginPath();
        g.moveTo(lx + sk, ly);
        g.lineTo(lx + lw + sk, ly);
        g.lineTo(lx + lw - sk, ly + lh);
        g.lineTo(lx - sk, ly + lh);
        g.closePath();
        g.clip();
        g.fillStyle = GRT.figWell;
        g.fill();
        g.globalCompositeOperation = 'lighter';
        const S2 = lh * 0.72,
          cx2 = lx + lw / 2,
          cy2 = ly + lh / 2;
        for (const pt of this.depth[k]) {
          const q = pr(pt.p),
            sx = cx2 + q[0] * S2,
            sy = cy2 - q[1] * S2,
            lu = (pt.c[0] + pt.c[1] + pt.c[2]) / 3;
          if (lu < 0.02) continue;
          g.globalAlpha = Math.min(0.9, lu * (k === 0 ? 1.6 : k === 1 ? 1.9 : 2.2));
          g.fillStyle = `rgb(${(pt.c[0] * 255) | 0},${(pt.c[1] * 255) | 0},${(pt.c[2] * 255) | 0})`;
          const sz = pt.s * 1.5;
          g.fillRect(sx - sz / 2, sy - sz / 2, sz, sz);
        }
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        g.restore();
        g.strokeStyle = pulse > 0 ? this.cacc : GRT.alpha(GRT.figPaper, 0.35);
        g.globalAlpha = pulse > 0 ? 0.4 + 0.6 * pulse : 1;
        g.lineWidth = pulse > 0 ? 1.4 : 1;
        g.beginPath();
        g.moveTo(lx + sk, ly);
        g.lineTo(lx + lw + sk, ly);
        g.lineTo(lx + lw - sk, ly + lh);
        g.lineTo(lx - sk, ly + lh);
        g.closePath();
        g.stroke();
        g.globalAlpha = 1;
        g.fillStyle = this.cab;
        g.font = '500 8.5px ' + this.mono;
        g.fillText(names[k], lx + sk + 2, ly - 5);
        g.fillText(bounce[k], lx - sk + 2, ly + lh + 13);
      }
      for (let k = 0; k < 3; k++) {
        const P = this.paths[k],
          active = k === act,
          drawU = active ? Math.min(1, ph / 0.5) : 1;
        g.globalAlpha = active ? 1 : 0.22;
        g.strokeStyle = this.conw;
        g.lineWidth = active ? 1.3 : 1;
        const nseg = P.length - 1;
        g.beginPath();
        g.moveTo(cam0[0], cam0[1]);
        for (let i = 1; i < P.length; i++) {
          const su = Math.min(1, Math.max(0, drawU * nseg - (i - 1)));
          if (su <= 0) break;
          if (i === 1) {
            const pb = px(P[1]);
            g.lineTo(cam0[0] + (pb[0] - cam0[0]) * su, cam0[1] + (pb[1] - cam0[1]) * su);
          } else {
            const a = P[i - 1],
              b = P[i],
              q = px([
                a[0] + (b[0] - a[0]) * su,
                a[1] + (b[1] - a[1]) * su,
                a[2] + (b[2] - a[2]) * su,
              ]);
            g.lineTo(q[0], q[1]);
          }
        }
        g.stroke();
        for (let i = 1; i < P.length; i++) {
          if (drawU * nseg < i) break;
          const q = px(P[i]);
          g.fillStyle = this.conw;
          g.beginPath();
          g.arc(q[0], q[1], active ? 2 : 1.5, 0, 6.283);
          g.fill();
        }
        const term = px(P[P.length - 1]),
          tx = LX(k) + lw / 2,
          ty = LY + lh * 0.35,
          au = active ? (ph < 0.5 ? 0 : Math.min(1, (ph - 0.5) / 0.22)) : 1;
        if (au > 0) {
          g.setLineDash([3, 4]);
          g.strokeStyle = active ? this.cacc : GRT.alpha(GRT.figPaper, 0.3);
          g.lineWidth = active ? 1.2 : 0.8;
          g.beginPath();
          g.moveTo(term[0], term[1]);
          g.lineTo(term[0] + (tx - term[0]) * au, term[1] + (ty - term[1]) * au);
          g.stroke();
          g.setLineDash([]);
          if (au >= 1) {
            const an = Math.atan2(ty - term[1], tx - term[0]);
            g.beginPath();
            g.moveTo(tx, ty);
            g.lineTo(tx - 7 * Math.cos(an - 0.4), ty - 7 * Math.sin(an - 0.4));
            g.moveTo(tx, ty);
            g.lineTo(tx - 7 * Math.cos(an + 0.4), ty - 7 * Math.sin(an + 0.4));
            g.stroke();
          }
          if (active && au > 0 && au < 1) {
            g.fillStyle = this.cacc;
            const mx2 = term[0] + (tx - term[0]) * au,
              my2 = term[1] + (ty - term[1]) * au;
            g.fillRect(mx2 - 2, my2 - 2, 4, 4);
          }
        }
        g.globalAlpha = 1;
      }
      const ep = cam0;
      g.strokeStyle = this.conw;
      g.lineWidth = 1.2;
      g.strokeRect(ep[0] - 4, ep[1] - 4, 8, 8);
      g.fillStyle = this.cab;
      g.font = '500 8.5px ' + this.mono;
      g.fillText('CAMERA', ep[0] + 10, ep[1] + 3);
      g.fillText(
        GRT.elide(g, 'GSCACHE — ISOLATED BASED ON PATH LENGTH', pw - 12),
        x0 + 6,
        h - 6,
      );
      g.restore();
    }
    ours(g, x0, pw, h, t) {
      g.save();
      g.beginPath();
      g.rect(x0, 0, pw, h);
      g.clip();
      const pr = this.cam.proj(),
        S = h * 0.52,
        cx = x0 + pw / 2,
        cy = h * 0.5,
        px = (p) => {
          const q = pr(p);
          return [cx + q[0] * S, cy - q[1] * S, q[2]];
        };
      this.F.draw(g, px, S, t);
      /* rays enter, scatter, and terminate INTO the cache — purple end square */
      const T = 9.2;
      for (const R of this.rays3) {
        const lt = (t - R.t0) % T,
          V = R.V;
        if (lt < 0) continue;
        const segs = V.length - 1,
          dur = 0.55,
          total = segs * dur + 1.6;
        if (lt > total) continue;
        g.globalAlpha = Math.min(1, (total - lt) / 0.6);
        g.strokeStyle = this.conw;
        g.lineWidth = 1.15;
        g.beginPath();
        let st = false;
        for (let i = 1; i < V.length; i++) {
          const s0 = (i - 1) * dur,
            u = Math.min(1, Math.max(0, (lt - s0) / dur));
          if (u <= 0) break;
          const a = V[i - 1],
            b = V[i],
            q = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
          const pa = px(a),
            pb = px(q);
          if (!st) {
            g.moveTo(pa[0], pa[1]);
            st = true;
          }
          g.lineTo(pb[0], pb[1]);
        }
        g.stroke();
        for (let i = 1; i < V.length - 1; i++) {
          if (lt < i * dur) break;
          const q = px(V[i]);
          g.fillStyle = this.conw;
          g.beginPath();
          g.arc(q[0], q[1], 1.8, 0, 6.283);
          g.fill();
        }
        if (lt >= segs * dur) {
          const q = px(V[V.length - 1]),
            gl = Math.min(1, (lt - segs * dur) / 0.4);
          g.fillStyle = this.cacc;
          g.globalAlpha = Math.min(1, (total - lt) / 0.6) * gl;
          g.fillRect(q[0] - 2.5, q[1] - 2.5, 5, 5);
          g.strokeStyle = this.cacc;
          g.lineWidth = 1;
          g.beginPath();
          g.arc(q[0], q[1], 4.5 + 2 * (1 - gl), 0, 6.283);
          g.stroke();
        }
        g.globalAlpha = 1;
      }
      g.fillStyle = this.cab;
      g.font = '500 8.5px ' + this.mono;
      g.fillText(
        GRT.elide(g, this.label || 'GRTCACHE (OURS) — UNIFIED & MODIFIABLE', pw - 12),
        x0 + 6,
        h - 6,
      );
      g.restore();
    }
  }
  window.GRT8T = T8;
})();
