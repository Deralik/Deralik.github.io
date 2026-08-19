---
name: verify
description: See a change rendered before calling it done — screenshot matrix + console capture via scripts/probe.mjs. Use after ANY visual/site change; the user is not the render loop.
---

1. `node scripts/probe.mjs --matrix --dir <site root>` — shoots
   1280/1512/1920/390 × light/dark, collects console output, exits
   nonzero on uncaught page errors. (Pre-port skeleton uses localStorage
   key `n-skeleton:theme`; pass `--ls-key`/`--themes` if the port renames
   them.)
2. Read the screenshots — actually look, at 390px especially (mobile is
   its own machine; squeezed desktop is a finding).
3. Console errors or broken layout: fix, re-run. Only then report done,
   stating what was verified.
4. For interactions (depth changes, demo controls), script them:
   `node scripts/probe.mjs press:ArrowDown wait:600 shot:d1 ...`
