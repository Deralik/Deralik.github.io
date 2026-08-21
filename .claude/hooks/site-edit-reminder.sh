#!/usr/bin/env bash
# PostToolUse(Edit|Write): when a *site* file changes (html/css/js/json
# outside design/, scripts/, .claude/, .github/), remind about the render
# rule at the moment it applies. Non-blocking; silent otherwise.
input=$(cat)
fp=$(printf '%s' "$input" | python3 -c "import sys,json;print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null)
case "$fp" in
  *design/*|*.claude/*|*scripts/*|*.github/*|*.githooks/*|*package*.json) exit 0 ;;
  *.html|*.css|*.js|*.json)
    printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"site file changed — not done until rendered: node scripts/probe.mjs --matrix (lens 6 mechanical floor: widths × themes + console; trace any changed transition)."}}\n' ;;
esac
exit 0
