---
name: review
description: Adversarial review of the current diff or a named scope (a section, a demo, a file set) against design/REVIEW.md. Use at any stopping point, before commits of site/content changes, and at milestones.
---

1. Scope: `git diff HEAD` by default; otherwise what the user named.
2. Spawn the `reviewer` agent with the scope and any focus lenses
   (REVIEW.md numbers). For milestone reviews, also tell it to run the
   full experience matrix via probe.
3. Its findings are leads: re-verify each first-hand (open the file, run
   the probe step) before acting or reporting.
4. Report verdicts in REVIEW.md's format, most severe first; apply fixes
   only if the user asked for fixes.
