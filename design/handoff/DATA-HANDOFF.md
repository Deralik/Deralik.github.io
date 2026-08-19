# GRTCache demo — real-data handoff

Goal: replace/augment the procedural demo volumes with one real dataset,
converted offline (browser can't fetch these hosts) into a small file this
repo can load. Target format, either:

- **Quantized JS module** (preferred; see `explorations/grt-stars-data.js`
  for the pattern): `window.GRT_<NAME> = {dims|n, base64 arrays}` + a header
  comment stating source, fetch date, license, quantization. ≤ ~300 KB.
- **Raw grid**: uint8, ≤48³ (or 64³ max), row-major x-fastest, one file per
  channel or scalar density only. The demo colors scalar grids via a TF.

Loader hook: `RawVol` in `explorations/grt7-core.js` (scalar grids) or a
`NebVol` subclass with `grid` (RGB, see `StarVol.rebuild` for the pattern).

## Demo rendering pipeline — REVIEW CRITICALLY before the real build

The exploration hero (7a) fakes the with/without comparison in ways that must
NOT survive into the site build with cc:

- Both sides render at "4 spp" from the same low-res march of the truth grid,
  but the noise is synthetic (mean of 4 exponential samples multiplying the
  full integral) — not a real estimator of the transport.
- The with-cache side is the truth march with variance cut to 15% amplitude
  and a 30% blend toward the cache's tone-calibrated low-res image as a bias
  term (so cache error shows softly and fades with training). The 0.85/0.15
  and 0.3 factors and the calibration are hand-tuned mock values — and the
  governing rule they approximate: the final image never shows gaussians;
  the cache changes convergence speed and residual bias only.
- For the real demo: implement an actual 4 spp path tracer of the demo volume
  and an actual cache-assisted integrator (terminate into the trained cache
  after the first scatter), share one tone-mapping, and let the difference be
  whatever it truly is. If the honest gap is small, show the small gap.

## Candidates, in order of preference



1. **Gaia Sky NGC2000 nebulae pack** — 47 nebulae, some volumetric.
   https://gaiasky.space/resources/datasets/ (tar.gz of app-specific
   descriptors; host has no CORS). Process: download, extract, find the
   volumetric nebulae (Helix/Crab analogues), resample to ≤64³, check the
   pack's license file before committing anything.
2. **Open SciVis Datasets** — https://klacansky.com/open-scivis-datasets/
   Scalar volumes with stated provenance; direct .raw URLs but CORS-blocked,
   so download offline. Good picks: `supernova` (432³, structured shells),
   `csafe_heptane` (302³, fire plume), `smoke`/`plume` sets. Downsample by
   striding (see the fetch code in grt7-core's RawVol). Check per-dataset
   citation requirements.
3. **OpenVDB sample volumes** — https://www.openvdb.org/download/ (cloud,
   smoke, explosion VDBs; MPL-2.0). Needs a VDB reader (Python `pyopenvdb`
   or Blender) to bake to a dense grid, then quantize.
4. **JangaFX free VDB samples** — https://jangafx.com/software/embergen/
   download/free-vdb-animations/ (EmberGen explosions/smoke). License
   permits use in work; confirm redistribution before vendoring.

## Already tried / ruled out

- `hydrogen_atom` 128³ (Open SciVis): runtime fetch CORS-blocked; also
  visually sparse. Fine offline but low priority.
- **HYG star catalog** (vendored at `explorations/grt-stars-data.js`, 1875
  stars ≤20 pc, CC BY-SA, datastro.eu, fetched 2026-08-18): works, but
  REJECTED as a demo dataset — a bag of points has no overarching structure
  for the cache to visibly learn. Keep for reference only.
- BSC5P-JSON-XYZ (github frostoven): same objection + files exceed import cap.

Ruling that governs the choice: the volume must have **legible overarching
structure** (shells, filaments, plumes) that the cache visibly reconstructs;
nebula-like preferred. Emissive datasets swap the light-azimuth control for
a transfer-function control.
