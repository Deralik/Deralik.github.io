# Rulings — the decision log

Canonical home of design and workflow decisions (imported 2026-08-18 from
the design project's `design-rulings.md`; this file continues it — copies
synced outward to the claude.ai project, never the reverse).

Two registers, deliberately separate:

- **Owner rulings** — decisions the owner actually made, generalized into
  principles. Binding. New rulings land here the turn they are made, dated.
- **Model working notes** — analysis, verdicts, and rules a model authored
  along the way. Advisory only. They yield instantly to owner feedback and
  must never be treated as law.

Binding does not mean beyond challenge: see CLAUDE.md → Working
agreements. A ruling stands until the owner supersedes it; superseded
lines are marked, never silently deleted.

Ownership rule: this log records *decisions and reasoning*. Facts live in
BRIEF.md; the operative design system lives in SYSTEM.md; the review
rubric in REVIEW.md. Restating their content here (or theirs here) is a
finding.

# Owner rulings — general principles (binding)

1. **No screenshots as demos or illustrations.** A product capture may not
   carry a project or stand in for a demo. Figures either plot real data in
   the site's own visual language or are honestly-labelled empty slots.
2. **No invented facts.** Every quantity and checkable claim traces to a
   named source (transcript, changelog, repo, dated owner statement). If a
   date or number is approximate or unknown, the design says so honestly
   rather than guessing.
3. **Everything has to earn its place.** Content, figures, decoration,
   animation — nothing enters because it fills space or looks interesting;
   the owner rejects filler on sight. Operationalized per view/element in
   CONTRACT.md.
4. **Geometry must mean something.** Bar thickness, washes, overlays, and
   connectors are legitimate only when each one encodes a real property.
   Unexplained decoration on a data figure is a defect. Corollary: treat
   like things alike — one rule for all instances, never mix-and-match.
5. **First screens read fast; depth carries the detail.** Page tops stay
   spare; prose, tables, and reference material live at lower depths.
   Reference/citation material belongs in the deepest tier (D2), the same
   place in every section.
6. **Cards and prose speak about the experience, not the chart.** Card text
   never narrates the drawing; it tells what happened, in the owner's
   voice, with owner-supplied wording kept verbatim.
7. **Provenance bookkeeping stays out of the reader's view.** Precision
   grades, source citations, and audit counters live in the data files —
   the rendered page shows the story, not the apparatus. (Publishability
   of those data files is still audited — they ship with the site.)
8. **One canonical artifact per thing.** Settled truths are written down
   and consulted before touching a surface — models base work on the
   settled artifact, not on memory of it. One place owns each
   cross-cutting decision; restatement elsewhere is a finding.
9. **Consistency of interaction across the site.** Every section opens the
   same way; no section keeps private furniture others lack. Mobile is its
   own deliberate design (locked depth with top nav), not a squeezed
   desktop.
10. **The home page carries each project by a visual, not by prose** — with
   a hard word budget (≤40 words per project, no paragraph over 25).

# Owner rulings — figures & interaction (GRT rounds, Aug 2026; general
where phrased generally)

- Overview (D0) cards: trends and conclusions only — never dataset-specific
  figures ("~10× smaller cache", not "28 MB"). Applies to rail values too.
- 3D drag = grabbing the volume (inverted deltas, inertia), never orbiting
  a camera around it. Hero renders are grabbable cameras on a sphere;
  released, they ease back to their orbit after ~1 s; camera drags are
  gated to the image rect.
- Any view of the cache must glow like the field it learned — outline-only
  primitive rendering reads as empty/broken and is rejected.
- Probes: pinned by click, labelled, values in the readout — never an
  unexplained shape following the cursor.
- Every ring/glyph in a loop drawing needs its purpose written adjacent,
  and ray-crossed gaussians must visibly flash/update.
- Control rows never reflow: labels are static, state is the dark fill;
  counts are sliders (up and down), never +N buttons. Readouts
  right-aligned.
- Truth/reference views must read as data — dimmer and more structured
  than the cache view, never brighter.
- Demos self-run (aim, launch, narrate) and yield to the user on
  interaction, resuming a beat after they stop — the bunny pattern.
- Adjustment feedback edits the existing section IN PLACE; a new canvas
  section is added only for a genuinely new direction.
- No decorative particle motion: flying sample dots read as noise. Show
  training by highlighting each primitive the moment the ray crosses it —
  never an end-of-pass flash.
- Figure animation budget (2026-08-18): hero demos animate; METHOD figures
  don't. Method figures use the cINR figure vocabulary — zone washes with
  role titles, ink boxes, thin numbered arrows keyed to a legend, dashed
  rare paths, drawn once (resize redraw only).
- Figure-text rule: every comparison pane carries exactly one bottom-left
  explanation line ("NAME — claim · instruction"); diagram annotations
  anchor to their elements; no roving/appearing caption text.
- Learning meters read as PSNR in dB, higher-is-better — never "% error
  over mean truth".

# Owner rulings — GRTCache page (2026-08-17/18)

- **Status is labelled plainly**: submitted to HPG '26, not accepted, under
  revision. No euphemism, no hiding the venue. The rejection is stated
  plainly; do not soften or remove it.
- **Role**: second author, equal weight with the first author — "they did
  more of the writing while I did more of the coding initially."
- **Numbers**: BRIEF.md's GRTCache fact pack (rewritten 2026-08-18 from the
  manuscript record; the pre-manuscript "5× / 11.7×" line is superseded).
  On-site, record numbers stay flagged "the manuscript's, not yet
  peer-verified."
- **Page message**: novelty of the method first (explicit, interpretable,
  world-space cache), then the honest struggles/shortcomings, then
  resubmission work. Paraphrasing the reviewers' objection is allowed; all
  current workstreams may be named.
- **Pipeline-figure form**: the overall pipeline is ABSTRACT — washes +
  boxes + numbered arrows, no pictures per section. The training step gets
  its own short figure after NRC's trace-back diagram (Müller et al. 2021 —
  training follows theirs almost one-to-one, same termination heuristic;
  attribute it). The two sit side by side.
- **Pipeline language**: use the method's own vocabulary — PCD seeding
  pass; extended training rays; samples = bounce positions + directions,
  NEE at each bounce, composition trace-back; optimization + MCMC =
  relocate unused · add new · nudge existing; in use, rays TERMINATE INTO
  the cache (glyph: several rays terminating, never one query ray). No
  invented phrasing.
- **NEE caveat** (shortcomings section): NEE-derived samples carry only the
  direct-lighting component; even attenuated they have not yet improved
  training — a named open issue in the owner's words.
- **Comparison-figure rulings**: every depicted ray routes to exactly ONE
  cache — bounce count decides; per-bounce cache boxes plot the volume's
  own field at that depth; NRC is a pure black box; GRTCache appears as
  the FINISHED cache — live training belongs to the top demo only.
- **Final-render rule**: a rendered image never shows gaussians — the cache
  only changes how fast each pixel converges to truth (variance + a
  residual bias that fades with training). Splat views belong to
  world/breakdown panes.
- **Hero**: sweeps 1 spp with-cache against 1 spp raw path tracing along a
  draggable seam (auto-sweeps otherwise); converged reference inset
  top-right; the cache-only inset is dropped. SUPERSEDED 2026-08-21 by
  the renderer rebuild (see the rebuild sections below + BRIEF's GRT
  bullet): the cache side is now a full march of the cache's baked
  field, not a 1-spp estimator; the seam/inset stay.
- **Demo dataset**: demo volumes must have overarching structure the cache
  can visibly learn — a bag of points fails (HYG star catalog rejected on
  this ground); nebulae preferred. Sources, licenses, and the offline
  conversion recipe: design/handoff/DATA-HANDOFF.md.
- Role + author list in the GRT reference block is an owner slot
  (data-empty) — never invent it.
- **Reviews on file (2026-08-18)**: the HPG '26 reviews exist locally
  (paths: SOURCES.md; they never enter this public repo). The page's
  paraphrase of the reviewers' objection must trace to the summary
  review — equal-time comparison missing + validation clarity — and the
  in-progress workstreams may be framed against the named review points.

# Owner rulings — workflow & launch (2026-08-18)

- **Launch posture**: the partial site (About + cINR + GRTCache + titled
  under-construction slots) launches as soon as the port passes review, so
  the owner can link it on applications. GRTCache launches HONEST: real
  volume data in the demo (nebula-class per DATA-HANDOFF; the "black hole"
  companion gets a real-data feasibility check with options presented —
  labelled analogue or drop — before launch), and no comparison framing
  ships unless the difference shown is real output of the shown
  computation. Taste-level GRT refinement continues after launch.
- **Band-2 order**: MelioraOS → Okibi → SPLAT (SPLAT last was always the
  intent; supersedes CLAUDE.md's earlier SPLAT-third order). Until each is
  designed, its card is a titled, honestly-labelled under-construction
  slot — design language of the existing empty slots, real project names.
- **Demo honesty** (owner statement, verbatim intent): browser demos are
  not expected to implement the papers' methods 1:1, but the
  approximations made for efficiency must not lead to misleading
  behavior. Rubric: REVIEW.md → honesty lenses.
- **Nothing is gospel**: handoff content, model output, and the owner's own
  ideas are all up for review and critique. Challenge protocol:
  CLAUDE.md → Working agreements.
- **Release protocol**: privacy gate (`scripts/check.mjs`) before every
  commit; a short CHANGELOG.md entry per release; the owner pushes —
  models never push. CI runs the same gate on every push.
- **Verification tooling adopted**: `scripts/probe.mjs` (screenshot matrix
  + scripted interaction + console capture). A visual change is not done
  until rendered output has been seen — desktop widths AND 390px mobile,
  both themes.
- **Reviews always cover the mobile experience** alongside desktop, every
  pass.
- **Freshness sweeps**: the projects are alive (GRT revision, MelioraOS
  releases, Okibi releases, SPLAT progress, About timeline). SOURCES.md
  maps each section to its upstream sources; sweep sessions diff reality
  against the site and propose updates for owner triage — the owner never
  walks the projects one by one.
- **Identity line (2026-08-18)**: the site title is **"GPU & Machine
  Learning engineer"** as mocked — supersedes BRIEF's earlier "GPU &
  rendering engineer" phrasing; `about-record.json`'s `identity.title`
  is harmonized to it at port.
- **cINR trends verified (2026-08-18)**: the card's "~2× avg path-trace"
  is owner-confirmed and paper-verified ("a roughly 2x gain for PT",
  avg ≈2.0× across the record's ten datasets); BRIEF carries it now.
- **Theming**: production ships exactly two themes — light `h-transit`,
  dark `k-matrix` — default from `prefers-color-scheme`, toggle writes a
  localStorage override, no-flash inline script (handoff README owns the
  implementation spec).
- **Repo cleanliness (2026-08-18)**: the public tree carries no
  design-context binaries and no structural leftovers. Gitignored
  `design/local/` holds local copies of primary sources and captures at
  stable paths. Structural files retire from HEAD when their phase ships
  (git history keeps them) — e.g. `design/handoff/` after the port
  lands; the captures moved out the day this was ruled.

# Owner rulings — content & voice (2026-08-19, S2 triage)

- **Voice**: the site's wording is personal, professional and mature
  when needed but never corporate; light self-aware humor is deliberate
  and good for the owner's image ("wannabe researcher" stays).
  Reviewers must not flag owner-voice humor as register errors. Several
  sections (About D0 bio line, About lede, and others the owner names)
  get an owner-involved rewrite pass during S3 — models draft, the
  owner's voice wins.
- **Okibi headline (fact, confirmed)**: task mortality is the product's
  headline feature — unfinished tasks burn away into a permanent
  record; the slogan is "A list that lets you forget." → BRIEF pack
  updated; the About strip clause stands, now mapped.
- **Japanese**: no JLPT credential is held; ~N4 is self-assessment from
  lessons/quizzes. D0 renders "JP" bare (space was the reason for
  "N4"); depth carries "intermediate — self-assessed ~N4 level;
  coursework JPN 001–003". No JLPT-shaped credential renders anywhere.
- **High-school record**: KEPT — the owner considers it important
  history most people don't have. It renders outside the
  transcript-facts block, marked "owner recollection — no HS transcript
  located" (~4.2 GPA, ~366 units).
- **Slot tier**: **"under construction"** verbatim — friendlier and
  more personal than "in design".
- **Contribution grid** (owner delegated as a technical call; model
  decision): vendored dated snapshot in about-record.json — no reader
  IPs to a third party, matches the no-fetch posture; label becomes
  "52 weeks · as of <date>"; the freshness sweep refreshes it.
- **MS award date**: sourced — the owner holds the official conferral
  document (graduated 11 Jun 2026). about-record gains the source note;
  the reference block header becomes "Academic record" (mixed
  transcript + conferral sources, no longer claiming transcript-only).
- **GRT team line (2026-08-19, closes the author rider)**: Angela Zhou
  and Daniel Zavorotny, equal contribution; David Bauer and Qi Wu,
  mentors; Kwan-Liu Ma, lab director (final review). The site presents
  it in that role-honest form — it does not fabricate a formal author
  order for an unpublished paper. Facts: BRIEF GRT pack.
- **"In progress" section (2026-08-19, closes the framing rider)**:
  rewritten from the owner's dated statement in BRIEF (NEE
  incompatibility conclusion; MCMC heuristic finding; trajectory
  unchanged; reconstruction-quality work active; VDB + multi-object
  extension; possible new story direction). The manuscript's
  future-work items (EMA, volume-native termination, StochasticSplats)
  are NOT presented as in progress. Equal-time comparisons are not
  claimed as running — the honest absence stands.

# Owner rulings — affordance & assets (2026-08-20)

- **Interactive parts must be visually distinct from non-interactive
  ones** — an element that looks static but responds (or looks clickable
  but doesn't) is a defect. Applied: links underline (browser default
  kept), the theme toggle is icon-based (sun/moon; active in --ink),
  section tabs and "↑ the panel" get pointer cursor + hover ink,
  cards get :focus-visible outlines and Enter/Space activation, the
  pending résumé item stays muted/no-underline until it is a real link.
  Reviews check this both ways.
- **Theme toggle is icons, not words** — the identity line already
  carries text; icons keep it quiet.
- **Portrait color pipeline**: the source photo is Display P3; any
  derivative for the web is converted to sRGB at export (a dropped
  profile reads as a sickly green cast — found 2026-08-20).

# Owner rulings — reactive rounds (2026-08-20)

- **Persistent render across depths (cINR, pattern for future demos)**:
  the bunny is ONE component at every depth — it migrates card ↔ demo
  slot with a glide, never disappears/reappears. Card mode = same
  render, LoD locked, cache muted (no emission, no flashes, band1
  ground); demo mode = everything live. One saved view.
- **Motion quality bar**: depth morphs must be monotonic (no transient
  bulge/dip of any element) and jank-free. Mechanisms in force: canvas
  loops hold their last frame during morphs (window.__morph +
  body.morphing), layout re-fits debounce past the morph, wrap
  breakpoints are held during morphs, migrations use a monotonic-
  clamped chase. VERIFY with `probe trace:ms,selector` (per-frame rects
  + jank counts) — eyeballing transitions is not verification.
- **About header composition**: the portrait fills the band's height
  (width follows the photo's aspect); the bio sits adjacent to the
  portrait (it is about the person); the elastic space lives between
  bio and the contact column; padding symmetric; the contact column
  distributes to fill its height (grid at the bottom edge); heatmap
  cells and gaps are integer-px so spacing reads even. Band scales
  from viewport units (container units animate during morphs).
- **Japanese**: shown as "JP (~N4)" at BOTH depths — the site's ~
  approximation grammar carries "about this level" honestly in one
  character; no "self-assessed" prose (supersedes the 2026-08-19 JP
  wording; still no bare "N4": a held-credential reading stays off).
- **Keyboard**: ArrowDown at D0 opens the FOCUSED card (falls back to
  the first project).
- **Workflow**: commits batch at meaningful checkpoints, not per tweak
  (owner). Dev serving is always no-store.

# Owner rulings — demo data & scaling (2026-08-20)

- **Truth reads as DATA, only the cache reads as gaussians.** Ground
  truth is a clear, high-res volume render (real data + a proper
  transfer function); gaussians represent the radiance cache, never the
  scene. The hero's data side adopts this once a dataset + TF are
  picked.
- **Dataset triage runs through `scripts/volshot.py`** → stills +
  contact sheet in design/local/volshots/; the owner picks datasets and
  TFs from renders, not descriptions. Wanted: a real black-hole volume
  and more nebulae; any open source with public data + proper credit is
  fair game.
- **Viewport-aware everywhere**: figures scale and center to their box;
  hard-coded sizes only within logical reason.
- Interim: hero defaults to the crab analogue until the pick lands.

# Owner design directions — endorsed but unexplored

- **MelioraOS**: an abstract figure of the owner's workflow loop with the
  Claude Code agents (design doc → mockup → harnesses/gates → shipped
  surface). Suggested direction only; not yet explored, not a ruling.
- **Mobile About record**: rotate the timeline vertical, done carefully.

­

# Model working notes — advisory only

*A model wrote everything below. Useful as analysis; none of it outranks a
single sentence of owner feedback.*

## MelioraOS overview (pre-endorsement analysis)

The row should convey the development process, not the feature list.
Rejected shapes: construction-lifecycle phases (customer's business, not
the work); commit-gate detail (pitched below what a hiring reader cares
about); any single bar or axis (a process is a loop with branches).

## Okibi overview

The app is the story, not the calendar sync. Public and free (okibi.app),
rebuilt from a 3-year Notion system, owner is primary user. The
sync-conflict sandbox is a page-level moment, not the overview.

## Two products, two stories

MelioraOS: commercial; claim = the process and the bar it reached.
Okibi: public, free; claim = the product itself, shipped and used.

## Working heuristics from Direction A

Controls should carry real content in every position and take the shape of
their measurement; one accent, one job; repeated controls share one
geometry; pending is a first-class state; no falsifiable copy (prefer
properties over counts); demo slots keep a fixed frame with the poster
replaced in place.

## Open questions

- MelioraOS vs Meliora naming (changelog vs sidebar wordmark).
- SPLAT stage list unpinned; first convergence plots trigger growth.
- Okibi feature list was read from a reference capture; vet before its
  section is written.

## Status of the 2026-08-18 "BRIEF amendments pending" list

All applied 2026-08-18: GRT fact pack rewritten from the manuscript
record; "production" → "private beta"; MelioraOS beta.11 release fact
added.

# Owner rulings — hero datasets (2026-08-21)

- **Gaia Sky nebula models accepted, with credit** (CC BY-NC-SA;
  Shadertoy-derived). Picks: **Butterfly, Hourglass, Ring**. Ported as
  density functions only; rendering/lighting/training are the site's
  own pipeline; on-page credit in the GRT reference block. Labelled
  models, never observations. Supersedes the strict real-data-only
  hero framing (2026-08-18) — the real supernova stays as the fourth,
  "real data" option.

# Owner rulings — renderer rebuild (2026-08-20, pre-sleep mandate)

- **Hourglass dropped; MechHand added** — the research repo's real
  industrial-CT benchmark replaces the third nebula. Hero order:
  Butterfly · Ring · MechHand (real CT) · Supernova (real data).
- **Full pipeline re-evaluation ordered**: owner's critique — left pane
  far too low-res; the two sides differed in resolution; the 2D view
  showed gaussian splats instead of a render of the field; TFs didn't
  match the approved gaiashot previews (only butterfly close). Rebuild
  mandate: study ../gsrc, understand what may be approximated without
  compromising the intended result, keep interactive framerates.

## Model notes from the rebuild (2026-08-21, advisory)

- Official transfer functions recovered from the research repo's scene
  configs (mechhand + supernova RGB/alpha control points; supernova's
  official scalar domain is 0→0.13584 of the raw range — the earlier
  percentile vendoring was why it rendered as a white blob). Display
  curve is the repo's paper curve 1−exp(−e·L), no gamma; figures'
  Reinhard+sRGB variant applies only to research-bench evals.
- One integrator / one resolution / one probe-calibrated exposure for
  both panes; left = full march of the cache baked to a grid (never
  splats — final-render ruling upheld); right = unbiased 1-spp/frame
  estimate, linear accumulation; PSNR is render-space vs a full-march
  reference on shared rays.
- Supernova opacity floor (small, disclosed on-page): stands in for
  shell scattering an emission-only pipeline cannot produce. Gaia edge
  dust colour matched to the shaders' rendered output rather than their
  raw constants (their optical-depth accumulation warms it) — both are
  approximation disclosures, not new facts.
- MechHand stored upright (long axis = y) so orbit views stay broadside
  — kills oblique undersampling streaks; real aspect preserved via
  per-volume half-extents. All four datasets hold 60 fps (16.7 ms, zero
  janky frames) at 1512 and 390 widths after: 16-step cache march,
  content-box ray clipping, 10-slice double-buffered bake, 30 Hz world
  splat layer.

# Owner rulings — hero round 3 (2026-08-21)

- **Readable source ships.** "Your code is an absolute mess… almost
  impossible to read." The dense house style is retired: prettier is the
  formatter of record (.prettierrc, devDependency; vendored data modules
  excluded via .prettierignore). This audience reads source; format
  before commit.
- **The cache side must read as the more complete image.** The seam's
  point is the paper's: cache-on 1 spp is usable, cache-off 1 spp is
  not. Perpetual accumulation on the estimator side hid that (it
  converged to a sharp image and inverted the story).

## Model notes (advisory, same round)

- Estimator accumulation now uses the research renderer's semantics:
  accumulate while the view holds still, reset with motion. The label
  prints the held sample count.
- Cache capacity: spatial bins made training O(local overlap) instead
  of O(N); defaults 8–9k gaussians with tighter kernels; training
  targets are trilinear; sampling pools accept on EMISSION (density
  pools could never place gaussians in the nebula halos). Offline A/B
  (herojs train) shows cone filaments + halo learned; mech/supernova
  hold a stable ~1.5× in-content energy (thin-shell kernel-mass floor)
  absorbed by the disclosed cache-brightness scalar.

# Owner rulings — hero round 4 (2026-08-21)

- **The GT must be the continuous field, not a voxelization.** "Is one
  of these faked?" — nothing was, but every view marched a ~56³ EMIT
  grid while the approved references evaluated the density functions
  continuously; the owner correctly spotted the blockiness and the
  too-circular halo. The GPU path now evaluates the truth field per
  sample (analytic nebula densities in GLSL — a round trip home, the
  ports came from GLSL; finer vendored grids for the real volumes).
- **No volume bound drawn in the world view** (sets extend past it).
- **All three views must conceptually converge to the same result** —
  the cache side should read as the more complete image and approach
  the GT, not sit blurrier than an accumulated estimate.
- **Single files stay digestible** — the 1200-line renderer core split
  by responsibility (vols / field / aggregator / GL / shaders).

## Model notes (advisory, same round)

- Precompute grids remain for: training targets, calibration, PSNR
  pair (grid-vs-grid, labelled), CPU fallback. The panes and inset are
  continuous on the GL path.
- Cache sharpness: sizes now derived from measured content spacing at
  the chosen N (σ ≈ 1.0× spacing — 0.62× tried and rejected: grainy
  gaps; sum-of-gaussians needs overlap); defaults 12–13k gaussians.
  A/B: butterfly energy 1.00 with cone texture; mech resolves fingers.
- Perf at 12–13k: adaptive bin cells (≈ query radius), cache texture
  streamed slab-wise into a double buffer (upload stalls), world splats
  strided 2× above 9k — all four datasets 16.7 ms / 0 janky on GPU.

# Owner rulings — hero round 5 (2026-08-21/22)

- **The two panes are the SAME 1-spp estimator; the cache only cuts
  variance.** Owner's conceptual spec, verbatim in substance: at 1 spp
  the cached side merely has fewer black pixels; held still, both sides
  converge to essentially the same image, the cache's slightly-off
  radiances washing out to a minor residual. This SUPERSEDES the
  "cache pane = deterministic full march of the cache field" design of
  rounds 2–4: the left pane is now the same estimator with EARLY
  TERMINATION INTO THE CACHE — a short real prefix (first quarter of
  the ray, one stratified sample) and the cache supplies the remainder
  of every sample; both panes accumulate and reset together.
- **Match the approved reference screenshots, not just "the pipeline":**
  the GT was voxel-blocky and halo-heavy vs the gaiashot references.
  Fixed by Beer–Lambert absorption from the known truth density in
  every integrator (occlusion: silhouettes, black background, the halo
  confined behind the dust), glow re-tuned dim + tight, thinner shell
  band, finer/stronger AO. Verified by direct side-by-side crops.
- **No visible gaussians in the cache pane, ever** (re-affirmed live):
  adaptive kernel sizes must keep strong overlap — σ ≈ 1.3× spacing;
  1.0× read as individual blobs and was rejected.

## Model notes (advisory, same round)

- Convergence verified live: camera frozen via the debug handle, 541
  samples held — the image flows continuously across the seam and both
  sides match the reference inset.
- "Press and hold to accumulate" added to the pane caption — stillness
  is a real interaction, not a scripted state.
- Perf at 12–13k with the dual estimator: cache texture streamed in 5
  slabs, bake in 14 slices — butterfly/ring/mech/mobile locked 16.7 ms,
  supernova 16.9 ms with 1–2 isolated spikes.

# Owner rulings — hero round 6 (2026-08-22)

- **The volumes spilled the box — owner's diagnosis, confirmed in the
  density math.** The butterfly's cones extend to |p|≈1.45 and the
  ring's gas shell past 1.1, while every grid, pool, and march ended at
  ±1: the extremities were amputated everywhere and the cache thinned
  toward the faces. The gaia box is now the TRUE extent (he 1.45, grids
  64³, shell seeding he-scaled); nothing may bound a volume tighter
  than its content.
- **Cache termination follows the MEDIUM, not the ray**: the fixed
  ray-fraction prefix made some regions super-noisy and others smooth
  (owner's report). Termination now fires where accumulated optical
  depth crosses ~0.15 — at the first interaction, like the research
  heuristic — so the prefix is near-empty everywhere (uniform, tiny
  variance) and the cache supplies everything from the surface inward.
  (τ0=0.8 was tried first and rejected: it pushed the bright crust into
  the stochastic prefix and the cached pane collapsed into speckle.)

## Model notes (advisory, same round)

- Frozen-camera parity re-verified at the new extent: the image is
  continuous across the seam and matches the reference inset.
- Perf: all four datasets + mobile at 16.7–16.8 ms, ≤1 isolated spike.

# Owner rulings — hero round 7 (2026-08-22)

- **Explore root causes, never band-aid** (restated for this round's
  symptom list). Findings, each traced to a mechanism:
  · Zebra stripes on the cached 1 spp = QUANTIZED termination depth
    (32-step snapping) + a binary cache policy (thin gas got no cache
    beside fully-cached neighbours). Fixed structurally: the τ0
    crossing is interpolated (continuous), and the policy is a
    continuous per-pixel blend w = τ_total/τ0 — one SHARED sample
    serves both estimators, so it stays exactly 1 spp per side.
  · Converged grain = pure-random strata (1/√N). Now the stratum
    rotates deterministically with the frame index per pixel — all 24
    strata visited within 24 held frames; still unbiased, still 1 spp.
  · Uniform nebula colour + dead TF slider = the radius mix saturated
    once the box grew (m→1 everywhere → edge colour everywhere). The
    mix is now keyed to the content's radial span and the slider
    visibly remaps it.
  · MechHand "much thinner than the dataset" = post-classification
    downsampling (filtering the scalar THEN applying the nonlinear TF
    dilutes thin sheets). The vendor now classifies alpha at FULL CT
    resolution and filters that (b64a channel; GL samples it directly).
  · Ring cache mush = the box expansion silently HALVED effective
    training-target resolution; grids now scale with the box (88³).
    A local-occupancy kernel-size refinement was tried and REVERTED
    (halo cells got giant kernels — spill exploded).
- **Ring camera moved further out** (orb 2.45; butterfly 2.2).

# Owner rulings — hero round 8 (2026-08-22)

- **"Was no gate checked before you reported?"** — correct: none
  existed that could catch banding or converged parity; downscaled
  stills were the whole check. scripts/herogate.mjs now freezes the
  camera, converges both accumulations, reads them back pixel-aligned,
  and reports resid (displayed cached vs raw) + a diff image; it
  hard-fails above 0.5 and runs before hero claims are reported.
- **Sampling must be stochastic** — the frame-rotated strata swept all
  pixels' depths in lockstep (the wave). Each pixel now walks the
  strata with its own random phase AND its own co-prime stride:
  stochastic across the screen, still all-strata-in-24-held-frames.
- **The zebra's real root was quadrature, not termination depth**: the
  deterministic cache march's error forms iso-depth bands that never
  average out. Every deterministic march now runs a per-frame jittered
  phase; the parity diff shows no periodic structure.
- **The glow is computed, not cached**: box-filling analytic glow is
  ~30–50% of ray integrals in coherent units; isotropic dust-scale
  kernels cannot represent it. The cache learns the MEDIUM's radiance
  (dust-only targets, density pools, zero-pinned tails); the known
  glow term is computed along cache suffixes like transmittance is.
- **Units coherence**: grid emission now uses the analytic density
  (emitD hook) so grid, display, targets, exposure, and calibration
  share one scale (the smoothed-density grid ran 1.6× dim with 27×
  dimmer peaks — the source of the blown ring core and a mis-clamped
  brightness control).
- **Measured wall, queued upgrade**: with calibration pinned optimal,
  ring's converged parity floor is ~0.26 — inter-filament spill of
  ISOTROPIC kernels (σ ≈ filament spacing cannot stay out of the
  gaps). The research method's own representation (anisotropic
  gaussians) is the structural fix — queued as a feature, not patched.
  Current parity (720 spp): supernova .04 · mech .13 · butterfly .23 ·
  ring .29. Brightness control now: cheap grid-pair prior + held-still
  readback trim against the true accumulations; clamp widened.
- Known cost, rider: dataset-switch rebuild is now ~1.5–2 s
  synchronous (88³ analytic) — an async/chunked rebuild is queued.

# Owner rulings — hero round 9 (2026-08-22)

- **Controls carry their weight or leave**: the Gaussians slider removed
  (lag, no visible effect); the TF slider is now a REAL control — for
  the nebulae it sweeps palette colourways (t=0 = the matched look);
  for the real volumes it is a scalar-domain WINDOW, the control SciVis
  tools expose (it reveals the supernova's interior shells; official
  mapping at centre). Figure text pared to: pane labels "WITH THE
  CACHE — 1 SPP" / "WITHOUT — 1 SPP", one drag-hint line, "CACHE VIEW"
  over the gaussian view; chipline removed ("soft splats" wording is
  gone — nothing splats).
- **TF must be interactive**: density/AO/glow are TF-independent and
  now cached per voxel — a TF rebuild re-shades in ~100ms; the panes
  respond instantly via uniforms; all four volumes pre-build at idle so
  dataset switching no longer hitches.
- **Ring vs gas separation**: the ring's TF keys colour to the torus
  distance (TFs may key on the data's own geometry) — white-blue ring
  against amber web.
- **The hand is a solid object**: mech κ=48 — the skin occludes the
  interior. Sideways orientation restored (vendor no longer transposes).
- **Ring hot-spot pathology rooted**: relocation injected FULL local
  brightness on top of existing coverage; relocated gaussians now
  initialize to the RESIDUAL at the landing point.
- **Leftover-element sweep** (owner's "Light azimuth" catch): the
  entire light/azimuth path was vestigial (all four datasets emissive)
  — deleted, label statically "Transfer function". A method named
  warm() was silently shadowed by the warm accent colour field —
  renamed prewarm() (the matrix caught it; instance fields shadow
  class methods).
- **Supernova attribution corrected + LAUNCH-GATING license rider**:
  the dataset is NOT in today's Open SciVis catalog; true provenance
  (per the research repo's manifest): Kitware Data collection, Dr. John
  M. Blondin (NCSU), DOE SciDAC Ultrascale Visualization Institute —
  and the manifest itself records "no explicit license found; confirm
  reuse terms before redistribution". Owner must confirm terms or the
  supernova ships out. Mobile method-figure clip fixed (aspect-ratio ×
  min-height forced overflow).

## Round 9 addendum (owner, 2026-08-22): the real volumes are LIT

- MechHand and the supernova are NOT emissive — their scenes carry
  spherical lights and the TF rgb is scattering albedo (the study's
  findings). They now render as lit single-scattering media: the
  per-voxel grid the integrators sample as "ao" is the LIGHT FIELD —
  irradiance from the scenes' own lights (positions/intensities from
  the configs) with shadow transmittance marched through the known
  medium. This also fixes the supernova's washed self-glow: it shades
  directionally with a shadowed rim. Relocation hot spots on the ring
  fixed the same round (residual-initialized relocation).

# Owner rulings — hero round 10 (2026-08-22)

- **The ring divergence was real** (owner's sustained-training report):
  two mechanisms, both fixed at the root. (1) SGD-on-a-sum updates were
  unnormalized — the sum's step scales with local overlap, and
  relocation deliberately piles overlap onto the brightest segments;
  past ~20 overlaps the update crosses the stability bound and the
  zero-clamp rectifies the oscillation into a brightness ratchet. All
  updates now normalize by the local weight sum (step bounded by the
  learning rate regardless of pile-up). (2) A gaussian that decouples
  from regular sampling could still be pumped by concentrated
  ray-vertex micro-updates toward the ABSOLUTE colour clamp of 2 —
  ~40× the working scale — becoming a stuck bright dot. The colour
  ceiling now scales with the field's own mean (cMax ≈ 14·mean), and
  micro-updates are damped 0.4×. Offline reproducer confirms: ring
  grid energy went 2.86→2.56 from 1500→6000 iters (was RISING before).
- **Stale-version failure, caught by the owner twice, now machinery**:
  check.mjs hard-fails any commit where a js/css file changed but its
  ?v= in index.html did not (negative-tested). The lights/solidity
  round was invisible to the owner because grt-vols shipped twice
  under one version.

# Owner rulings — hero round 11 (2026-08-22)

- **"Still not solid, still no lights" — the owner was right a third
  time, and the root was my process**: the κ=16, κ=48 and mech-lights
  edits were scripted replaces whose anchors had drifted — they
  silently no-opped and I reported them shipped (κ was still 10).
  Working rule now: every scripted replace asserts its anchor, and
  every shipped claim is verified by LIVE eval of the running page,
  not by eyeballing a screenshot. (This round's eval: kap 48, two
  lights, light-field range .14–8.9, reset 18 ms.)
- **One lighting source of truth**: rebuild's emission grid was still
  sampling its own inline AO while the panes sampled the light-field
  texture — mismatched units re-blew the supernova's exposure. The
  grid now samples the same buildAO field the shader gets (plain AO
  for nebulae, shadow-marched scene-light irradiance for the data
  volumes). Supernova parity hit .026 — the best of any dataset —
  once units agreed.
- **TF sliders default to CENTRE for every dataset**: centre = the
  matched/official look; both directions sweep (nebulae mirror the
  palette mix below centre; data volumes window the domain).
- **Reset is instant** (18 ms): gaussians seed from the sample pool
  (shellInit ray-casting deleted), and the cache pane refills through
  the sliced bake instead of a synchronous full re-bake.
