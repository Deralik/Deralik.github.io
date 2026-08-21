/* Round 8 shared — the comparison's volume + presets. */
window.GRT8 = (() => {
  const { NebVol } = GRT7;
  const KC = {
    s0: 0.038,
    sv: 0.014,
    lsMin: -4.0,
    lsMax: -1.8,
    sMul: 0.88,
    relocLs: Math.log(0.048),
  };
  const EYE = [-2.05, 0.42, 1.3];
  let _vol = null;
  function vol() {
    if (!_vol) {
      _vol = new NebVol('crab', 33);
      _vol.light = [1.3 * Math.cos(0.9), 1.05, 1.3 * Math.sin(0.9)];
      _vol.rebuild();
    }
    return _vol;
  }
  return { KC, EYE, vol };
})();
