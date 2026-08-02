# Design → build roadmap

Work top to bottom; check things off; log every design round in
`iterations/`. Implementation does not start until P3 is locked.

## P0 — Scaffold (done 2026-08-02)

- [x] Repo scaffolding: CLAUDE.md workflow rules, design/ area, privacy
      pre-commit hook.
- [ ] Activate the hook in this clone: `git config core.hooksPath .githooks`

## P1 — Asset pack

Capture list and safety rules live in `assets/shots.md`. Human-in-the-loop:
Meliora and Okibi need a logged-in browser (Claude drives via the Chrome
extension, you supervise); research assets are copied from disk.

- [ ] Meliora captures (Dev workspace seed data ONLY — never the customer
      tenant): Gantt with dependencies visible, Gantt mid-drag clip,
      projects view, one drawer.
- [ ] Okibi captures (demo tab only): weekly view, a calendar-synced task,
      the welcome page.
- [ ] Research visuals copied + converted (EXR→PNG where needed) from the
      paths in shots.md; pick 3–5 hero-quality renders.
- [ ] SPLAT: no visuals exist and none get faked — the page will be
      typographic. (Optional: one figure of the curriculum's stage ladder.)
- [ ] Everything named consistently: `assets/<project>/<nn>-<slug>.<ext>`.

## P2 — Design rounds (Claude Design)

- [ ] Round 1: paste PROMPTS.md → "Round 1" with BRIEF.md attached plus
      4–6 best assets. Ask for 2–3 distinct directions, home + one
      project page each.
- [ ] After each round: log shown / decided / rejected in
      `iterations/<nn>-<yyyy-mm-dd>.md`; fold agreed tokens into SYSTEM.md.
- [ ] Iterate until home + research + one product page feel settled.
      Expect 2–4 rounds; stop when rounds produce taste-tweaks, not
      direction changes.

## P3 — Lock the system

- [ ] SYSTEM.md complete: type scale, palette (light/dark if offered),
      spacing, components (nav, project card, figure+caption, code block,
      clip embed), motion rules.
- [ ] Page blueprints: section-by-section outline per page, which asset
      goes where.
- [ ] Sanity pass against CLAUDE.md rules (positioning order, no
      marketing tone, privacy).

## P4 — Implementation

- [ ] Static site from SYSTEM.md + blueprints. Tech chosen at build time
      by the implementing session — default bias: plain HTML/CSS (or
      Astro if templating earns it), dependency-light, fast, readable
      without JS.
- [ ] Content written per page from BRIEF fact packs — no new claims.
- [ ] Accessibility + phone pass.

## P5 — Deploy

- [ ] Decide repo/domain: rename to `Deralik.github.io` for the root URL,
      or keep `portfolio` + custom domain.
- [ ] GitHub Pages live; hook active; final privacy sweep of the built
      output (grep for phone-shaped strings before first push).
- [ ] Then, from the private repo's side: resume PDF copied in, and the
      site URL added to the resume header.

## P6 — Stretch (post-launch)

- [ ] Interactive demo: WebGPU volume raymarcher on a downsampled dataset
      or a GRT cache visualizer. Its own project; the site never waits.
- [ ] SPLAT page grows as the curriculum produces real artifacts
      (first convergence plots are the trigger).
