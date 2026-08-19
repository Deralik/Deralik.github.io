# Design brief

## What this site is

The technical home of Daniel Zavorotny — GPU & machine-learning engineer
(site identity line: "GPU & Machine Learning engineer", owner 2026-08-18)
with published research and shipped products. It exists to make a hiring
manager think "this person does real work and explains it well" within
thirty seconds, and to reward the one who stays twenty minutes.

Audience, in order: national-lab / FFRDC researchers, defense-startup
engineers, GPU-company engineers, then recruiters routing to those people.

## Tone and visual direction

- Product-grade polish in the MelioraOS/Okibi lineage: clean type,
  restrained palette, generous whitespace, fast pages.
- Eye-catching where the *content* is the eye candy — real renders, real
  UI captures, short clips. Never decorative imagery.
- No marketing tone. No "passionate," no "innovative," no exclamation
  points. The work speaks in the indicative mood.
- One signature visual moment is worth designing for. (Settled 2026-08:
  the depth machine itself and the live in-page research figures are the
  signature — SYSTEM.md.)
- **Governing motion principle (owner, 2026-08-02): nothing moves and
  nothing decorates unless it demonstrates something true about the
  work.** Every animation is evidence. Screenshots/clips are raw
  material, not the presentation; distinctive motion and live or
  abstract demonstrations carry the projects. Four candidate directions
  + the exploration process live in design/iterations/01-2026-08-02.md.

## Structure (settled by the 2026-08 design rounds — one page, three depths)

The site is a single page, the **depth machine** (spec:
design/handoff/README.md; goals and per-view questions: design/CONTRACT.md):

- **D0 — dashboard**: fixed About column (portrait, bio line,
  availability, contact, contribution grid, history figure) + project
  cards in two bands. Band 1, *checkable* work: cINR, GRTCache. Band 2,
  *asserted* work: MelioraOS → Okibi → SPLAT (owner order, 2026-08-18).
  Cards carry a live figure + trends, never dataset numbers. Undesigned
  band-2 cards ship as titled, honestly-labelled under-construction slots.
- **D1 — panel**: a clicked card expands; the others become a rail.
- **D2 — document**: the full technical narrative per project; About's D2
  carries the timeline, the **publications block** (EGPGV 2025: title,
  venue, honorable mention, DOI/arXiv/code links), transcript facts, and
  the resume PDF link (email-only variant, manually provided file — never
  generated here).
- **Mobile** (≤~700px) is its own machine: locked at D2 with a sticky
  project strip; no dashboard.

The structure must accommodate future sections — more publications,
talks, new projects — without a redesign; "add a section" is a
first-class, boring operation (a new field in the partition config).

## Vetted fact packs (the only claims the site may make)

**cINR — EGPGV 2025, first author, Honorable Mention.**
"From Cluster to Desktop: A Cache-Accelerated INR Framework for
Interactive Visualization of Tera-Scale Data" (arxiv.org/abs/2504.18001,
code: github.com/VIDILabs/cINR; authors: D. Zavorotny, Q. Wu, D. Bauer,
K.-L. Ma). Multi-resolution GPU cache over a neural volume
representation; average 5× ray-marching and roughly 2× path-tracing
speedup over the state-of-the-art pure-INR renderer (paper results;
verified 2026-08-18), measured on a single RTX 3080Ti (12 GB); 0.96 TB
fluid-simulation dataset compressed to a 150 MB model (6444:1, 35 dB
PSNR) and explored interactively at over 90 FPS (DNS case study: 91.8
avg FPS ray-marching with the cache; the per-dataset record behind the
site's record table). Do NOT claim: cluster/distributed compute,
authorship of the underlying wavefront renderer.

**GRTCache — second author (equal weight with the first author);
manuscript submitted to HPG '26, not accepted, under revision — stated
plainly on-site.** Team (owner statement 2026-08-19): Angela Zhou and
Daniel Zavorotny (equal contribution — she led the writing, he led the
coding initially), mentored by David Bauer and Qi Wu; Kwan-Liu Ma
directs the lab (final review). Rebuilt a neural radiance cache around ray-traced 3D
Gaussians (CUDA/OptiX): an explicit, interpretable, world-space cache,
benchmarked head-to-head against NRC and GSCache from one binary with
matched termination (C = 0.03). Manuscript record — always labelled
on-site as "the manuscript's numbers, not yet peer-verified": cache
≈28 MB (ours) vs ≈382.7 MB (NRC) vs ≈423.9 MB (GSCache); peak VRAM
5.1 / 3.2 / 6.4 GB in the same order; runtime slower than NRC, faster
than GSCache; quality ≈ NRC, slightly behind GSCache. PCD init: 125k
surface samples, MCMC cap 300k, init 1.37 s. Current work (owner
statement 2026-08-19, no new numbers): NEE implementation improved, and
NEE-only training samples explored to the working conclusion that they
may be fundamentally incompatible with the method — they provide
different training targets; the 3DGRUT-inspired MCMC
relocate/add heuristic may be incorrect for live training (it assumes
pre-training from images); minor method improvements landed but the
results' general trajectory matches the paper; actively exploring
reconstruction-quality improvements; extension work: other data types
(VDB, multi-object scene data); and a possible new story direction —
a novel application or something exploiting the method's structural
difference vs existing caches. Equal-time comparisons are NOT claimed
as running. Do NOT claim: acceptance, an aggregate or speed win over
NRC, or first authorship. (Supersedes the pre-manuscript "5× fewer
updates / 11.7× less memory" line, 2026-08-18; a re-comb of the current
research repo may refine these numbers later.)

**Meliora (melioraos.com).** Construction-management platform built solo —
50k+ lines — from first commit to a general contractor using it in
private beta in 47 days. The distinctive story is the disciplined
agent-driven process: design docs as source of truth, automated quality
gates, tests pinned to a hand-written financial spec, adversarial review.
Latest release: v1.0.0-beta.11 (2026-07-25) — file management, optional
user-owned Google Drive storage (CHANGELOG-sourced). Never "in
production" — private beta. Screenshots: Dev-workspace seed data ONLY,
and per RULINGS they are design-round reference, not site content.

**Okibi (okibi.app).** Personal task manager shipped end to end; the
headline feature is task mortality — unfinished tasks burn away into a
permanent record; the slogan is "A list that lets you forget"
(owner-confirmed 2026-08-19). Two-way Google Calendar sync designed so
a sync conflict can never destroy user data ("absence is never
evidence" deletion rule); 11 releases in its first seven weeks.
Screenshots: demo tab only.

**SPLAT.** An agent-authored curriculum taking me from SE(3) state
estimation to Gaussian-splatting SLAM — staged roadmap, written exams,
reproducible environments, acceptance tests defined before each
hand-written solver. Do NOT claim or imply: any working perception
system, SLAM, hardware, or robot. Prerequisite before this page links the
repo: fix SPLAT's README (it currently describes the end-state in present
tense).

## Demos — scoped honestly

Figures compute live in the page or are honestly-labelled empty slots;
screenshots and video never stand in for demos (RULINGS 1). Browser demos
are not expected to implement the papers' methods 1:1 — but the
approximations made for efficiency must never produce misleading
behavior, and every demo's label states exactly what is running (owner,
2026-08-18; rubric: REVIEW.md). The site never waits on any demo.

- **cINR demo (shipped in the design):** a raymarcher over a
  multi-resolution brick pyramid of the Stanford bunny (decimated,
  voxelized 48³ — credit the Stanford 3D Scanning Repository on-page),
  cache visibly filling coarse → fine, honestly labelled an illustration
  of the pipeline, linking github.com/VIDILabs/cINR. Stage 2 remains the
  post-launch ambition: the brick source swaps to real INR decode (small
  model trained with the actual cINR pipeline, WASM or WebGPU; the
  temperature-distortion cube is the dataset candidate) — at which point
  the demo genuinely runs the paper's idea.
- **GRT demo (launch gate, owner 2026-08-18):** ships on REAL volume data
  — a nebula-class public dataset with structure the cache can visibly
  learn, converted offline per design/handoff/DATA-HANDOFF.md (licenses
  verified, credited on-page). The "black hole" companion volume gets a
  real-data feasibility check with options presented before launch
  (labelled procedural analogue, or dropped). No with/without comparison
  ships unless the difference shown is real output of the shown
  computation — the exploration's hand-tuned synthetic blend does not
  survive to production (DATA-HANDOFF flags the specifics).

## Constraints

- Static site on GitHub Pages (repo named `Deralik.github.io` serves at
  the root URL; any other name needs a custom domain or lives at a
  subpath).
- Dependency-light implementation; fast on a phone; readable without JS.
- Public email only. No analytics that require a cookie banner.
