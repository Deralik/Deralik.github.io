/* Round 6 shared — CamView: a splat renderer from the fixed in-scene camera.
   Projects gaussians (or truth points) through a lookAt basis onto a small
   offscreen image: "exactly what the camera sees", cheap enough per frame. */
window.GRT6 = (() => {
  const norm = (v) => {
    const n = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / n, v[1] / n, v[2] / n];
  };
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  class CamView {
    constructor(eye, f) {
      this.f = f || 1.05;
      this.setEye(eye);
    }
    setEye(eye) {
      this.eye = eye;
      this.fwd = norm([-eye[0], -eye[1], -eye[2]]);
      this.right = norm(cross(this.fwd, [0, 1, 0]));
      this.up = cross(this.right, this.fwd);
    }
    proj(p) {
      const e = this.eye,
        rel = [p[0] - e[0], p[1] - e[1], p[2] - e[2]],
        z = rel[0] * this.fwd[0] + rel[1] * this.fwd[1] + rel[2] * this.fwd[2];
      if (z < 0.2) return null;
      return [
        (rel[0] * this.right[0] + rel[1] * this.right[1] + rel[2] * this.right[2]) / z,
        (rel[0] * this.up[0] + rel[1] * this.up[1] + rel[2] * this.up[2]) / z,
        1 / z,
      ];
    }
    ray(a, b) {
      const d = [
        this.fwd[0] + (a / this.f) * this.right[0] + (b / this.f) * this.up[0],
        this.fwd[1] + (a / this.f) * this.right[1] + (b / this.f) * this.up[1],
        this.fwd[2] + (a / this.f) * this.right[2] + (b / this.f) * this.up[2],
      ];
      return norm(d);
    }
  }
  function box(g, px, he) {
    const hx = he ? he[0] : 1,
      hy = he ? he[1] : 1,
      hz = he ? he[2] : 1;
    g.strokeStyle = GRT.alpha(GRT.figPaper, 0.12);
    g.lineWidth = 1;
    const CC = [-1, 1];
    g.beginPath();
    for (const a of CC)
      for (const b of CC) {
        let p1 = px([a * hx, b * hy, -hz]),
          p2 = px([a * hx, b * hy, hz]);
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        p1 = px([a * hx, -hy, b * hz]);
        p2 = px([a * hx, hy, b * hz]);
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        p1 = px([-hx, a * hy, b * hz]);
        p2 = px([hx, a * hy, b * hz]);
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
      }
    g.stroke();
  }
  /* RayAnim — auto training rays: walk, NEE, vertex micro-training, and
   intersect-time highlighting of every gaussian the ray crosses. */
  class RayAnim {
    constructor(vol, F, seed) {
      this.vol = vol;
      this.F = F;
      this.rand = GRT.rng(seed || 81);
      this.paths = [];
      this.nees = [];
      this.stats = '';
      this.next = 1.5;
    }
    rdir() {
      const th = this.rand() * 6.283,
        ph = Math.acos(2 * this.rand() - 1);
      return [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    }
    maybeFire(t, eye) {
      if (this.paths.length || t < this.next) return;
      this.fire(t, eye);
      this.next = t + 4 + this.rand() * 2;
    }
    fire(t0, eye) {
      let tg = null;
      for (let k = 0; k < 40; k++) {
        const c = [
          (this.rand() * 2 - 1) * 0.6,
          (this.rand() * 2 - 1) * 0.55,
          (this.rand() * 2 - 1) * 0.6,
        ];
        if (this.vol.sig(c[0], c[1], c[2]) > 0.08) {
          tg = c;
          break;
        }
      }
      if (!tg) return;
      let d = [tg[0] - eye[0], tg[1] - eye[1], tg[2] - eye[2]];
      const n = Math.hypot(d[0], d[1], d[2]);
      d = [d[0] / n, d[1] / n, d[2] / n];
      let pS = null;
      for (let k = 0; k < 120; k++) {
        const tt = 0.4 + k * 0.04,
          p = [eye[0] + d[0] * tt, eye[1] + d[1] * tt, eye[2] + d[2] * tt];
        if (tt > 5.8) break;
        if (
          Math.abs(p[0]) < 1 &&
          Math.abs(p[1]) < 1 &&
          Math.abs(p[2]) < 1 &&
          this.vol.sig(p[0], p[1], p[2]) > 0.09 &&
          this.rand() < 0.5
        ) {
          pS = p;
          break;
        }
      }
      if (!pS) return;
      const V = [eye.slice(), pS];
      let p = pS;
      const nb = 3 + ((this.rand() * 3) | 0);
      for (let k = 0; k < nb; k++) {
        let q = null;
        for (let a = 0; a < 8; a++) {
          const dd = this.rdir(),
            L = 0.26 + 0.4 * this.rand(),
            c2 = [p[0] + dd[0] * L, p[1] + dd[1] * L, p[2] + dd[2] * L];
          if (this.vol.sig(c2[0], c2[1], c2[2]) > 0.06) {
            q = c2;
            break;
          }
        }
        if (!q) break;
        V.push(q);
        p = q;
      }
      const segStart = [],
        reach = [t0],
        cum = [0];
      for (let i = 1; i < V.length; i++) {
        const st = reach[i - 1] + (i > 1 ? 0.3 : 0),
          dur = i === 1 ? 0.7 : 0.42;
        segStart.push(st);
        reach.push(st + dur);
        cum.push(
          cum[i - 1] +
            Math.hypot(V[i][0] - V[i - 1][0], V[i][1] - V[i - 1][1], V[i][2] - V[i - 1][2]),
        );
      }
      this.paths.push({
        V,
        segStart,
        reach,
        cum,
        evI: 1,
        upd: new Set(),
        microAt: 0,
        fEnd: reach[reach.length - 1] + 1.6,
        done: false,
      });
    }
    front(P, t) {
      for (let i = 1; i < P.V.length; i++) {
        const st = P.segStart[i - 1],
          en = P.reach[i];
        if (t < st) return null;
        if (t < en) {
          const u = (t - st) / (en - st),
            a = P.V[i - 1],
            b = P.V[i];
          return {
            q: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u],
            cum: P.cum[i - 1] + (P.cum[i] - P.cum[i - 1]) * u,
          };
        }
      }
      return { q: P.V[P.V.length - 1].slice(), cum: P.cum[P.cum.length - 1] };
    }
    update(t) {
      const F = this.F;
      this.paths = this.paths.filter((P) => t < P.fEnd);
      if (this.eyeRef) {
        const e = this.eyeRef();
        for (const P of this.paths) P.V[0] = e;
      }
      for (const P of this.paths) {
        while (P.evI < P.reach.length && t >= P.reach[P.evI]) {
          const v = P.V[P.evI];
          this.nees.push({ v, t0: t });
          F.micro(v, t, P.upd);
          P.evI++;
        }
        const fr = this.front(P, t);
        if (fr)
          for (let i = 0; i < F.N; i++) {
            if (P.upd.has(i)) continue;
            const s = Math.exp(F.ls[i]),
              thr = Math.max(0.1, 1.5 * s),
              d2 =
                (F.gx[i] - fr.q[0]) ** 2 + (F.gy[i] - fr.q[1]) ** 2 + (F.gz[i] - fr.q[2]) ** 2;
            if (d2 < thr * thr) {
              P.upd.add(i);
              F.pulse[i] = t;
              if (fr.cum - P.microAt > 0.1) {
                F.micro(fr.q, t, P.upd);
                P.microAt = fr.cum;
              }
            }
          }
        if (t > P.reach[P.reach.length - 1] && !P.done) {
          P.done = true;
          const ns = P.V.length - 1;
          this.stats =
            'LAST TRAINING RAY · ' +
            ns +
            (ns === 1 ? ' SCATTER' : ' SCATTERS') +
            ' · ' +
            P.upd.size +
            ' GAUSSIANS TOUCHED';
        }
      }
      this.nees = this.nees.filter((n) => t - n.t0 < 1.1);
    }
    draw(g, px, S, t, detail, conw, cacc, label) {
      const F = this.F;
      for (const P of this.paths) {
        g.globalAlpha = Math.min(1, (P.fEnd - t) / 0.7);
        g.strokeStyle = conw;
        g.lineWidth = 1.1;
        g.beginPath();
        let started = false;
        for (let i = 1; i < P.V.length; i++) {
          const st = P.segStart[i - 1],
            en = P.reach[i];
          if (t < st) break;
          const u = Math.min(1, (t - st) / (en - st)),
            a = P.V[i - 1],
            b = P.V[i],
            q = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
          const p1 = px(a),
            p2 = px(q);
          if (!started) {
            g.moveTo(p1[0], p1[1]);
            started = true;
          }
          g.lineTo(p2[0], p2[1]);
        }
        g.stroke();
        for (let i = 1; i < P.V.length; i++) {
          if (t < P.reach[i]) break;
          const p = px(P.V[i]);
          g.fillStyle = conw;
          g.beginPath();
          g.arc(p[0], p[1], 1.8, 0, 6.283);
          g.fill();
        }
        const fr = this.front(P, t);
        if (fr && t < P.reach[P.reach.length - 1]) {
          const p = px(fr.q);
          g.fillStyle = cacc;
          g.beginPath();
          g.arc(p[0], p[1], 2.4, 0, 6.283);
          g.fill();
        }
        if (label && P.V.length > 1 && t > P.reach[1]) {
          const p = px(P.V[1]);
          g.globalAlpha = Math.min(1, (P.fEnd - t) / 0.7) * 0.6;
          g.fillStyle = conw;
          g.font = '500 8px monospace';
          g.fillText(label, p[0] + 6, p[1] + 10);
          g.globalAlpha = Math.min(1, (P.fEnd - t) / 0.7);
        }
        if (detail) {
          g.globalAlpha = Math.min(1, (P.fEnd - t) / 0.7) * 0.75;
          for (const gi of P.upd) {
            const p = px([F.gx[gi], F.gy[gi], F.gz[gi]]),
              sz = Math.exp(F.ls[gi]) * p[2] * S;
            g.strokeStyle = cacc;
            g.lineWidth = 1;
            g.beginPath();
            g.arc(p[0], p[1], sz + 2.5, 0, 6.283);
            g.stroke();
          }
        }
        g.globalAlpha = 1;
      }
    }
    drawNees(g, px, light, t, warm) {
      for (const n2 of this.nees) {
        const a = 1 - (t - n2.t0) / 1.1,
          p1 = px(n2.v),
          p2 = px(light);
        g.strokeStyle = warm;
        g.globalAlpha = 0.5 * Math.max(0, a);
        g.lineWidth = 0.8;
        g.beginPath();
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        g.stroke();
        g.globalAlpha = 1;
      }
    }
  }
  return { CamView, box, RayAnim };
})();
