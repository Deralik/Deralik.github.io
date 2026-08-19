# Review rubric

How work gets judged here. Reviewers are never the author (fresh session
or the `reviewer` agent). The charge: assume something is wrong and hunt
for it; if the work is genuinely clean, say so plainly and state what was
checked — do not invent nits, do not soften real findings. Subagent
findings are leads: the orchestrator re-verifies each first-hand before
acting. The owner's ideas get pressure-tested like everyone else's.

**Verdict format:** per finding — `file:line` (or view + element),
severity (**launch-gating** = misleading / privacy / claim error /
broken, **should-fix**, **refinement** = design-round material), the
concrete fix, and which CONTRACT.md question or BRIEF.md line it
violates. A "clean" verdict lists the lenses run and the riskiest
assumption remaining.

## Lenses

1. **Skim test.** At each depth, what does a 10-second and a 60-second
   reader actually take away — and is it true? Most readers never go
   deeper; a surface impression that oversells is a launch-gating
   finding. Run it at 390px mobile too, where D0/D1 don't exist.
2. **Claims audit.** Every quantity and checkable claim on the page maps
   to a BRIEF.md fact-pack line (`scripts/check.mjs` extracts numbers
   mechanically; the reviewer judges the misses). Orphan numbers are
   launch-gating. Provenance labels present where BRIEF requires them
   ("the manuscript's numbers, not yet peer-verified").
3. **Demo honesty.** Approximations for browser efficiency are
   legitimate; approximations that produce misleading behavior are not.
   - *Label test*: what is actually running is stated at the demo, in
     plain words, not buried.
   - *Differential test*: any shown comparison is real output of the
     shown computation — never tuned theater behind a comparison frame.
   - *Vocabulary test*: the UI never borrows paper vocabulary
     ("training", "PSNR", "cache") for something that isn't genuinely
     happening; meters display measured values or say what they display.
   - *Dataset test*: real data licensed and credited; procedural
     stand-ins labelled as analogues.
   - The bar: if an EGPGV/HPG-reviewer type watched this demo and then
     read the paper, would anything feel oversold?
4. **Audience fit.** Does the language serve a national-lab / defense /
   GPU-company engineer? Indicative mood, zero marketing register, no
   filler. Word budgets hold (≤40 per project at D0, no paragraph
   over 25).
5. **System compliance.** SYSTEM.md + RULINGS.md hold: tokens only from
   the tokens file, accent registers respected, control-row grammar,
   figure vocabulary, motion budget. Code: ponytail — flag
   over-engineering, dead flexibility, reinvented platform features.
6. **Experience matrix.** Drive the real page with `scripts/probe.mjs`:
   1280 / 1512 / 1920 / 390 widths × both themes; keyboard navigation;
   `prefers-reduced-motion`; no page errors in the console; readable
   with JS disabled (degradation states). Mobile is a distinct machine —
   review it as its own design, not as shrunk desktop.

## Cadence

- Every content/site change before commit: lenses 2 + 6 minimum
  (check.mjs + probe are the mechanical floor), plus whichever lenses the
  change touches.
- Milestones (end of port, before deploy, new section lands): all six
  lenses by a non-author, and the owner may trigger `/code-review ultra`
  as the final gate.
- Design handoffs: the import gate (PROMPTS.md C) runs before any review.
