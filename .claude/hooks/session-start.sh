#!/usr/bin/env bash
# SessionStart: arm the privacy hook in this clone (idempotent) and state
# where work stands, so no model has to remember or re-derive either.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
git config core.hooksPath .githooks 2>/dev/null
next=$(grep -m1 '^- \[ \]' design/ROADMAP.md 2>/dev/null | cut -c7- | head -c 160)
echo "portfolio: privacy hook armed. Gates: scripts/check.mjs before commit (pre-commit + CI run it); rendered proof via scripts/probe.mjs before 'done'; owner pushes, never you."
echo "Next unchecked in ROADMAP: ${next:-see design/ROADMAP.md}"
exit 0
