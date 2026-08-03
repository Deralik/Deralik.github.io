# Meliora — context sheet for design sessions

## What it is (vetted facts — BRIEF.md is authoritative)

Construction-management platform (melioraos.com) built solo — 50k+ lines
— from first commit to a general contractor using it in production in
47 days. The distinctive story is the disciplined agent-driven process:
design docs as source of truth, automated quality gates, tests pinned to
a hand-written financial spec, adversarial review.

## Shape of the platform (it is much more than any one screen)

A field-friendly CRM + scheduling + money tool for small contracting
businesses, built to a multi-tenant SaaS bar (per-workspace isolation,
RLS). It runs the full job lifecycle — leads → projects → completion —
with phase-driven UI: a project's current phase decides what the
workspace shows.

- **Dashboard** — a widget grid where every widget is a working
  miniature of its destination page; a workspace, not a report.
- **Leads** — pipeline kanban + single-lead focus: estimating → bid sent
  → won/lost; a won lead graduates into a project.
- **Projects** — browse board + a per-project focus workspace whose tabs
  follow the phase: a stepper-gated Setup tab (pre-construction); a
  full-bleed Schedule tab (dependency-aware gantt with a "bank shelf"
  for unplaced work); Finance (payment milestones, trade-grain cost
  build-up); Change Orders (CO lifecycle + open-question/RFI queue);
  Punch list; Files (per-trade document homes, drag-in folders); a
  Closeout tab gating mark-complete.
- **Money model** — a cross-cutting spec: effective contract value,
  projected vs realized profit, a CO approval cascade that reprices
  stages, permit payer tracking. Regression-tested against
  hand-derived oracle fixtures.
- **Contractor directory** — sub-centric, organized by trade: coverage,
  load, compliance attention, per-trade pricing.
- **Cross-project lenses** — Schedule (every job on one time axis),
  Tasks (portfolio-wide workbench), Finance (business-level margin
  trajectory).
- **Chrome** — ⌘K command palette with deep-link "arrival actions"; a
  catch-up flow for onboarding jobs already underway; Settings with a
  full theming system (light/dark, high-contrast, accent, text size,
  reduced motion).

## Design language (the polish bar the portfolio must meet)

Near-monochrome base (white, `#fafafa` surfaces, 0.5px hairline borders)
with a strict semantic severity vocabulary (red/amber/blue/gray/green);
severity stripes on cards are reserved for genuine attention demands.
Trades are first-class with a fixed 15-color palette; each trade color
derives shades (saturated bars, ~10% washes for lanes and columns).
Status pills per lifecycle state. Desktop-primary, responsive + PWA.

Core UX principles (from the product's own primer): context-sensitive
views driven by status; information follows the stage but everything
stays reachable; every important fact within 3 clicks; action-
orientation over reporting; the stage drawer as the most consequential
surface; "don't fight reality" (record the messy past honestly, don't
gate on idealized workflow); every item on screen earns its place.

## Interaction vocabulary (a sample, not the product)

Schedule tab: drag a stage body to move in day steps, drag edges to
resize, a hover circle drafts dependency arrows (arrows turn red only
when a should-have-started stage is held up), click-and-hold on empty
lane space creates items, shelf chips drag onto lanes. Drawers open over
content everywhere; autosave + undo are systemic.

## Site presence

Product + engineering-process story. Captures: **Dev workspace seed data
ONLY, never the customer tenant** (fixtures via the product's seed
script; seeded rows carry a "Seed:" prefix). Capture wide across
surfaces (list in ../shots.md), curate hard for the page. For design
sessions needing more depth, the owner may attach selected private
design docs (e.g. the UI primer) directly in that session — they are
never committed to this public repo. Code excerpts on the site are a
per-excerpt owner decision.

## Status

Captures pending (browser session ready). Until then this sheet is the
Meliora attachment for design rounds.
