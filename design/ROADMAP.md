# Design → build roadmap

Work top to bottom; check things off; log every design round in
`iterations/`. Implementation does not start until P3 is locked.

## P0 — Scaffold (done 2026-08-02)

- [x] Repo scaffolding: CLAUDE.md workflow rules, design/ area, privacy
      pre-commit hook.
- [x] Activate the hook in this clone: `git config core.hooksPath .githooks`

## P1 — Asset pack

Capture list and safety rules live in `assets/shots.md`. Human-in-the-loop:
Meliora and Okibi need a logged-in browser (Claude drives via the Chrome
extension, you supervise); research assets are copied from disk.

- [ ] Meliora captures (Dev workspace seed data ONLY — never the customer
      tenant). *(2026-08-02: 11 stills + drag GIF captured from the local
      dev instance; leads + contractors WITHHELD — Dev holds mirrored
      real customer rows; clean, then recapture. shots.md has details.)*
- [ ] Okibi captures (demo tab only — dev-only `?demo`). *(2026-08-02:
      weekly, welcome, record, welcome-scene captured; calendar-sync not
      representable in demo data — see shots.md.)*
- [x] Per-project CONTEXT.md sheets in assets/<project>/ — the design-
      round attachments: what each project is, looks like, how it behaves
      (written 2026-08-02; legacy research renders copied then rejected
      the same day as design anchors — see iterations/01).
- [ ] Research demo-dataset visuals, produced with the demo work: cINR
      temperature-distortion cube renders + LOD/refinement series; GRT
      cloud-bunny (or alternative) renders; license check on any
      downloaded dataset. These fill the demo-slot posters.
- [ ] SPLAT: no visuals exist and none get faked — the page will be
      typographic. (Optional: one figure of the curriculum's stage ladder.)
- [x] Everything named consistently: `assets/<project>/<nn>-<slug>.<ext>`.

## P2 — Design rounds (Claude Design)

- [ ] Round 1: paste PROMPTS.md → prompt B with BRIEF.md attached plus
      the asset set it lists. Mock all four agreed directions
      (Convergence / Instrument / Five rooms / Abstract live index),
      home + cINR page each, AND invite directions of the model's own —
      hybrids expected to emerge. (Owner leaning: D.)
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

- [ ] Interactive demos per BRIEF's staged plan (cINR multi-res brick
      streaming; GRT dataset demo). Stage 1s may land near launch; each
      replaces its page's demo-slot poster in place. The site never waits.
- [ ] SPLAT page grows as the curriculum produces real artifacts
      (first convergence plots are the trigger).
