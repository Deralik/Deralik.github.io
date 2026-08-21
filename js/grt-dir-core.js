/* GRT direction round — shared helpers: rng, canvas fit, raf loop, tokens, colormap, orbit cam, procedural volume. */
window.GRT = (() => {
  const rng = (s) => () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; /* privacy-ok: 2^32 rng divisor */
  };
  function fit(cv) {
    const d = Math.min(2, window.devicePixelRatio || 1);
    const r = cv.getBoundingClientRect();
    if (!r.width) return null;
    const w = Math.round(r.width * d),
      h = Math.round(r.height * d);
    if (cv.width !== w || cv.height !== h) {
      cv.width = w;
      cv.height = h;
    }
    const g = cv.getContext('2d');
    g.setTransform(d, 0, 0, d, 0, 0);
    return { g, w: r.width, h: r.height };
  }
  /* prefers-reduced-motion: figures paint (and finish their idle warm-start),
   then hold still; direct engagement — pointer over or down — animates,
   because reader-driven motion is the reader's choice. */
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  function loop(el, fn) {
    let on = true,
      frac = 1,
      fc = 0,
      lastMeasure = 0,
      lastRun = performance.now(),
      eng = false;
    const io = new IntersectionObserver(
      (e) => {
        on = e[0].isIntersecting;
      },
      { rootMargin: '150px' },
    );
    io.observe(el);
    if (RMQ.matches || RMQ.addEventListener) {
      el.addEventListener('pointerenter', () => (eng = true));
      el.addEventListener('pointerleave', () => (eng = false));
      el.addEventListener('pointerdown', () => (eng = true));
    }
    function f(t) {
      /* a canvas on a hidden face (opacity 0) computes for nobody — the GRT hero
   must not burn CPU while its doc face sits invisible at depth 0 */
      const face = el._face || (el._face = el.closest('.face'));
      const hid = face && getComputedStyle(face).opacity === '0';
      const still = (RMQ.matches && t > 2600 && !eng) || window.__morph || hid;
      if (on && !still) {
        if (t - lastMeasure > 800) {
          const r = el.getBoundingClientRect();
          frac = r.width < 130 ? 4 : r.width < 270 ? 2 : 1;
          lastMeasure = t;
        }
        if (fc++ % frac === 0) {
          const dt = Math.min(0.08, (t - lastRun) / 1000);
          lastRun = t;
          fn(t / 1000, dt);
        }
      } else lastRun = t;
      requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  const tok = (n) =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
  /* figure registers — values live in skeleton-tokens.css, read once (they are
   deliberately theme-independent) */
  const figWell = tok('--render-well'),
    figPaper = tok('--render-paper'),
    figWarm = tok('--ray-warm');
  /* rgba from a token hex — no colour literal needs to live in a JS file */
  function alpha(hex, a) {
    const h = hex.replace('#', ''),
      x =
        h.length === 3
          ? h
              .split('')
              .map((c) => c + c)
              .join('')
          : h;
    return (
      'rgba(' +
      parseInt(x.slice(0, 2), 16) +
      ',' +
      parseInt(x.slice(2, 4), 16) +
      ',' +
      parseInt(x.slice(4, 6), 16) +
      ',' +
      a +
      ')'
    );
  }
  /* canvas labels elide by dropping trailing " · " segments, never mid-word */
  function elide(g, txt, maxw) {
    if (g.measureText(txt).width <= maxw) return txt;
    const seg = txt.split(' · ');
    while (seg.length > 1) {
      seg.pop();
      const t = seg.join(' · ');
      if (g.measureText(t).width <= maxw) return t;
    }
    let t = seg[0];
    while (t.length > 4 && g.measureText(t + '…').width > maxw) t = t.slice(0, -1);
    return t + '…';
  }
  /* radiance colormap: well-black → deep teal → pa-2 teal → warm amber → near-white */
  const stops = [
    [0, 8, 11, 15],
    [0.3, 22, 72, 95],
    [0.55, 30, 111, 140],
    [0.78, 224, 150, 84],
    [1, 255, 241, 218],
  ];
  const LUT = new Uint8Array(257 * 3);
  for (let i = 0; i <= 256; i++) {
    const t = i / 256;
    let a = stops[0],
      b = stops[stops.length - 1];
    for (let k = 0; k < stops.length - 1; k++)
      if (t >= stops[k][0] && t <= stops[k + 1][0]) {
        a = stops[k];
        b = stops[k + 1];
        break;
      }
    const u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
    for (let c = 0; c < 3; c++) LUT[i * 3 + c] = (a[c + 1] + (b[c + 1] - a[c + 1]) * u) | 0;
  }
  const cmap = (t) => {
    const i = Math.max(0, Math.min(256, (t * 256) | 0)) * 3;
    return [LUT[i], LUT[i + 1], LUT[i + 2]];
  };
  const css = (t) => {
    const c = cmap(t);
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  class Cam {
    constructor(cv, yaw, pitch, dist) {
      this.yaw = yaw;
      this.pitch = pitch;
      this.dist = dist;
      this.auto = 0.05;
      if (cv) {
        let px,
          py,
          dr = false;
        cv.addEventListener('pointerdown', (e) => {
          dr = true;
          px = e.clientX;
          py = e.clientY;
          this.auto = 0;
          cv.setPointerCapture(e.pointerId);
        });
        cv.addEventListener('pointermove', (e) => {
          if (!dr) return;
          this.yaw += (e.clientX - px) * 0.008;
          this.pitch = Math.max(-1.15, Math.min(1.15, this.pitch + (e.clientY - py) * 0.006));
          px = e.clientX;
          py = e.clientY;
        });
        cv.addEventListener('pointerup', () => (dr = false));
      }
    }
    proj() {
      const cy = Math.cos(this.yaw),
        sy = Math.sin(this.yaw),
        cp = Math.cos(this.pitch),
        sp = Math.sin(this.pitch),
        D = this.dist;
      return (p) => {
        const x = p[0] * cy + p[2] * sy,
          z0 = -p[0] * sy + p[2] * cy,
          y = p[1] * cp - z0 * sp,
          z = p[1] * sp + z0 * cp + D,
          s = 1.85 / z;
        return [x * s, y * s, s, z];
      };
    }
  }
  function star(g, x, y, r, col) {
    g.strokeStyle = col;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x - r, y);
    g.lineTo(x + r, y);
    g.moveTo(x, y - r);
    g.lineTo(x, y + r);
    g.moveTo(x - r * 0.6, y - r * 0.6);
    g.lineTo(x + r * 0.6, y + r * 0.6);
    g.moveTo(x - r * 0.6, y + r * 0.6);
    g.lineTo(x + r * 0.6, y - r * 0.6);
    g.stroke();
    g.fillStyle = col;
    g.beginPath();
    g.arc(x, y, 2.2, 0, 6.283);
    g.fill();
  }
  return {
    rng,
    fit,
    loop,
    tok,
    cmap,
    css,
    Cam,
    star,
    elide,
    alpha,
    figWell,
    figPaper,
    figWarm,
  };
})();
