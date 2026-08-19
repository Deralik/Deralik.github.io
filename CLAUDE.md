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

- Project order is positioning, not chronology: research leads — **cINR
  (EGPGV 2025) → GRTCache — then MelioraOS → Okibi → SPLAT** (owner
  order, 2026-08-18). If the web apps lead, I read as a full-stack
  developer — that's a bug.
- The site is one page, three depths (D0 dashboard → D1 panel → D2
  document). D0/D1 are skim-first; most readers only skim, and nothing
  may mislead at the surface. D2 is the long-form technical narrative.
  Each view answers the questions in `design/CONTRACT.md`.
- SPLAT is described by what runs today (a curriculum), never the roadmap.
- Every number on the site must be defensible; the fact packs in
  `design/BRIEF.md` are the vetted set — don't improvise new claims.
  Demos carry honest labels; efficiency approximations must never produce
  misleading behavior (`design/REVIEW.md` owns the rubric).

## Design direction (owner decision 2026-08-02, supersedes the seed's
"write-ups over screenshots")

Professional, product-grade polish in the lineage of MelioraOS and Okibi —
clean type, restrained color, generous whitespace — **plus** genuinely
impressive visual demonstrations: real renders, short capture clips, and
eventually an interactive demo. Write-ups and visuals carry the site
together. Still banned: marketing tone, stock imagery, gradients-for-
gradients'-sake, anything that reads as a SaaS landing page.

## Design workflow

Design rounds run in the claude.ai "Portfolio Design System" project;
everything durable lives here in `design/`, one owner per kind of truth:
`BRIEF.md` (what we're making + the vetted facts) · `CONTRACT.md`
(goals/questions per depth and section) · `RULINGS.md` (dated decision
log: binding owner rulings vs advisory model notes) · `SYSTEM.md` (the
design system in force — **nothing ships that contradicts it**) ·
`REVIEW.md` (review rubric) · `SOURCES.md` (freshness manifest) ·
`ROADMAP.md` (phases) · `PROMPTS.md` (cold-start session prompts) ·
`handoff/` (frozen port spec) · `working/` (live cycle ledger, deleted
when the cycle ships) · `iterations/` (round logs) · `assets/`
(public-safe context sheets only) · `local/` (GITIGNORED: primary-source
copies — papers, manuscript, reviews — and design-context captures;
stable paths for sessions, never committed). The public tree stays
clean: no design-context binaries, and structural files retire from
HEAD when their phase ships.
Restating one file's truth in another is a finding. Design → repo
crossings go through the import gate: privacy sweep (text, PDFs, JSON
walk), fact reconciliation against BRIEF, rulings merge, iterations
entry — never "unzip and commit."

## Working agreements

- **Nothing is gospel.** Pressure-test the owner's ideas as adversarially
  as your own — state the strongest concrete counterargument once before
  executing; executing without voicing it is the failure. Once the owner
  has heard it and ruled, stop re-litigating (RULINGS.md records it).
- **Findings are leads.** Re-verify any subagent's finding first-hand
  before acting on it.
- **The user is not the render loop.** A visual change is not done until
  its rendered output has been seen: `node scripts/probe.mjs --matrix`
  (desktop widths, 390px mobile, both themes). Reviews always cover the
  mobile experience.
- **Release protocol:** `node scripts/check.mjs` green before every
  commit (the pre-commit hook and CI run it too); a short CHANGELOG.md
  entry per release; **the owner pushes — never push.**
- The protocol is carried by machinery (hooks, gates, settings denies),
  not by model memory. If a gate stayed silent, don't re-derive rules
  from recollection — read the file that owns them.
