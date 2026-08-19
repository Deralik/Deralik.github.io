# Freshness manifest — keeping the site true as the projects live on

The projects evolve; the site must not silently rot. A sweep session
(PROMPTS.md E) walks this table, reads each source since its marker,
diffs reality against BRIEF.md + the live copy, and reports proposed
updates for owner triage. Models propose; the owner rules; BRIEF and the
page change together. Sibling repos are READ-ONLY, always.

Markers are set by each sweep (commit SHA for repos, date for the rest).
"baseline" = not yet swept; the first post-launch sweep initializes them.

## Primary sources (fact-check against these, never memory)

All in `design/local/sources/` — a gitignored folder inside this repo:
stable paths for every session, never committed.

- **cINR paper**: `cINR_2025.pdf` + `pgv20251153.pdf` (EGPGV
  camera-ready); public mirror arxiv.org/abs/2504.18001. Authors:
  D. Zavorotny (UC Davis), Q. Wu (NVIDIA), D. Bauer, K.-L. Ma (UC Davis).
- **GRT manuscript**: `Gaussian_Raytracing_Enabled_Radiance_Caching.pdf`
  — UNPUBLISHED, under revision.
- **HPG '26 reviews**: `grt_cache_reviews.md` (paper1028; summary + 4
  reviews) — on-site paraphrases trace to the summary review.
- **GRT measured record (post-manuscript)**:
  `../gsrc/eval/research_bench/reports/` — especially
  `exports/CURRENT_GRTCACHE_TECHNICAL_RECORD.pdf` (updated 2026-08-06);
  the sweep's primary diff target for GRT numbers.
- If a local copy is missing (gitignored = unrecoverable from git),
  re-fetch cINR from arXiv and ask the owner for the manuscript/reviews
  — do not proceed from memory. Design-context captures live in
  `design/local/assets/` the same way.

## Section map

| Section | Sources | What to check | Marker |
|---|---|---|---|
| cINR | arxiv.org/abs/2504.18001 · github.com/VIDILabs/cINR · `../cINR`, `../cINR_env` | Published paper — mostly static. Citation/venue details still right; code link alive; stage-2 demo assets when that work starts. | baseline |
| GRTCache | `../gsrc` (incl. `eval/research_bench`) · manuscript + revision status (owner / design project) | Resubmission status (venue label must track reality); new measured numbers superseding the manuscript record; workstream list still accurate; NEE caveat still true. | baseline |
| MelioraOS | `../MelioraCRM` — CHANGELOG.md, docs/ROADMAP.md, git tags | New releases/features/redesigns worth a line; "private beta" still the true status (never "production" until owner rules); 50k+ lines claim still safe. | baseline |
| Okibi | `../Okibi` — changelog/releases | "11 releases in first seven weeks" is time-frozen (safe); new features worth mention; okibi.app still live; feature list vetting (RULINGS open item). | baseline |
| SPLAT | `../SPLAT` | Stage progress; README present-tense fix (BRIEF prerequisite before the page links the repo); first convergence plots = the trigger to grow the section. | baseline |
| About | owner input · `about-record.json` spans · résumé (private repo) | Timeline current (ongoing marks still ongoing; new events since last sweep); availability status still true; contribution grid data current. | baseline |
| Fact packs | design/BRIEF.md vs all of the above | Every pack line still defensible; superseded lines marked, never silently edited. | baseline |

Sweep output format: one report — **stale** (claim, evidence, proposed
edit) / **new** (material worth adding, which CONTRACT question it would
serve) / **unchanged** — nothing changes without an owner ruling logged
in RULINGS.md.
