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

## README supersessions (the frozen spec is wrong or outdated here —
this list wins; recorded 2026-08-20, S3 Wave C)

- README "drawn … from about-record.json — static data, no API" was
  FALSE of the handoff code: about-skeleton fetched
  github-contributions-api.jogruber.de at runtime. Resolved per owner
  ruling (2026-08-19): a dated snapshot is vendored into
  about-record.json `contributions`; no client-side third-party fetch.
- README task 11 "do not fill slots 03–05 / labels stay 03/04/05" —
  superseded by the titled-slot ruling (2026-08-18): slots ship as
  MelioraOS / Okibi / SPLAT, tier "under construction".
- README task 7's head title "GPU & rendering engineer" — superseded by
  the identity ruling: "GPU & Machine Learning engineer".
- README production tasks 1–11 omit the launch gate: the hero's
  with/without seam is synthetic (DATA-HANDOFF documents it) and must be
  rebuilt with real integrators on real data — or stripped of comparison
  framing — before launch (RULINGS launch posture). This is S3 Wave D.
- README "Screens — About": the D0 lede "wannabe researcher" and other
  personal-voice copy are owner-voice rulings now (2026-08-19) — models
  don't "fix" them.
- image-slot.js (task list kept it) — deleted at Wave C: replaced by two
  <img> tags; its `.image-slots.state.json` sidecar fetch was the only
  recurring console 404.
