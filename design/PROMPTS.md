# Session prompts

Copy-paste starters. Each assumes zero prior context — the repo carries
everything; the machinery (hooks, `scripts/check.mjs`, `scripts/probe.mjs`)
carries the protocol so the model doesn't have to remember it.

## A — Work session (Claude Code, repo root)

> Read CLAUDE.md and design/ROADMAP.md; we're in the first phase with an
> unchecked box — pick up its first item and drive it. Law lives in
> design/: BRIEF (facts), CONTRACT (what each view must answer), SYSTEM
> (design system), RULINGS (decisions), REVIEW (rubric). The hooks and
> scripts enforce privacy and verification — trust the gates, and read
> the owning file instead of recalling rules. Keep ROADMAP boxes and the
> design/working/ ledger current as you go; log design decisions in
> RULINGS with today's date.

## B — Design round (claude.ai "Portfolio Design System" project)

> Read README.md and the context/ docs (BRIEF, system invariants, project
> sheets). This round: <the specific section, figure, or refinement — one
> scope>. Keep everything consistent with the settled skeleton and the
> rulings; if you want to break a settled rule, say so explicitly and
> why. Adjustments edit the existing section in place; a new canvas
> section only for a genuinely new direction. Before we finish, write the
> round summary: shown / decided (with exact tokens) / rejected (with
> why) / open questions — nothing new invented in the summary.

## C — Handoff import (Claude Code, after a design round hands work back)

> A design-round handoff is at <path>. Run the import gate before
> anything enters the repo: (1) privacy sweep — text grep for
> phone-shaped strings and private artifacts, PDF text extraction, JSON
> walk (see scripts/check.mjs and design/handoff/IMPORT.md for
> precedent); (2) reconcile every fact against design/BRIEF.md —
> discrepancies are surfaced to me, never silently adopted; (3) merge new
> rulings into design/RULINGS.md (owner rulings vs model notes — keep the
> registers); (4) write design/iterations/<nn>-<date>.md. Only then stage
> files. check.mjs must be green before commit; I push.

## D — Review session (fresh session or reviewer agent — never the author)

> Review <scope: the diff / a section / a demo> against design/REVIEW.md.
> You did not write this; assume something is wrong and hunt for it, and
> if it is genuinely clean say so plainly with what you checked — do not
> invent nits. Findings: file:line, severity (launch-gating / should-fix
> / refinement), concrete fix, and the CONTRACT question or BRIEF line it
> violates. Drive the real page with scripts/probe.mjs — desktop widths
> AND 390px mobile, both themes. Demos get the honesty lenses. Treat my
> ideas as challengeable as anyone's.

## E — Freshness sweep (recurring; post-launch)

> Run the freshness sweep in design/SOURCES.md: for each site section,
> read its upstream sources since the recorded marker (sibling repos are
> READ-ONLY), diff reality against what the site and BRIEF claim, and
> produce one report: stale claims, new material worth adding, unchanged
> sections — each with evidence and a proposed edit. I triage; nothing
> changes on the site without my ruling. Update the sweep markers when
> done.
