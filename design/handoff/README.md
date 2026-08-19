# Handoff: Daniel Zavorotny — portfolio site (partial: About · cINR · GRTCache)

## Overview
A personal portfolio for a GPU & rendering engineer. One page, three "depths":
a dashboard of project cards (depth 0), an opened card with a rail of the
others (depth 1), and a full technical document per project (depth 2). Three
sections are finished and ship now: **About**, **cINR** (EGPGV 2025 paper),
**GRTCache** (manuscript under revision). Three more project sections
(MelioraOS, Okibi, and a third) are still being designed and will come later —
the machine already has empty slots for them.

The goal of this handoff: a live, deployable partial site the owner can link
on job applications.

## About the design files
Everything under `site/` is a **design reference built in HTML/CSS/vanilla JS**
— the intended look and behavior, demonstrated working. There is no existing
target codebase. Recommended implementation: **ship it as a static site**
(no framework, no build step — the design is deliberately dependency-free and
all figures are hand-rolled canvas code). Port the files into a clean repo,
apply the "Production tasks" below, and deploy to any static host (GitHub
Pages / Netlify / Cloudflare Pages). If you instead adopt a framework, treat
these files as the spec and recreate them exactly — but nothing here needs one.

`site/index.html` opens directly in a browser from the folder (assets resolve
at `../uploads/`). Keep that relative layout or update the three references
(résumé PDF ×2, portrait ×2, Quality Results.png ×1).

## Fidelity
**High-fidelity.** Colors, type, spacing, copy, and interactions are final
unless a "Production tasks" item says otherwise. The figures are **live
algorithms, not images** — the cINR cache demo and every GRTCache figure
compute in the page. Port them as code; do not replace them with screenshots
or video (a hard content rule of this site — see Guardrails).

## Theming — owner decision, implement this
The tokens file (`skeleton-tokens.css`) holds 7 exploration themes. Production
ships exactly **two**:

- **Light mode = `h-transit`** (cool blue-grey paper; Lexend / Literata / Fragment Mono; steel-blue accent)
- **Dark mode = `k-matrix`** (near-black blue-grey; Syne / Vollkorn / Red Hat Mono; teal accent)

Behavior:
- Default follows `prefers-color-scheme` (light → `h-transit`, dark → `k-matrix`).
- Set `data-theme` on `<html>` in an **inline head script before CSS paints**
  (no theme flash), reading a `localStorage` override first.
- Add a small light/dark toggle at the right end of the identity line (`.idl`),
  styled like the existing `.bit` items (mono, uppercase, understated — e.g.
  "light / dark" with the active one in `--ink`). It writes the override.
- Delete the other five theme blocks from the production tokens file (keep
  them in the design repo), and trim `skeleton-fonts.css` to only the families
  H and K use: Lexend, Literata, Fragment Mono, Syne, Vollkorn, Red Hat Mono.
  (Both mode's font sets must load, since the toggle swaps them at runtime.)
- The theme list in the scaffold is design-time tooling; it goes away entirely
  (next section).

## Architecture — the depth machine (`skeleton.js`)
- `PARTITION` at the top of `skeleton.js` is the **only** place the dashboard
  composition lives: bands, per-field weights. Ship the `'6 · as built'`
  preset: About column (fixed 252px, spans both bands) + band 1 = cINR (w 6.1)
  and GRTCache (w 3.9) + band 2 = three empty slots. Remove the other presets
  and the preset selector.
- Depth 0 → click a card → depth 1 (card expands, others become a 180px rail)
  → scroll/↓ → depth 2 (the document). `Esc`/the "↑ the panel" chip go back
  up. Keys: ↑/↓ depth, 1–7 open by index, Esc. Keep all of that; remove the
  `S` scaffold-toggle key.
- Wheel at depth ≥1 drives depth transitions (`pbody` wheel handler); document
  scroll happens inside the doc face.
- **Mobile** (≤~700px or forced): a separate mode — locked at depth 2 with a
  sticky project strip (`.mstrip`); no dashboard. Already implemented; keep.
- Empty slots 03–05 render dashed "awaiting real material" frames — that is
  deliberate design language (honest empty slots), not an omission. Ship them.
  Their labels stay "03 / 04 / 05" until those sections are designed.
- A `ResizeObserver` + font-ready hooks re-run layout; keep.

## Scaffolding — remove from production
The bottom `.scaf` bar (theme/partition/viewport selectors, measured readout,
keys legend, hide button) is a design-time instrument. Delete the markup, its
CSS, and its wiring (`sel-theme`, `sel-part`, `sel-view`, `#ro`, `btn-hide`,
the `S` key). The theme toggle described above replaces `sel-theme`.
`localStorage` keys `skeleton:*` (theme/preset/view) go away with it, except
the new theme override key.

## Screens
### About (spans both bands, fixed left column)
- Panel: portrait (`image-slot.js` custom element), one line of bio, "Looking
  for R&D work" status, contact rows (email, LinkedIn, languages, GitHub), a
  GitHub-style contribution grid (`.ghgrid`, drawn by `about-skeleton.js` from
  `about-record.json` — static data, no API), and a small history figure.
- Doc (depth 2): portrait + full bio paragraph, the history **timeline**
  (thickness = engagement, ○ = ongoing — drawn from `about-record.json`),
  and a Reference section: publication cite with DOI link, transcript facts,
  résumé PDF link. All copy is final; every fact is real.

### cINR — "From cluster to desktop."
- Panel: claim, two trend quantities (~5× avg ray-march, 2× avg path-trace,
  EGPGV 2025 honorable mention), and the **bunny cache demo** on the card
  (no background well — it draws on the card surface).
- Doc: hero demo (brick cache filling coarse→fine on a public scan; drag to
  turn, right-drag zoom; controls: animation toggle, clear cache, fill order
  ranked/first-come, reset view, cache-capacity + LoD sliders; view persists
  in `localStorage` `cinr-view`/`cinr-view-panel`) · "The method" pipeline
  figure with 7-step legend · abstract + first-author's note + contributions +
  ranked-vs-first-come FPS chart · "The record" table + two FPS charts +
  quality image (`uploads/Quality Results.png`) · Reference (DOI, arXiv, code
  link, **Not claimed** disclosures, demo provenance note).

### GRTCache — "A radiance cache you can look at."
- Panel: claim, trend chips (~10× smaller cache · on par with NRC, not yet
  faster · HPG '26 not accepted, revising), and the live mini: **the
  comparison figure's GRTCache pane** (`GRT8T` in `solo` mode) — the trained
  gaussian field turning on the card, rays terminating into it. No well.
- Doc: hero (`GRT7A`) — with/without-cache seam comparison over a procedural
  volume, grabbable orbit camera that eases back, dataset toggle (crab-like
  remnant / black hole), gaussian-count slider, light-azimuth slider that
  becomes a transfer-function slider on the emissive dataset, PSNR-dB meter ·
  "The method" two figures (`GRT9A`/`GRT9T`: pipeline; NRC-style training
  trace-back) with legends · "The comparison" (`GRT8T`, three panes: NRC
  black box / GSCache per-bounce path-space windows / ours live) · "The
  record" table (labelled "the manuscript's numbers, not yet peer-verified")
  + the honest rejection paragraph · "In progress — toward resubmission"
  5 workstreams · Reference with **Not claimed** disclosures.
- One item in the GRT Reference block is an intentional TODO:
  `role + author list — awaiting owner copy` (marked `data-empty`). Leave it
  until the owner supplies copy.

## Interactions & behavior (cross-cutting)
- Card canvases: **drag turns the figure; click opens the project**. The
  capture-phase click-suppression pattern (moved > 6px swallows the click) is
  implemented on both card minis; preserve it on anything similar you add.
- All figure loops gate on `IntersectionObserver` (±300px) and cap
  devicePixelRatio at 2 (`GRT.fit`/equivalents). Keep both.
- GRT figures warm-start their fields with a ~110–200ms blocking loop at page
  init (two `GRT8T` + hero + panel ≈ up to ~0.6s on the main thread).
  Production task: move the warm-starts into `requestIdleCallback`/staggered
  timeouts so first paint isn't blocked; visual result is identical.
- `deck`-style navigation state (depth, open project) is **not** in the URL.
  Production task: mirror it to `location.hash` (`#/cinr`, `#/grtcache/doc`)
  and restore on load, so refresh and shared links land where the reader was.
- Links: standard `<a>` (mailto, LinkedIn, GitHub, DOI, arXiv, résumé PDF).

## Design tokens
`skeleton-tokens.css` is the single source of truth — geometry vars (`--idl`,
`--rail`, `--strip`, `--about`), the transition (`--t`), the per-theme color +
font registers, per-project accents `--pa-1…7` (legal only inside a project's
figure), and the RUNNING accent `--acc/--accw`. No color or font may be
introduced outside this file. The JS reads tokens at runtime via
`getComputedStyle` (`GRT.tok`), so the theme toggle re-themes the canvases on
the next frame automatically — but cached sprite tints in the GRT field
renderer are theme-independent (radiance palette), which is correct.

## Content guardrails (hard rules from the owner — apply to ANY copy you touch)
- **No invented numbers.** Every quantity traces to the cINR paper, the GRT
  manuscript (labelled as such), or a named artifact. GRT record numbers stay
  flagged "the manuscript's, not yet peer-verified".
- **No screenshots or video as demos** — figures compute live or are honestly
  labelled empty slots awaiting real material.
- Depth-0 cards carry **trends, not dataset figures** ("~10× smaller", never
  "28 MB"); ≤40 words of prose per project on the dashboard; no paragraph
  over 25 words; the top of every page stays spare.
- MelioraOS is in **private beta** — never "in production".
- Error/learning meters read as **PSNR in dB (higher is better)**, never "% error".
- The rejection is stated plainly (already written in the record section) —
  do not soften or remove it.
- `docs/design-rulings.md` has the full ruling log; `docs/BRIEF.md` is
  authoritative for facts (with the corrections noted above).

## Assets & attribution
- `uploads/DZResume.pdf` (linked twice), `uploads/IMG_3646.jpg` (portrait,
  used at two sizes), `uploads/Quality Results.png` (cINR quality figure).
- Fonts: Google Fonts via `skeleton-fonts.css` (trim per Theming). If you want
  to self-host later, subset the six families H/K use.
- The cINR demo mesh is the **Stanford bunny** (decimated, voxelized to a 48³
  grid in `bunny-grid.js`). **Public deployment must credit the Stanford 3D
  Scanning Repository (Turk & Levoy)** — add a line to the cINR Reference
  section footer.
- GRTCache demo volumes are procedural (crab-like remnant, black hole) and are
  honestly labelled as analogues in-page. A real dataset swap is a later task:
  `docs/DATA-HANDOFF.md` lists vetted sources, licenses, and the target format.
- `image-slot.js` is a small custom element for image placeholders; portrait
  drops are already wired.

## State
All client-side. `localStorage`: theme override (new), `cinr-view`,
`cinr-view-panel` (camera persistence). No fetches except Google Fonts and
`about-record.json` (same-origin). No analytics included — add nothing that
requires a cookie banner.

## Files (`site/`, load order matters — keep it)
- `index.html` — all three sections' markup, all faces, script tags in
  dependency order.
- CSS: `skeleton-fonts.css` → `skeleton-tokens.css` → `skeleton.css` (the
  machine + dashboard) → `about-skeleton.css` → `cinr-skeleton.css` →
  `grt-skeleton.css`.
- JS: `skeleton.js` (depth machine) · `image-slot.js` · `about-skeleton.js`
  (+ `about-record.json`) · `bunny-grid.js` → `cinr-trace.js` →
  `cinr-figs.js` → `cinr-skeleton.js` · then the GRT chain **in this order**:
  `grt-dir-core.js` (GRT namespace: rng/fit/loop/tokens) → `grt2-core.js`
  (camera) → `grt6-core.js` (ray choreography) → `grt7-core.js` (volumes,
  color field, meter) → `grt7-a.js` (hero) → `grt8-core.js` → `grt8-b.js`
  (comparison + solo card pane) → `grt9-a.js` (method figures) →
  `grt-skeleton.js` (wiring).

## Production tasks (the actual work list)
1. New repo; copy `site/` + `uploads/`; keep relative paths.
2. Theming: two-theme setup + toggle + no-flash inline script (see Theming).
3. Remove the scaffold bar and its keys/selectors/localStorage.
4. Trim `PARTITION` to the shipped preset; delete unused theme blocks and
   font imports.
5. URL state via `location.hash`; restore on load.
6. Defer figure warm-starts off first paint.
7. `<head>`: title ("Daniel Zavorotny — GPU & rendering engineer"),
   description, OG/Twitter tags (a text-only OG card is fine — no screenshot
   requirement here), favicon (simple "DZ" mark on `--ink`), robots ok.
8. Stanford bunny credit line in cINR Reference.
9. Accessibility pass: the depth machine is keyboard-navigable already;
   add `aria-label`s on cards ("Open cINR"), `role="button"`, focus styles
   (`:focus-visible` outline in `--acc`), `prefers-reduced-motion`: pause
   figure autorotation and the card minis' animation loops.
10. Deploy static; HTTPS; test at 1280/1512/1920 desktop and 390 mobile
    (the design's tested widths), both themes.
11. Do NOT: add a build system, framework, analytics, or any content beyond
    what's here; do not fill slots 03–05.

## Out of scope for this pass (designs coming later)
MelioraOS, Okibi, and the third project section; real GRT demo dataset
(`docs/DATA-HANDOFF.md`); GRT author-list copy; any D1 layout changes the
owner makes in the next design rounds.
