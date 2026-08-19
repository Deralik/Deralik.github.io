# S2 — retrofit audit ledger (live; delete when S2 ships into S3)

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
- ⚑ Owner triage — decisions D1–D9 below block or shape S3.

▶ NEXT ACTION: owner answers D1–D9; then this file becomes the S3 port
ledger (launch-gating + should-fix as work items).

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
