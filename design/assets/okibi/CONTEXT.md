# Okibi — context sheet for design sessions

## What it is (vetted facts — BRIEF.md is authoritative)

Personal task manager (okibi.app) shipped end to end; two-way Google
Calendar sync designed so a sync conflict can never destroy user data
("absence is never evidence" deletion rule); 11 releases in its first
seven weeks.

## What it looks like

Small, personal, correctness-focused web app (React + Vite). Weekly
planning view is the home surface; tasks can carry synced calendar
events; a public welcome page exists. Clean, quiet product styling in
the same polish lineage as MelioraOS.

## The story that matters (for design context)

The whole calendar sync engine is ~500 lines and written defensively:
lookups that fail settle nothing (treated as absence of an answer, never
as evidence a record is gone), the record must settle before an export
plan is measured against it, and one rate-limited lookup never blocks
ordinary tasks from reaching the calendar. The site's Okibi presence
leans on this correctness narrative more than on feature breadth.

## Site presence

Product story + a candidate interactive moment: a small "sync conflict
sandbox" where the visitor injects edits/deletes on either side of a
two-way sync and watches the real deletion rule refuse to destroy data
(a "data destroyed" indicator that never lights). Honest label: it runs
the rule's logic, ported; it is not the shipped app. Captures: **demo
tab only — never personal task data**; list in ../shots.md.

## Status

Screenshots pending (browser capture session). Until then this sheet is
the Okibi attachment for design rounds.
