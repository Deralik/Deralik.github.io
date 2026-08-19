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
  top-right; the cache-only inset is dropped.
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
