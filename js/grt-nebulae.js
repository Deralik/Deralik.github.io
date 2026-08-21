/* Nebula density models — ports of Gaia Sky's NGC2000 volumetric nebula
   shaders (Toni Sagristà / Zentrum für Astronomie Heidelberg), themselves
   derived from Shadertoy work ("Helix Nebula" by izutionix,
   shadertoy.com/view/cdK3Wy; butterfly via view/XfyyWd).
   License: CC BY-NC-SA — credited on-page (owner acceptance 2026-08-21).
   Only the density fields are ported; rendering, lighting, and training
   are this site's own pipeline. */
window.GRTNEB = (() => {
  const nudge = 0.9,
    norm = 1 / Math.sqrt(1 + nudge * nudge);
  function spiralC(x, y, z) {
    let n = 0,
      it = 2;
    for (let i = 0; i < 8; i++) {
      n += -Math.abs(Math.sin(y * it) + Math.cos(x * it)) / it;
      let t = (x + y * nudge) * norm;
      y = (y - x * nudge) * norm;
      x = t;
      t = (x + z * nudge) * norm;
      z = (z - x * nudge) * norm;
      x = t;
      it *= 1.733733;
    }
    return n;
  }
  function h13(x, y, z) {
    x = (x * 0.1031) % 1;
    y = (y * 0.1031) % 1;
    z = (z * 0.1031) % 1;
    if (x < 0) x += 1;
    if (y < 0) y += 1;
    if (z < 0) z += 1;
    const d = x * (z + 31.32) + y * (y + 31.32) + z * (x + 31.32);
    x += d;
    y += d;
    z += d;
    const r = ((x + y) * z) % 1;
    return r < 0 ? r + 1 : r;
  }
  function vnoise(x, y, z) {
    const i = Math.floor(x),
      j = Math.floor(y),
      k = Math.floor(z);
    let fx = x - i,
      fy = y - j,
      fz = z - k;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    fz = fz * fz * (3 - 2 * fz);
    const l = (a, b, t) => a + (b - a) * t;
    const x0 = l(
      l(h13(i, j, k), h13(i + 1, j, k), fx),
      l(h13(i, j + 1, k), h13(i + 1, j + 1, k), fx),
      fy,
    );
    const x1 = l(
      l(h13(i, j, k + 1), h13(i + 1, j, k + 1), fx),
      l(h13(i, j + 1, k + 1), h13(i + 1, j + 1, k + 1), fx),
      fy,
    );
    return 1 - 0.92 * l(x0, x1, fz);
  }
  const fbm = (x, y, z) =>
    vnoise(x * 0.06125, y * 0.06125, z * 0.06125) * 0.5 +
    vnoise(x * 0.125, y * 0.125, z * 0.125) * 0.25 +
    vnoise(x * 0.25, y * 0.25, z * 0.25) * 0.125;
  const sph = (x, y, z, r) => Math.hypot(x, y, z) - r;
  const xr = (a, b) => Math.max(Math.min(a, b), -Math.max(a, b));
  function cone(x, y, z, h, r1, r2) {
    const qx = Math.hypot(x, z),
      qy = y;
    const k2x = r2 - r1,
      k2y = 2 * h,
      dk = k2x * k2x + k2y * k2y;
    const cax = qx - Math.min(qx, qy < 0 ? r1 : r2),
      cay = Math.abs(qy) - h;
    const t = Math.max(0, Math.min(1, ((r2 - qx) * k2x + (h - qy) * k2y) / dk));
    const cbx = qx - r2 + k2x * t,
      cby = qy - h + k2y * t;
    const s = cbx < 0 && cay < 0 ? -1 : 1;
    return s * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby));
  }
  function rot(p, ax, ay, az, ang) {
    const l = Math.hypot(ax, ay, az);
    ax /= l;
    ay /= l;
    az /= l;
    const c = Math.cos(ang),
      s = Math.sin(ang),
      d = p[0] * ax + p[1] * ay + p[2] * az;
    return [
      p[0] * c + (ay * p[2] - az * p[1]) * s + ax * d * (1 - c),
      p[1] * c + (az * p[0] - ax * p[2]) * s + ay * d * (1 - c),
      p[2] * c + (ax * p[1] - ay * p[0]) * s + az * d * (1 - c),
    ];
  }
  /* densities: max(0, h - map(p)), world fitted to |p|<=1 via per-kind scale */
  function butterfly(px, py, pz) {
    const S = 4.2;
    let p = rot([py * S, pz * S, px * S], -0.1, 1, -0.3, Math.PI / 3);
    const qx = p[0] * 1.6,
      qy = p[1] * 1.6,
      qz = p[2] * 1.6;
    const s1 =
      cone(qx, qy - 5.8, qz, 5, 0.05, 1.4) +
      fbm(qx * 80, (qy - 5.8) * 80, qz * 80) +
      spiralC(qx * 0.002, (qy - 5.8) * 0.002, qz * 0.002);
    const s2 =
      cone(qx, qy + 6.2, qz, -5, 0.015, 1.4) +
      fbm(qx * 80, (qy + 6.2) * 80, qz * 80) +
      spiralC(qx * 0.001, (qy + 6.2) * 0.001, qz * 0.001);
    return Math.max(0, 0.28 - (Math.abs(xr(s2, s1) * 0.45) + 0.086));
  }
  function ring(px, py, pz) {
    const S = 3.4;
    let p = rot([px * S, py * S, pz * S], 0, 0, 1, Math.PI / 3);
    p = rot(p, 0, 1, 0, Math.PI / 2);
    const q0 = Math.hypot(p[0], p[1]) - 2.2,
      q1 = p[2];
    const a = Math.pow(Math.pow(q0, 8) + Math.pow(q1, 8), 1 / 8);
    const d1 =
      Math.max(a - 1, Math.abs(p[2]) - 0.3) +
      vnoise((p[0] + 0.1) * 17, (p[1] + 0.1) * 17, (p[2] + 0.1) * 17) * 0.8;
    const d2 = Math.hypot(Math.hypot(p[0] * 1.3, p[1] * 0.9) - 2.2, p[2]);
    const neb =
      sph(p[0], p[2], p[1], 3.5) +
      fbm(p[0] * 10, p[1] * 10, p[2] * 10) +
      spiralC(p[2] * 0.415, p[0] * 0.415, p[1] * 0.415);
    const d3 = Math.abs(neb * 2.5 * 0.8) + 0.12;
    const k = 1,
      hh = Math.max(0, Math.min(1, 0.5 + (0.5 * (d2 - d1)) / k)),
      sm = d2 + (d1 - d2) * hh - k * hh * (1 - hh);
    return Math.max(0, 0.28 - xr(d3, sm));
  }
  return { butterfly, ring };
})();
