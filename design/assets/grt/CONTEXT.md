# GRTCache — context sheet for design sessions

## What it is (vetted facts — BRIEF.md is authoritative)

Research in progress. Rebuilt a neural radiance cache around ray-traced
3D Gaussians (CUDA/OptiX); benchmarked head-to-head against the neural
baseline from one binary: matched image quality with 5× fewer training
updates and 11.7× less cache memory. Do NOT claim: that it beats the
baseline in speed or overall — the honest story is rigorous measurement,
including where the idea loses.

## The tone that matters (for design context)

The project's native artifacts are aggressively honest benchmark plates
— figures that headline their own caveats ("equal exposure; update
budget mismatch", "mixed quality signals — no aggregate winner") and
sign themselves with a SHA-256 of the analysis inputs. The page's
narrative is measurement discipline; that tone is raw material for the
site's visual language even though the plates themselves are not
attached as design anchors.

## Site presence — interactive demo first (owner decision 2026-08-02)

The GRT page hero is a **demo slot** like cINR's: a small in-browser
demo on a public redistributable dataset — owner's current candidate:
the **OpenVDB cloud bunny** (verify the sample-model license before
shipping) — or another small public dataset. Precompute what the demo
needs directly from the raw data. Honesty constraint: the real system
ray-traces Gaussians with OptiX; whatever the browser demo does instead
(rasterized splats, precomputed views, a simplified volume) must be
labeled as exactly that, linking the honest framing back to the
research. v1 ships the slot filled by a poster/clip of the same dataset.

## Visual material

None attached by choice (same reasoning as cINR). Design the slot from
this sheet; demo-dataset visuals arrive with the demo work.
