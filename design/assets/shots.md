# Asset capture list

Naming: `assets/<project>/<nn>-<slug>.<ext>`. Curate hard — 3–5 great
images per project beat fifteen adequate ones.

## Safety rules (repeat of CLAUDE.md — they matter)

- **Meliora: Dev workspace seed data ONLY.** The customer's tenant never
  appears in a public repo, cropped or otherwise. Seed fixtures exist in
  the Meliora repo (`scripts/seed.mjs`) if the Dev workspace looks empty.
- **Okibi: demo tab only** — never personal task data.
- Research images are renders of public scientific datasets — fine as-is.

## Meliora (browser capture, logged in, ~1500px wide, light theme)

- [ ] 01-gantt-overview — a project schedule with several trades,
      dependency arrows visible, one blocking badge
- [ ] 02-gantt-drag (short clip, ~6 s) — dragging a stage, arrows
      re-routing live
- [ ] 03-projects-view — the projects workspace in browse mode
- [ ] 04-drawer — a stage drawer open over the Gantt
- [ ] 05-files (optional) — the files tree

## Okibi (browser capture, demo tab)

- [ ] 01-weekly — the weekly view mid-week
- [ ] 02-calendar-sync — a task and its synced calendar event
- [ ] 03-welcome — the public welcome page

## Research (copy from disk; convert EXR→PNG; pick hero-quality only)

Known locations (read-only sources):

- `~/GitHub/gsrc/screenshots/` — GRT/renderer EXRs (through 2026-07-22)
- `~/GitHub/gsrc/eval/research_bench/*_figures/` — benchmark figure PNGs
- `~/GitHub/cINR_env/flip/` — DNS render comparisons + FLIP difference
  images (`flip.dnsRM*.png`, `flip.dnsPT*.png`)
- The paper's own figures (arxiv.org/abs/2504.18001) for layout reference —
  re-render hero images locally rather than lifting paper PDFs.

- [ ] cinr/01-hero — one full-quality DNS or Miranda render (candidate
      signature image for the site)
- [ ] cinr/02-scale-story — figure pairing the 0.96 TB → 150 MB numbers
- [ ] grt/01-render — a GRT-cache render
- [ ] grt/02-comparison — side-by-side vs baseline (honest labels)
- [ ] (optional) a short orbit clip captured from the local renderer

## SPLAT

No visuals exist; none get faked. Optional single figure: the curriculum
stage ladder, drawn in the site's own design language.
