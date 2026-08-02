# portfolio

Public repo for my portfolio site, deployed to GitHub Pages. Audience:
engineers and hiring managers at national labs, defense startups, and GPU
companies — people who read long technical write-ups and judge how I think.

## Rules

- **This repo is public. Nothing private enters it, ever.** No phone number,
  no street address, no application materials, no target-company lists, no
  tracker data. Contact is a public email only.
- The private sibling `../employment-hunter` is never read in sessions here.
  Everything a session needs lives in this repo (see `design/`).
- Project sibling repos (`../cINR`, `../cINR_env`, `../gsrc`, `../SPLAT`,
  `../MelioraCRM`, `../Okibi`) are read-only asset/fact sources: read them,
  copy assets into `design/assets/`, never modify them.
- The resume PDF on the site is the email-only variant, copied over from
  the private repo manually and deliberately when it changes — never
  automated, never built here.
- A pre-commit hook (`.githooks/pre-commit`; activate once with
  `git config core.hooksPath .githooks`) greps staged changes for
  phone-shaped strings and private-repo artifacts. Never bypass it with
  `--no-verify`.
- **Screenshot safety:** Meliora captures come from the Dev workspace's
  seeded fixture data only — never the customer's tenant. Okibi captures
  come from the demo tab, not personal task data.

## Content

- Project order is positioning, not chronology: **published research
  (cINR / EGPGV 2025) → GRTCache → SPLAT → Meliora → Okibi.** If the web
  apps lead, I read as a full-stack developer — that's a bug.
- Pages are long-form technical narrative — headings, figures, code where
  it earns its place. The audience is evaluating judgment.
- SPLAT is described by what runs today (a curriculum), never the roadmap.
- Every number on the site must be defensible; the fact packs in
  `design/BRIEF.md` are the vetted set — don't improvise new claims.

## Design direction (owner decision 2026-08-02, supersedes the seed's
"write-ups over screenshots")

Professional, product-grade polish in the lineage of MelioraOS and Okibi —
clean type, restrained color, generous whitespace — **plus** genuinely
impressive visual demonstrations: real renders, short capture clips, and
eventually an interactive demo. Write-ups and visuals carry the site
together. Still banned: marketing tone, stock imagery, gradients-for-
gradients'-sake, anything that reads as a SaaS landing page.

## Design workflow

The site is designed before it is built. `design/` is the working area:
`BRIEF.md` (what we're making and the vetted facts), `ROADMAP.md` (phases),
`PROMPTS.md` (session + Claude Design prompts), `assets/` (captured
visuals + `shots.md` capture list), `iterations/` (one log per design
round), `SYSTEM.md` (the agreed design system — **the single source of
truth for implementation; nothing ships that contradicts it**).
Implementation starts only after SYSTEM.md is locked (ROADMAP P3).
