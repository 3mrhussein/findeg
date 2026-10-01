#!/bin/sh
# Claude Code SessionStart hook: switches the session's Bash commands to the
# Claude GitHub App identity. Does nothing on machines where it isn't set up.
# See docs/agents/agent-identity.md.
[ -n "$CLAUDE_ENV_FILE" ] || exit 0
if env_lines=$(node "$(dirname "$0")/token.mjs" claude env --optional); then
  [ -z "$env_lines" ] || printf '%s\n' "$env_lines" >> "$CLAUDE_ENV_FILE"
else
  echo "agent-identity: couldn't switch to the Claude GitHub App; gh and git use your own credentials" >&2
fi
exit 0
