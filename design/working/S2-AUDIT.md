# S3 port ledger (was the S2 audit; live — delete when S3 ships)

Read this first each session. Status: ☐ open · ◐ running · ☑ done
(with evidence) · ⚑ blocked on owner.

- ☑ Lane 1 — demo truth. Evidence: cINR cache demo GENUINE (real
  capacity/LRU/admission, cinr-figs.js:268–372; live-verified); GRT
  training GENUINE SGD, PSNR meter measured but of the cache field not
  the render. Launch-gating, orchestrator re-verified first-hand:
  (a) hero with/without = synthetic theater with false "4 SPP" labels
  (grt7-a.js:73–85,114–115; disclosure buried at index.html:244) and
  README tasks 1–11 never schedule the fix; (b) cINR "Animation"
  toggle dead (st.paused write-only, cinr-figs.js:164/168). Plus
  should-fix label cluster (first-come mislabel, "RENDER QUALITY"
  noun, "REFERENCE — CONVERGED", card mini "LIVE, TRAINING", per-bounce
  windows wording, Richtmyer typo) and a RULINGS discrepancy: hero
  ruling says 1 spp, skeleton says 4.
- ◐ Lane 2 — claims vs primary sources (index.html + about-record vs
  BRIEF, papers, manuscript, reviews; lens 2) — reviewer running
- ☑ Lane 3 — contract + skim. D0 answers all five CONTRACT questions
  truthfully in both themes; word budgets hold; honesty survives to the
  pixels. Launch-gating, re-verified first-hand: (a) mobile sticky
  identity/strip broken — html,body{height:100%} + body.mob
  {overflow:auto} (skeleton.css:5,114); eval after scrollTo(0,900):
  strip top = −101; one-line fix body.mob{height:auto;min-height:100%};
  (b) band-2 slots ship template meta-text (index.html:255,262-263,283
  verbatim) and no titles — titled-slot ruling; exact replacement
  wording proposed in the lane report. Should-fix: chip vocabulary
  (Running/Held vs static false "Live"); D1 cover lacks headline
  trends (matters once hash deep-links land); GRT author-list TODO
  visible; mobile GRT hero squeezed; mobile header lacks tier
  ("peer-reviewed") — plus Richtmyer, "wannabe researcher" owner check,
  band-boundary tint imperceptible (open item stays alive).
- ☑ Lane 4 — experience matrix. Mechanics pass: depth machine, wheel
  commitment, drag-vs-click, theming, console health, mobile strip nav,
  §2i "reads but barely" confirmed shippable. Launch-gating, re-verified
  first-hand: (a) no-JS = blank page (all .face opacity:0, .fl absolute,
  no noscript — grep-confirmed); ~12-line noscript style block fix;
  (b) GRT hero illegible at 390 (desktop layout at any width). Notable:
  About grid fetches github-contributions-api.jogruber.de (line 593,
  confirmed) — README's "static data, no API" is FALSE; owner decision
  vendored-snapshot vs live. The recurring console 404 is image-slot's
  .image-slots.state.json sidecar, NOT favicon; image-slot.js (65KB)
  should become two <img> tags. Also: GRT ignores reduced-motion
  (cINR complies); Enter/Space never activates cards (task 9
  under-specified); color literals outside tokens file; dead
  RawVol/StarVol code; inert section tabs; DPR cap 1.25 vs documented 2.
- ☑ Lane 2 — claims vs primary sources. THE QUANTITATIVE CORE IS EXACT:
  every cINR record row digit-for-digit vs paper Table 1 (incl. 3080Ti
  for all rendering rows; 4090 was compression-only), abstract verbatim,
  GRT record verbatim vs manuscript, do-NOT-claim sweep passes (one
  exception → G8), About traces end-to-end. Five gating items, all
  word-level, all orchestrator re-verified verbatim (G7–G11).
- ☑ Orchestrator re-verified every launch-gating finding first-hand
  (code greps, live evals, verbatim line reads — noted per lane above).
- ☑ Honorable Mention publicly corroborated (egpgv.org/2025/program:
  presented 2025-06-02 Luxembourg City; co-author Qi Wu's publications
  page: "Best Paper Honorable Mentions, EGPGV 2025") → SOURCES.md.
- ☑ Consolidated punch list below.
- ☑ Owner triage 2026-08-19 (results below). Two riders open: D7 author
  line, D8 in-progress framing.

- ☑ S3.1 landed (2026-08-19): skeleton in repo — /index.html + css/ js/
  data/ img/; identity.phone stripped; résumé links → spans
  (data-resume-pending; restore to /DZResume.pdf when owner copies the
  email-only PDF — new item S17); portrait 1.8MB→133KB; probe matrix
  parity clean; gate green (grt-dir-core 2^32 divisor marked
  privacy-ok).

- ☑ Wave A (2026-08-19): two-theme production setup — inline no-flash
  head script (override key `theme`, else prefers-color-scheme, markup
  default = no-JS fallback); light/dark toggle on the identity line;
  5 exploration themes + scaffold bar + presets/viewport controls
  removed; fonts trimmed to the 6 shipped families; skeleton.js
  rewritten production-clean. Verified: toggle sets + persists across
  reload, keyboard nav intact, matrix clean, gate green.

- ☑ Wave B (2026-08-20): hash routing live (#/slug, #/slug/doc;
  replaceState; restore on load + hashchange; slugs already final:
  cinr/grtcache/melioraos/okibi/splat) — probe-verified set/deepen/
  navigate/reload-restore/clear; GRT8T warm-start moved to
  requestIdleCallback (same 200ms, off first paint); head complete
  (title, description, OG/Twitter, DZ favicon.svg — ruled title, not
  README task 7's stale one); Stanford bunny credit in cINR Reference
  (README task 8). Matrix clean both themes.

- ☑ Wave C (2026-08-20): ALL of G2–G11 cleared + S1–S15 + R1–R3,
  R5–R11, R13–R15, R17–R18, behaviorally verified via probe:
  Animation-off byte-frozen; GRT reduced-motion byte-frozen (engage-to-
  animate); no-JS doc faces render; mobile sticky (strip top 86 after
  1200px scroll, was −101); mobile hero stacked with legible labels;
  section tabs scroll+spy; chips wired truthful (Running/Held both
  cards); slots titled MelioraOS/Okibi/SPLAT "under construction"
  (f6/f7 dead markup deleted); rejection ¶ + in-progress + team line
  rewritten from vetted facts; academic record block restructured
  (HS marked recollection; conferral note); JP bare at D0; grid =
  vendored snapshot (no third-party fetch; "as of Aug 20, 2026");
  image-slot.js deleted (404 gone); figure colors → tokens
  (--render-well/--render-paper/--ray-warm); elide helper; Richtmyer;
  unranked-sweep relabel; covq trend lines at doc covers; mobile tier
  tags; owner additions: portrait P3→sRGB fix, icon toggle, affordance
  ruling applied.
  Skipped, recorded: R12 (NRC chip from queryRay — 2D choreography has
  no real ray to query; random tint stays, pane is labelled an
  architecture diagram) · R16 documented not raised (DPR comment) ·
  vz timeline dotted-lead (bar already runs off the chart edge; d-text
  says "start unrecorded") · R4/hero-spp + chipline "compared in place"
  wording — Wave D owns the hero's honesty rebuild.

- ☑ Owner reactive rounds (2026-08-20), all probe-verified: toggle →
  segmented sliding switch pixel-pinned to the text (both widths);
  cache-busting ?v=2 + no-store dev server (stale-mix root cause);
  portrait P3→sRGB + tint grade; About header rework (portrait fills
  band, bio adjacent, elastic middle, symmetric padding, rside
  space-between, integer heatmap cells); JP (~N4) both depths; bunny =
  ONE persistent render migrating card↔demo (mode-aware renderer,
  chase-FLIP with monotonic clamp — trace-clean both directions); morph
  performance (window.__morph/body.morphing loop-holds, debounced
  refits — avg ~17ms frames); ArrowDown honors focused card; probe
  gained trace/frames steps. Riders for owner return: portrait grade is
  a taste knob; black-hole companion decision comes with Wave D.

- ☑ Wave D core (2026-08-20, autonomous): G1 CLEARED. Real data: Open
  SciVis supernova (Blondin — the research repo's own benchmark volume,
  vendored from its local copy; 432³→54³ box-filtered uint8, 205KB
  module with provenance header; RealVol trilinear subclass feeds the
  shared radiance pipeline, so seeding/lighting/training all run on
  real structure). Honest hero: right = unbiased 1-spp HT estimator
  (full march computes EXPOSURE only), accumulating (.85 EMA — slow
  convergence IS the story); left = the cache's own 2× splat raster,
  luminance-matched (calib clamped, disclosed); energy-preserving
  footprint floor; smooth-vs-pixelated blits mirror
  continuous-vs-discrete estimators; labels "1 SPP, TERMINATED INTO
  IT"/"1 SPP, ACCUMULATING"; chipline + reference + foot rewritten;
  synthetic blend/exp4 deleted. Buttons: Supernova — real data (default)
  · Crab-like — analogue · Black hole — analogue. Verified: PSNR climbs
  (~17 dB), both themes, mobile stacked, matrix clean.
  RIDERS for owner: (a) Open SciVis license text re-verify before
  deploy (site unreachable at build); (b) drop-or-keep the black-hole
  analogue; (c) hero look/feel taste pass.

- ☑ Autonomous review round (2026-08-20): two adversarial agents
  (machinery+protocols; site code), findings re-verified first-hand,
  fixed, behaviorally proven:
  · Machinery: privacy-ok hatch scoped to phone-scan only; PDFs now
    word-scanned; archives hard-fail; denies hardened (git commit -n,
    compound push, hooksPath); probe asserts the theme seed took,
    gains --nojs with REAL assertions (opacity/scroll/text — the old
    isVisible check passed on an opacity:0 page), settle 1500ms;
    session-start now points at true ROADMAP state; ALL future-dated
    labels corrected to real dates incl. the public "as of" grid label
    (root cause: UTC CI timestamps misread as local); about-record
    bookkeeping audited — editorial prose neutralized, snapshot
    trimmed to real days; BRIEF per-unit VRAM + 1-spp + RTX 4090 lines
    (advisory channel now ZERO standing advisories).
  · Site code, launch-gating: no-JS page was BLANK (the D0 doc-snap
    rule out-specified noscript; now !important + layout resets —
    verified 11k chars readable+scrollable); GRT "in progress" tab
    dead + spy corrupted (prefix match — verified scroll 2324 + active
    tab); theme toggle left canvases wrong-theme (resize dispatch +
    per-frame token re-reads — pixel-verified dark pipeline).
  · Should-fix: "↑ the panel" now one level (D2→D1, verified); GRT
    hero no longer computes on hidden faces (iter frozen on Escape —
    and the matrix caught my first attempt's const-shadow crash,
    proving the gate works); doc cursor auto; mobile GRT tabs wrap;
    setCap drains to the readout's truth; ~330 lines of dead JS
    deleted (Nova, pixelPath, Field3/spark/sprites, grt8 trio, Vol3,
    resultPlot/railBars, audit(), to1/to2, #cread); rgba literals →
    GRT.alpha(token); 966GB→0.97TB threshold; chip honors morph-hold;
    as-of label renders under the D2 grid; SYSTEM margins/DPR text
    aligned to code.
  · Deferred, recorded: dead-CSS selector purge (risky sweep — final
    review scope); Okibi beta-vs-public wording + 11-vs-16 releases →
    first freshness sweep; morph jank re-measure on real hardware;
    REAL-DEVICE TOUCH remains the riskiest untested surface; commit
    26c8a8b+ (Wave D) still needs its focused review pass at final.

▶ NEXT ACTION: S16 owner copy pass + Wave-D-focused review inside the
final all-lens review → S4 deploy decisions.

## Triage results (owner, 2026-08-19 — law in RULINGS "content & voice")

- D1 delegated → vendored dated snapshot (grid label "as of <date>";
  freshness sweep refreshes). D2 → voice ruling: personal, lightly
  funny, not corporate; "wannabe researcher" stays; owner-involved copy
  pass added to S3 (About D0 bio, lede, + sections owner names).
- D3 → real feature, now BRIEF-vetted (task mortality headline; "A
  list that lets you forget"). G11 resolved: clause stays.
- D4 → no JLPT held. G9 resolution: D0 renders "JP" bare; depth says
  "intermediate — self-assessed ~N4 level; coursework JPN 001–003".
- D5 → KEEP the HS line. G10 resolution: move out of transcript-facts,
  mark "owner recollection — no HS transcript located".
- D6 → tier reads "under construction".
- D7 ☑ (2026-08-19): team line supplied — Angela Zhou + Daniel
  Zavorotny equal contribution; Bauer + Wu mentors; Ma lab director.
  BRIEF + RULINGS carry it; reference slot fills in the fix wave,
  role-honest form (no fabricated formal order).
- D8 ☑ (2026-08-19): owner's statement vetted into BRIEF; in-progress
  section rewritten from it in the fix wave — manuscript future-work
  items out, NEE-incompatibility conclusion + MCMC heuristic finding +
  quality work + VDB/scene extension in; equal-time NOT claimed.
- D9 → sourced (official conferral document, 11 Jun 2026). Block
  header → "Academic record"; about-record gains the source note.
- NEW S3 item S16: owner-voice copy pass (drafts by model, owner's
  wording wins) — About D0 bio line, About lede, other sections owner
  flags during the pass.

## Punch list

### Launch-gating (S3 must clear all; fixes known)

- G1 GRT hero comparison is synthetic theater with false "4 SPP / PATH
  TRACING" labels (grt7-a.js:73–85,114–115; disclosure buried at
  index.html:244). Resolution = the ruled launch gate: real integrators
  on the real dataset per handoff/DATA-HANDOFF (real n-spp tracer +
  real cache-terminated integrator, shared tone map, honest gap) — or
  strip the comparison framing and spp labels until that lands. NOTE:
  README tasks 1–11 omit this; recorded as S15.
- G2 cINR "Animation · on/off" is a dead control — st.paused is
  write-only (cinr-figs.js:164/168); wire it into frame().
- G3 No-JS renders a blank page (all .face opacity:0, .fl absolute, no
  noscript) — add ~12-line <noscript> style block stacking the doc
  faces (the mobile machine's shape).
- G4 Mobile 390 GRT hero illegible (desktop pane layout at any width;
  labels overprint) — stack panes vertically ≤~700px + caption elision.
- G5 Mobile sticky identity/strip broken — html,body{height:100%} +
  body.mob{overflow:auto} kills the sticky range; fix
  body.mob{height:auto;min-height:100%} (skeleton.css:5,114;
  reproduced: strip top −101 after scrollTo 900).
- G6 Band-2 slots ship numbered template meta-text ("One line. ≤40
  words…", "The same rectangle…", index.html:255,262-263,283) — retitle
  MelioraOS / Okibi / SPLAT, tier per D6, frame "Awaiting real
  material.", strip quantity/capability/plots chrome; fix slot D2 +
  mobile tab interiors too (lane-3 report has exact copy).
- G7 Rejection paraphrase mis-traced (index.html:220): asserts a
  parity/incrementality consensus; the summary review's actual
  objection is clarity + validation — above all the missing equal-time
  comparison. Rewrite around the summary's own points; owner
  voice-check at fix time.
- G8 In-situ compression asserted as performed — inside the Not-claimed
  block (index.html:152) and pipeline legend 1 (:98); the paper's DNS
  compression ran on one workstation, in-situ is the *enabled*
  workflow. Reword both.
- G9 "JP (N4)" unsourced (index.html:26,40) → "JP (intermediate)"
  unless D4 supplies a real JLPT result.
- G10 HS "~4.2 · ~366 units" renders under "Transcript facts" +
  "official transcripts available on request" (index.html:58;
  about-skeleton.js:39) while about-record marks it owner-recollection
  — move out of the transcript block + mark unsourced, or drop (D5).
- G11 Okibi "unfinished work burns to a permanent record"
  (about-skeleton.js:44) — unmapped product claim; owner confirms and
  it gets logged, or the clause is cut (D3).

### Owner decisions (D)

- D1 Contribution grid: vendored dated snapshot (RECOMMENDED — matches
  the no-fetch posture, no reader IPs to jogruber.de, freshness sweep
  refreshes it) vs keep live fetch (then README/State/fallback copy
  corrected and the privacy stance owns the exception).
- D2 About lede "Recently graduated MS student and wannabe researcher."
  — your verbatim words (stands per RULINGS 6) or reword? It undersells
  directly above a first-author honorable mention.
- D3 Okibi "burns to a permanent record" — real feature to log, or cut?
- D4 Japanese: hold an actual JLPT N4? Else "JP (intermediate)".
- D5 HS units/GPA line: keep, marked "owner recollection — no HS
  transcript located", or drop?
- D6 Slot tier wording: "in design" (matches tier grammar) vs "under
  construction" (owner's phrase). Recommend "in design".
- D7 GRT reference author-list + role line (owner slot): supply copy
  before launch, or the data-empty line is removed until it exists.
- D8 "In progress — toward resubmission": items 01–03 are the
  manuscript's future-work, not active campaigns (gsrc record shows
  NEE/cache-quality/memory/OpenVDB/composed-scenes). Reframe as "named
  open problems" vs "active now"? And is equal-time-comparison work —
  the objection the reviews demand answered — actually in the current
  sweep, so the list can say so?
- D9 MS award date "11 Jun 2026" under Transcript facts: keep marked as
  owner statement until the updated transcript lands?

### Should-fix (S3)

- S1 Rail/strip tier → "not accepted · revising" (alone, "submitted ·
  revising" is the softest reading; RULINGS plainness bar).
- S2 Manuscript cite → title-page title "GRTCache: Real-Time Radiance
  Caching Using Ray-Traced Gaussians" (site cites the filename).
- S3 Status chips unified + truthful on both cards (Running/Held wired
  to loop state; GRT's static "Live" is false when paused/reduced).
- S4 image-slot.js (65KB) → two <img> tags; kills the
  .image-slots.state.json 404 (NOT favicon — headless never fetches
  favicons).
- S5 GRT reduced-motion gate at GRT.loop + Cam.auto (cINR complies;
  GRT ignores RM entirely).
- S6 Enter/Space activation on cards + :focus-visible (amend production
  task 9 — role=button without activation is an ARIA violation).
- S7 Canvas captions must elide, never truncate (card mini + world
  legend clip at 1280; SYSTEM drop-order: caption drops first).
- S8 D1 doc-cover: repeat the three trend chips under the lede (D1 Q2
  unanswered in-view; matters once hash deep-links land) — or owner
  rules D0 satisfies it.
- S9 Mobile doc header carries the tier ("/cinr · peer-reviewed") —
  strongest credential missing from mobile first screen.
- S10 About publication block: add arXiv + code links (BRIEF).
- S11 Color literals → tokens (#E8A24C ×4, #0a0d11 ×6, #E4DFD4, #888).
- S12 "6 AS degrees"/"6 AS" → "6 assoc. degrees" (econ is AA-T;
  about-skeleton.js:411,548).
- S13 Coursework strings: "generative models" → record's actual course
  name; "up to seven courses a term" drop-or-source
  (about-skeleton.js:37–38).
- S14 Unknown-start convention on vz/hs timeline branches (dotted lead
  + owner phrasing "started around fifteen — résumé says 2021"); drop
  derived "at age 16" (about-skeleton.js:39,42,50,162–171,198–207).
- S15 Record README supersessions in handoff/IMPORT.md (don't edit the
  frozen spec): grid fetch reality; task-11 "do not fill slots"
  superseded by titled-slot ruling; hero real-integrator task added;
  task-7 head title → ruled "GPU & Machine Learning engineer".

### Refinement (S3-cheap or design-lane)

R1 "~2×" harmonize (index.html:75, cinr-figs.js:460) · R2 Richtmyer
spelling (paper internally inconsistent; use "Richtmyer" + source note)
· R3 record-size caveat "as rendered (paper's up-scaled test set)" ·
R4 hero spp (4 vs 1-spp ruling) — resolve at rebuild · R5 "first-come"
→ "unranked sweep" or true arrival order · R6 PSNR meter noun → "THE
CACHE — PSNR VS TRUTH FIELD" · R7 "REFERENCE — CONVERGED" → truth-field
label or noise-free march · R8 mini label "LIVE, TRAINING" false after
iter 900 → "TRAINED LIVE IN THIS PAGE" + wire/delete #grt-chip ·
R9 "analogues in the method's own loop" → "…not the paper's
ray-estimated targets" · R10 "N GAUSSIANS UPDATED" → TOUCHED ·
R11 per-bounce windows → "smoothed per depth — an analogue" · R12 NRC
output chip from queryRay instead of random · R13 section tabs:
scroll-spy or drop (inert; clip at 390) · R14 delete dead
RawVol/StarVol (live API URLs) · R15 loading="lazy" on Quality
Results.png · R16 DPR cap 1.25 vs documented 2 — raise or document ·
R17 digitized-curve provenance note (cinr-trace header discloses ~4%
calibration gap) · R18 timeline wording ("end of summer 2025", "since
mid-2025") · R19 band-boundary tint perceptibility — design-round
question, stays open · R20 wannabe-researcher lede → D2.

### Verified clean (evidence in lane reports)

Depth machine, wheel commitment, drag-vs-click, theming, console
health, mobile strip nav — pass. Word budgets hold. D2 order (method →
evidence → limits → artifacts) holds. Quantitative record exact. §2i
dark wells "read, but barely" — shippable. Task-6 description accurate
vs code (~0.6s measured). Honorable Mention + presentation date
publicly corroborated.
