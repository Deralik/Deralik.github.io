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

## S2 — Retrofit audit (fresh reviewers — before the port)

- [ ] Audit the handoff's About/cINR/GRT against CONTRACT.md questions,
      REVIEW.md honesty lenses, and the skim test — desktop AND mobile,
      both themes, driving the real skeleton via `probe.mjs`.
- [ ] Verify what the demos actually compute (cINR: is the brick fill
      real paging? GRT: PSNR meter measured or scripted?) — findings, not
      assumptions.
- [ ] Check the GRT record + rejection copy against the actual HPG
      reviews and the manuscript (paths in SOURCES.md): the paraphrased
      objection must match the summary review.
- [ ] Output: punch list split into **launch-gating** (misleading
      behavior, privacy, claim errors) vs **refinement** (design-round
      material). Owner triages.

## S3 — Production port

- [ ] Port `site/` + safe uploads into the repo per `handoff/README.md`
      production tasks 1–11 (theming toggle, scaffold removal, partition
      trim, hash routing, deferred warm-starts, head/meta/favicon,
      accessibility, tested widths).
- [ ] Import-gate strips (`handoff/IMPORT.md`): résumé placeholder until
      owner supplies email-only PDF; strip `identity.phone`; audit JSON
      bookkeeping fields; harmonize `identity.title` to the ruled "GPU &
      Machine Learning engineer". Compress portrait (1.8 MB) + Quality
      Results.png.
- [ ] Under-construction cards: band-2 slots titled MelioraOS / Okibi /
      SPLAT in the existing empty-slot design language.
- [ ] **GRT real data (launch gate):** nebula-class dataset converted
      offline per `handoff/DATA-HANDOFF.md` (license verified, credited);
      black-hole companion: feasibility check → owner picks labelled
      analogue or drop. Honest comparison rule enforced (no synthetic
      blend behind a comparison frame).
- [ ] Stanford bunny credit line in cINR reference.
- [ ] Launch-gating punch items from S2.
- [ ] Reviews: /review on the port, probe matrix clean (no page errors,
      all widths × themes), check.mjs green, claims extraction pass.
      Owner may trigger /code-review ultra as the final gate.

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
