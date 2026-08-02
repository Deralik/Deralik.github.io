# Design brief

## What this site is

The technical home of Daniel Zavorotny — GPU & rendering engineer with
published research and shipped products. It exists to make a hiring
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
- One signature visual moment is worth designing for (candidates: a
  full-bleed volume render as the research page hero; a live-scrubbing
  clip of the Meliora Gantt; later, the interactive demo).

## Page inventory (starting point — Claude Design may propose better)

1. **Home** — who I am in two sentences, the four project cards in
   positioning order, contact (public email + GitHub + LinkedIn only).
2. **Research: cINR** (flagship) — the paper story with figures.
3. **GRTCache** — the follow-on research story (honest framing below).
4. **Meliora** — product + engineering-process story.
5. **Okibi** — small, personal, correctness-focused.
6. **SPLAT** — the learning-system story.
7. **About / Resume** — short bio, spoken languages, resume PDF link
   (email-only variant, provided file — never generated here).

## Vetted fact packs (the only claims the site may make)

**cINR — EGPGV 2025, first author, Honorable Mention.**
"From Cluster to Desktop: A Cache-Accelerated INR Framework for
Interactive Visualization of Tera-Scale Data" (arxiv.org/abs/2504.18001,
code: github.com/VIDILabs/cINR). Multi-resolution GPU cache over a neural
volume representation; average 5x ray-marching speedup over the prior
state of the art on a single RTX 3080Ti; 0.96 TB fluid-simulation dataset
compressed to a 150 MB model (6444:1, 35 dB PSNR) and explored
interactively at over 90 FPS on desktop hardware. Do NOT claim: cluster/
distributed compute, authorship of the underlying wavefront renderer.

**GRTCache (research in progress).** Rebuilt a neural radiance cache
around ray-traced 3D Gaussians (CUDA/OptiX); benchmarked head-to-head
against the neural baseline from one binary: matched image quality with
5x fewer training updates and 11.7x less cache memory. Do NOT claim: that
it beats the baseline in speed or overall — the honest story is rigorous
measurement, including where the idea loses.

**Meliora (melioraos.com).** Construction-management platform built solo —
50k+ lines — from first commit to a general contractor using it in
production in 47 days. The distinctive story is the disciplined
agent-driven process: design docs as source of truth, automated quality
gates, tests pinned to a hand-written financial spec, adversarial review.
Screenshots: Dev-workspace seed data ONLY.

**Okibi (okibi.app).** Personal task manager shipped end to end; two-way
Google Calendar sync designed so a sync conflict can never destroy user
data ("absence is never evidence" deletion rule); 11 releases in its
first seven weeks. Screenshots: demo tab only.

**SPLAT.** An agent-authored curriculum taking me from SE(3) state
estimation to Gaussian-splatting SLAM — staged roadmap, written exams,
reproducible environments, acceptance tests defined before each
hand-written solver. Do NOT claim or imply: any working perception
system, SLAM, hardware, or robot. Prerequisite before this page links the
repo: fix SPLAT's README (it currently describes the end-state in present
tense).

## Demos — scoped honestly

- **v1 (site launch):** stills and short screen-capture clips. Research
  pages use existing renders (see `assets/shots.md` for disk locations);
  Meliora gets a Gantt-interaction clip; Okibi a calendar-sync moment.
- **v2 (post-launch project):** an interactive in-browser demo (WebGPU
  volume raymarcher on a downsampled dataset, or a GRT cache visualizer).
  Genuinely impressive, genuinely a project — the site never waits on it.

## Constraints

- Static site on GitHub Pages (repo named `Deralik.github.io` serves at
  the root URL; any other name needs a custom domain or lives at a
  subpath).
- Dependency-light implementation; fast on a phone; readable without JS.
- Public email only. No analytics that require a cookie banner.
