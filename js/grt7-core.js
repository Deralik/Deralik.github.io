/* Round 7 shared — aggregator for the hero's parts: the volumes
   (js/grt-vols.js), the cache field (js/grt-field.js), plus the
   in-figure meter and camera frustum drawn here. Consumers import
   everything from window.GRT7. */
window.GRT7 = (() => {
  const { tok } = GRT;
  class Meter {
    constructor(cap) {
      this.hist = [];
      this.cap = cap || 150;
    }
    push(v) {
      this.hist.push(v);
      if (this.hist.length > this.cap) this.hist.shift();
    }
    draw(g, x, y, w, h, label, mono, fmt) {
      const H = this.hist;
      g.save();
      g.fillStyle = GRT.alpha(GRT.figPaper, 0.045);
      g.fillRect(x, y, w, h);
      g.strokeStyle = GRT.alpha(GRT.figPaper, 0.18);
      g.lineWidth = 1;
      g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      g.fillStyle = tok('--absence');
      g.font = '500 8.5px ' + mono;
      g.fillText(GRT.elide(g, label, w - 76), x + 8, y + 13);
      if (H.length > 1) {
        let mn = Infinity,
          mx = -Infinity;
        for (const v of H) {
          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }
        const pad = Math.max((mx - mn) * 0.1, 1e-3);
        mn -= pad;
        mx += pad;
        g.strokeStyle = GRT.alpha(GRT.figPaper, 0.14);
        g.beginPath();
        g.moveTo(x + 8, y + h - 6.5);
        g.lineTo(x + w - 8, y + h - 6.5);
        g.stroke();
        g.strokeStyle = tok('--accw');
        g.lineWidth = 1.2;
        g.beginPath();
        H.forEach((v, i) => {
          const xx = x + 8 + (i / (this.cap - 1)) * (w - 16),
            yy = y + h - 6 - ((v - mn) / (mx - mn)) * (h - 28);
          g[i ? 'lineTo' : 'moveTo'](xx, yy);
        });
        g.stroke();
        g.fillStyle = tok('--onwell');
        g.font = '500 11px ' + mono;
        const s = (fmt || ((v) => (v * 100).toFixed(1) + '%'))(H[H.length - 1]);
        g.fillText(s, x + w - g.measureText(s).width - 8, y + 15);
      }
      g.restore();
    }
  }
  function frustum(g, px, eye, view, amax, bmax, len, col) {
    const ep = px(eye);
    g.strokeStyle = col;
    g.lineWidth = 0.8;
    g.beginPath();
    for (const sa of [-1, 1])
      for (const sb of [-1, 1]) {
        const d = view.ray(sa * amax, sb * bmax),
          q = px([eye[0] + d[0] * len, eye[1] + d[1] * len, eye[2] + d[2] * len]);
        g.moveTo(ep[0], ep[1]);
        g.lineTo(q[0], q[1]);
      }
    g.stroke();
  }
  return { Meter, frustum, ...window.GRTVOLS, ...window.GRTFIELD };
})();
