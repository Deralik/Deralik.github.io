# Changelog

One short entry per release (a push the owner makes to the live branch).
Newest first. Pre-launch work is tracked in design/ROADMAP.md, not here.

## 2026-08-22 — first public release (deralik.github.io)

- GRTCache section rebuilt for release: live hero (two 1-spp estimators
  vs a full-march reference; butterfly · ring · supernova), anisotropic
  gaussian cache trained in-page, scene-faithful lighting and display,
  light/TF/orbit controls, D0 card runs the butterfly cache with
  training rays (pre-baked snapshot until the background build lands).
- First-visit performance: volume builds moved to a worker; total
  blocking time 724ms → ~70ms; fonts direct-linked; scripts deferred.
- MechHand dataset removed (owner call); supernova carries the
  real-data story — its reuse terms remain the launch gate.
- Résumé PDF follows in the next release (placeholder self-activates).
