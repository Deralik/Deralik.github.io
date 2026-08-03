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

Capture the platform's breadth — one shot per surface — then curate for
the page. Every shot: Dev workspace, seed data visible, no customer rows.

Captured 2026-08-02 from localhost:3000 (dev instance, light Classic
theme, 1514px viewport). **Caution: the dev workspace contains a few
mirrored real-world rows** (a real client project and at least two real
subcontractor names) — every capture below was vetted frame-by-frame;
two surfaces are withheld until those rows are cleaned or renamed.

- [x] 01-dashboard — widget grid; fixture rows only
- [ ] 02-leads — **captured but WITHHELD**: the won column shows the
      real client project + client name and a real sub. Clean the rows
      (or archive them out of Dev), then recapture.
- [x] 03-projects-board — kanban across phases; all fixtures
- [x] 04-schedule-tab — gantt with red blocking chain (Electrical →
      Drywall → Tile floor), seed bars, milestone diamond, bank shelf
- [x] 05-gantt-drag.gif — 5-frame state sequence: drag Tile floor out
      (arrow re-routes AND unblocks — "2 blocked" → "1 blocked"), drag
      back (restores). Honest but not fluid; a smooth screen-recorded
      clip can supersede it for the site itself.
- [x] 06-stage-drawer — blocked stage: dates, sub, "waiting on" note,
      cost, punch list, tasks
- [x] 07-finance-tab — milestone schedule + trade-grain cost build-up
- [x] 08-change-orders — CO cascade lanes + RFI blocking a stage
- [x] 09-files-tab — trade rail + typed document columns
- [ ] 10-contractors — **captured but WITHHELD**: real sub names appear
      beside [fixture]-tagged ones. Rename/remove them in Dev, recapture.
- [x] 11-schedule-lens — cross-project axis (sparse window; could
      recapture scrolled into a denser stretch)
- [x] 12-finance-lens — margin trajectory + job economics
- [x] 13-command-palette — jump-to/create state
- [x] 14-tasks — typed portfolio workbench (bonus shot)

Note for final site curation: the project header in 04/06/etc. shows the
fixture client's contact line (a reserved-fictional 555 phone number and
an example.com email) — fake by construction, but owner may prefer a
recapture with the header cropped or the fixture phone removed before
anything ships.

## Okibi (browser capture, demo tab)

The demo tab is DEV-ONLY (`?demo` on a local dev server; hard-disabled in
production). Captured 2026-08-02 from localhost:5173/?demo (server
started for the session, stopped after; a stale `node_modules` needed
`npm install` — package-lock.json restored to keep the repo untouched).

- [x] 01-weekly — weekly view: goals rail, mood dots, recurring markers,
      done/open/abandoned states; all demo tasks
- [ ] 02-calendar-sync — **not capturable from demo data**: demo tasks
      carry no calendar linkage (`calendarEventId: null`) and sync needs
      a real Google connection. Either extend the demo dataset in Okibi
      (owner decision) or tell the sync story on the site via the
      conflict-sandbox demo + prose instead.
- [x] 03-welcome — the public welcome page ("a list that lets you
      forget" / "Tend your ember")
- [x] 04-record — the record dashboard (daily/weekly/heatmap/
      constellation) on demo data (bonus)
- [x] 05-welcome-scene — the welcome page's live "task mortality" day
      simulation with pause/scrub — Okibi already ships a
      demonstration-not-decoration moment; strong design-language
      evidence for the portfolio (bonus)

## Research (copy from disk; convert EXR→PNG; pick hero-quality only)

Known locations (read-only sources):

- `~/GitHub/gsrc/screenshots/` — GRT/renderer EXRs + some PNG twins
- `~/GitHub/gsrc/eval/research_bench/*_figures/` — benchmark figure PNGs
- `~/GitHub/cINR_env/flip/` — **a vendored checkout of NVlabs/flip.**
  Only the root-level generated outputs (`flip.dnsRM*.png`,
  `flip.dnsPT*.png`) are ours; everything under `images/` (teaser,
  reference, test) is NVIDIA sample material — NEVER use it on the site.
- The paper's own figures (arxiv.org/abs/2504.18001) for layout reference —
  re-render hero images locally rather than lifting paper PDFs.

2026-08-02: a first research set (mechhand renders, convergence trio,
benchmark plate, FLIP maps) was copied and then **rejected the same day**
— legacy research renders show content the site won't, and would anchor
design rounds on irrelevant imagery. Research pages present as
interactive demos on small public datasets instead (BRIEF → Demos).
Design rounds attach `assets/<project>/CONTEXT.md` sheets, not renders.

To produce (with the demo work, filling the demo-slot posters):

- [ ] cinr/ — temperature-distortion cube (owner's dataset candidate;
      pin its location first): hero render + a resolution/refinement
      series + optionally a short orbit clip.
- [ ] grt/ — OpenVDB cloud bunny (verify sample-model license) or
      another small public dataset: hero render + whatever states the
      demo's honest framing needs.

## SPLAT

No visuals exist; none get faked. Optional single figure: the curriculum
stage ladder, drawn in the site's own design language.
