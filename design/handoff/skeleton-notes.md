# Skeleton — how it is put together

Direction N's navigation, with every piece of content removed and replaced by a
labelled slot. Four files:

| file | holds |
|---|---|
| `Skeleton v1.html` | the markup: 8 fields (About + 7), each with 4 faces |
| `skeleton-tokens.css` | **every colour and face, four themes.** Nothing else in the project names a colour |
| `skeleton.css` | structure. No colour literals, so a theme swap cannot miss anything |
| `skeleton.js` | the depth machine, the partition config, the measured readout |

## Changing things

**A theme** is one block in `skeleton-tokens.css` — copy a block, rename the
`[data-theme="…"]` selector, and it appears in the picker by itself. If it names
a face nothing else uses, add that family to `skeleton-fonts.css`.
Each theme owns two accent registers: `--acc`/`--accw` (one job — RUNNING) and
`--pa-1…7`, the per-project accents, legal only inside that project's figure.
`--asserted` is the second band's ground, and the only thing marking the two
bands apart.

**The composition** is the `PARTITION` object in `skeleton.js` — `b` is the band
(1 = checkable, above the boundary; 2 = asserted, below), `w` is the share within
the band. Band height comes from the band's total weight; width within a band from
the field's weight. Three presets ship, including `4 · merged`, which is the
"all publications in one field" case drawn.

**cINR (field f1)** is filled per `cinr-section-plan.md`: markup in
`Skeleton.html`, figures in `cinr-figs.js` (shared with the mocks page),
wiring in `cinr-skeleton.js`, structure in `cinr-skeleton.css`,
voxel data in `bunny-grid.js`. In-figure flashes use `--pa` (the field's
project accent); `--acc` remains the chip's RUNNING register only. One
figure computes at a time — focus follows the visible face, pointer takes
it — and a rAF-delta probe is the check after any render-loop change.

**Slots** are `[data-slot]` with `data-empty`. Remove `data-empty` and put real
material in; the readout counts what is left.

## The themes

Seven, and none is a recommendation. `paper` is the only one carried forward from
rounds 2–3; `drafting`, `well` and `bureau` were drawn at random to keep the set
from converging on one taste; `j-console`, `h-transit` and `k-matrix` are the
palettes the owner picked out, read from those round files rather than recalled.

In the three inherited themes most values are the round's own hexes. What was
derived, because the skeleton's token contract asks for something the round never
defined, is named in a comment above each block — J had no mid-weight prose tone
or on-dark accent, H had no dark ground at all, K needed a well darker than its
own darkest ground.

## Decisions already made in the skeleton

- **The boundary is a change of ground and nothing else** — no rule, no label
  (owner's call). `--band1` is the whole of the signal — it tints the checkable
  band and the asserted band keeps `--paper` — so it is its own token per theme
  and can be tuned without moving any other surface. This reopens N's
  risk 01: the axis is now quieter than it has ever been, and nothing on the
  dashboard names it. Whether a reader infers the two bands from tint alone is
  untested.
- **No style value is written outside `skeleton-tokens.css`.** No hex, no family,
  anywhere else in the project — checked, not asserted. Faces are listed once in
  `skeleton-fonts.css`; no HTML file names a font. Adding a theme is one block in
  the tokens file: the runtime reads the theme list out of the stylesheet, so a
  name is never written twice.
- **The figure is the field.** It has a 136px floor and grows first. Everything
  else drops around it, by measurement, in this order: caption → prose →
  quantities → capability chip. Title, tier and figure never drop. The readout
  says how many fields are dropping anything, so the floor is observed rather
  than promised.
- **Mobile is a different machine, not a narrower one.** Locked at depth 2: the
  strip is always on top, there is no dashboard, and the return-to-panel control
  is absent because there is no panel to return to. Inspectable from a desktop
  via the scaffolding's Viewport control.
- **No depth gauge in type.** The rail's position on the panel edge is the gauge;
  a second one in words was redundant and sat on the last field's prose.

## Still open

1. **§2i vs two grounds.** Both dark themes are the test case — `well` and
   `k-matrix`. A dark ground makes §2i's reserved dark rectangle nearly
   illegible, so in each the renderer's well is set one step darker than the
   ground and keeps a hairline. It reads, but barely. Unproven.
2. **§7 and the morph.** The depth change is reader-driven navigation, not a
   mechanism doing its work. Proposed clause, unratified: *a motion may also be
   the navigation itself, when the reader drives it, it stops when they stop, and
   nothing moves without a gesture.*
3. **Where the partition's floor is.** `8 · scaling test` shows fields dropping
   slots; nobody has decided the count at which the asserted band should become
   something else.
