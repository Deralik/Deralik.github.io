# cINR — context sheet for design sessions

## What it is (vetted facts — BRIEF.md is authoritative)

EGPGV 2025, first author, Honorable Mention: "From Cluster to Desktop:
A Cache-Accelerated INR Framework for Interactive Visualization of
Tera-Scale Data" (arxiv.org/abs/2504.18001; code
github.com/VIDILabs/cINR). A multi-resolution GPU cache over a neural
volume representation; average 5× ray-marching speedup over the prior
state of the art on a single RTX 3080Ti; a 0.96 TB fluid-simulation
dataset compressed to a 150 MB model (6444:1, 35 dB PSNR) and explored
interactively at over 90 FPS on desktop hardware. Do NOT claim:
cluster/distributed compute, or authorship of the underlying wavefront
renderer.

## Site presence — interactive demo first (owner decision 2026-08-02)

The cINR page hero is a **demo slot**: an in-browser multi-resolution
volume renderer on a small, pretty, redistributable dataset — owner's
current candidate: the **temperature-distortion cube** (dataset location
to be pinned during the demo/re-render session). Staging:

1. Bricks precomputed **directly from the raw volume** (small data needs
   no INR training) stream into a visible coarse → fine refinement while
   the view stays interactive — the multi-res pipeline behavior, honestly
   labeled an illustration, linking the real code.
2. Optionally later: the brick source swaps to real INR decode (a small
   model trained with the actual cINR pipeline), making the demo run the
   paper's idea for real. Same UI shell either way.

The page around the slot is the paper's narrative: the terabyte → model
→ interactive story, with figures. v1 ships the slot filled by a
poster/clip of the same demo dataset.

## Visual material

None attached by choice: legacy research renders were rejected as design
anchors (they show content the site won't). Design the slot, captions,
and controls chrome from this sheet; renders of the demo dataset arrive
once the demo work starts.
