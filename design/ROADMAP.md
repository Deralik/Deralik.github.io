# Roadmap

Work top to bottom; log rounds in `iterations/`; keep boxes current.
History: P0–P2 of the original roadmap ran 2026-08-02 → 2026-08-18 (scaffold,
asset philosophy, design rounds in the claude.ai project) and produced the
depth-machine design handed off in `handoff/` — see `iterations/`.

## S0 — State sync (2026-08-18)

- [x] Handoff port-spec docs imported (`handoff/`), rulings log moved into
      the repo (`RULINGS.md`), BRIEF fact packs updated (GRT manuscript
      record; Meliora private beta + beta.11), CLAUDE.md drift fixed.
- [x] Privacy findings recorded (`handoff/IMPORT.md`): résumé PDF in the
      zip is NOT the email-only variant; `about-record.json` carries a
      phone field to strip.

## S1 — Protocol scaffolding (2026-08-18)

- [x] CONTRACT.md (depth/section goals + questions), REVIEW.md (rubric),
      SOURCES.md (freshness manifest), PROMPTS.md rewritten.
- [x] Machinery: `scripts/check.mjs` (privacy/claims/links/token gates,
      PDF text extraction), `scripts/probe.mjs` (screenshot matrix +
      scripted interaction + console capture), `.claude/` (reviewer
      agent, review/verify skills, session + post-edit hooks, denies),
      CI workflow, pre-commit hook extended, CHANGELOG.md.

## S2 — Retrofit audit (done 2026-08-19 — four parallel reviewer lanes)

- [x] Audit vs CONTRACT/REVIEW/skim, desktop + mobile, both themes,
      via probe. (Core verdict: D0 truthful, budgets hold, mechanics
      pass; 11 launch-gating fixes found, all cheap but one.)
- [x] Demos verified at code level: cINR cache + GRT training are
      GENUINE computation; one piece of theater (hero seam) as
      DATA-HANDOFF disclosed; PSNR meter measured (of the cache field).
- [x] Rejection copy checked vs the actual reviews: MIS-TRACED —
      rewrite required (punch G7). Quantitative record verified exact
      vs both papers, digit-for-digit.
- [x] Punch list produced: `working/S2-AUDIT.md` (G1–G11 launch-gating,
      D1–D9 owner decisions, S1–S15 should-fix, R1–R20 refinement).
- [x] Owner triage 2026-08-19 → S2-AUDIT.md is now the S3 port ledger.
      Two riders open there: GRT author line (D7), in-progress framing
      (D8) — neither blocks the rest of the port starting.

## S3 — Production port (ledger: working/S2-AUDIT.md)

- [x] Port per `handoff/README.md` tasks 1–11 (commits 7aeaef3, f738276,
      4aa93d4, f033f41: theming toggle, scaffold removal, partition/font
      trim, hash routing, deferred warm-starts, head/meta/favicon,
      Enter/Space + focus-visible + reduced-motion, tested widths).
- [x] Import-gate strips: `identity.phone` stripped, title harmonized,
      images compressed (7aeaef3); JSON bookkeeping fields audited and
      neutralized (2026-08-20). STILL OPEN → S17: résumé placeholder
      until the owner copies the email-only PDF.
- [x] Under-construction cards titled MelioraOS / Okibi / SPLAT (f033f41).
- [x] **GRT real data (launch gate) — MET** (26c8a8b): vendored Open
      SciVis supernova + honest 1-spp estimators; synthetic blend
      deleted. RIDERS: license text re-verify before deploy; black-hole
      analogue keep-or-drop (owner).
- [x] Stanford bunny credit (4aa93d4). Launch-gating punch G1–G11 all
      cleared (f033f41, 26c8a8b).
- [ ] S16 owner-voice copy pass (About bio/lede + anything owner flags).
- [ ] Final review: all six REVIEW.md lenses by a fresh reviewer; probe
      matrix + --nojs clean; check.mjs green. Owner may trigger
      /code-review ultra as the final gate.

## S4 — Deploy

- [ ] Owner decision: rename repo to `Deralik.github.io` (root URL) or
      keep `portfolio` + custom domain.
- [ ] GitHub Pages on; final privacy sweep of served output; CHANGELOG
      entry; owner copies the email-only resume PDF in; **owner pushes.**
- [ ] Add the site URL to the resume header (private-repo side).
- [ ] Cleanliness ruling: retire `design/handoff/` from HEAD once the
      shipped site + SYSTEM.md supersede it (history keeps it).

## Design lane (parallel, in the claude.ai project — import gate on every
handoff)

- [ ] GRT refinement rounds (owner: "we will be refining it a lot").
- [ ] MelioraOS section design (endorsed direction: the agent-workflow
      loop figure; captures are reference only). Prereq when a round
      wants fresh captures: owner cleans the two tainted Dev rows
      (leads, contractors), then recapture per `assets/shots.md`.
- [ ] Okibi section design (the app is the story; sync-conflict sandbox
      is a page moment; vet the feature list first — RULINGS open item).
- [ ] SPLAT section design (typographic; no faked visuals; grows when
      the curriculum produces real artifacts).
- [ ] cINR stage 2 (real INR decode, WASM/WebGPU) — post-launch.

## Maintenance (post-launch, recurring)

- [ ] Freshness sweep per `SOURCES.md` (~monthly, or after any project
      milestone): models diff the live projects against the site and
      propose updates; owner triages. First sweep sets the baselines.
- [ ] About timeline stays true (new events, availability status).
- [ ] CHANGELOG.md entry per release; owner pushes.
