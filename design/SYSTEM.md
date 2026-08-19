# Design system — SOURCE OF TRUTH for implementation

Settled by the 2026-08 rounds (handoff 2026-08-18). Implementation must
match this file; changing the design means changing this file first.
This file states what is IN FORCE; dated reasoning lives in RULINGS.md;
the port mechanics in handoff/README.md + handoff/skeleton-notes.md.
**Values live in `skeleton-tokens.css`** (design reference now; the same
file in the repo once ported) — this file never restates a hex.

## Invariants (owner-agreed; hold everywhere)

- Nothing moves and nothing decorates unless it demonstrates something
  true about the work; every animation is evidence.
- Every number traces to BRIEF.md's fact packs; demos, comparisons, and
  illustrations carry honest labels stating exactly what is running.
- Figures compute live in the page or are honestly-labelled empty slots;
  screenshots/video never stand in for demos.
- Fast static pages; no build system, no framework, no analytics
  requiring a cookie banner; degrades readably.
- Research leads in every layout (band 1); "add a section" is a boring,
  first-class operation (a partition entry).

## Architecture — the depth machine

One page, three depths: D0 dashboard (About column + weighted card
partition in two bands) → D1 opened panel + rail → D2 document + strip.
`PARTITION` in `skeleton.js` is the only place composition lives; ship
preset `'6 · as built'`. Wheel commitment crosses depths; ↑/↓/1–7/Esc
keyboard-navigable. The band boundary is a change of ground and nothing
else. Mobile (≤~700px) is a separate machine: locked at D2, sticky
project strip, no dashboard — designed deliberately, reviewed always.

## Type & color

Two themes ship: light = `h-transit` (Lexend / Literata / Fragment Mono),
dark = `k-matrix` (Syne / Vollkorn / Red Hat Mono). Default follows
`prefers-color-scheme`; a small toggle on the identity line writes a
localStorage override; theme is set by an inline head script before CSS
paints (no flash). **No color or font is written outside
`skeleton-tokens.css`** — the JS reads tokens at runtime, so a theme swap
re-themes canvases automatically. Accent registers: `--acc`/`--accw` mean
RUNNING and nothing else; `--pa-1…7` are per-project accents, legal only
inside that project's own figure. GRT field sprite tints are
theme-independent (radiance palette) — correct, keep.

## Layout & content density

The figure is the field: 136px floor, grows first; content drops in order
caption → prose → quantities → capability chip; title and tier never
drop. Word budgets: ≤40 words per project at D0, no paragraph over 25.
Page tops stay spare; reference material lives at D2, same place every
section. D0 cards carry trends, never dataset figures.

## Components

Faces (panel / rail / strip / doc) per field · status chip (RUNNING
register) · control rows: static labels, state as dark fill, sliders not
+N buttons, right-aligned readouts, never reflow · figure legends
(`.plegend`, numbered) · `image-slot` custom element for image
placeholders · honest empty slots (`data-empty`, dashed "awaiting real
material") · comparison panes: exactly one bottom-left explanation line
("NAME — claim · instruction").

## Motion & interaction

Hero demos animate; method figures draw once (resize redraw only). Demos
self-run and yield to the user on interaction, resuming a beat after they
stop (the bunny pattern). Card canvases: drag turns the figure, click
opens the project (6px click-suppression pattern — preserve on anything
similar). 3D drag grabs the volume (inverted deltas, inertia); hero
cameras ease back to orbit ~1 s after release; camera drags gated to the
image rect. Figure loops gate on IntersectionObserver (±300px), DPR
capped at 2. `prefers-reduced-motion` pauses autorotation and card loops.
No scroll hijacking; the wheel-commitment depth change is reader-driven
navigation (open clause in skeleton-notes §7 — unratified).

## Figure vocabulary

Method figures: zone washes with role titles, ink boxes, thin numbered
arrows keyed to a legend, dashed rare paths. Geometry must mean
something; every ring/glyph carries its purpose written adjacent. Truth/
reference views read as data — dimmer and more structured than the cache
view. Learning meters: PSNR in dB, higher-is-better. A rendered image
never shows gaussians. Cache views glow like the field they learned.

## Open items (carried from skeleton-notes)

- §2i dark-theme wells read but barely (one step darker + hairline) —
  unproven.
- The morph-as-navigation motion clause — proposed, unratified.
- Partition floor: the field count at which band 2 must become something
  else — undecided.
- Whether tint alone communicates the two-band boundary — untested.
