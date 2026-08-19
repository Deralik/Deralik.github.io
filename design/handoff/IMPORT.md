# Handoff import record — 2026-08-18

Source: `~/Downloads/Portfolio Design System.zip` (design-project handoff:
About · cINR · GRTCache, high fidelity). These docs are the frozen port
spec; `README.md` in this directory is the authoritative production task
list for the S3 port.

Imported here: README.md, skeleton-notes.md, DATA-HANDOFF.md.
Continued as live repo files: design-rulings.md → `design/RULINGS.md`.
NOT imported yet (S3 port brings them in): `site/` (4.5k lines),
`uploads/IMG_3646.jpg` (compress first — 1.8 MB), `uploads/Quality
Results.png` (recompress).

## Privacy strips required at port (found 2026-08-18 — do not skip)

- `uploads/DZResume.pdf` contains the owner's phone number — it is NOT
  the email-only variant. NEVER commit it. Ship a placeholder résumé link
  until the owner manually copies the email-only PDF from the private
  repo. `scripts/check.mjs` extracts PDF text to enforce this.
- `site/about-record.json` → `identity.phone` must be stripped (the
  renderer never reads it; verified). Audit the other bookkeeping fields
  (`evidence_notes`, `unsourced_claims`, `gaps`, `_readme`) for
  publishability before commit — the file ships to the public site.
