#!/bin/sh
# Runs a command as a coding agent's GitHub identity, e.g. Codex:
#   scripts/agent-identity/with-agent.sh codex codex
# See docs/agents/agent-identity.md.
set -e
[ $# -ge 2 ] || { echo "usage: with-agent.sh <agent> <command> [args...]" >&2; exit 2; }
agent=$1
shift
env_lines=$(node "$(dirname "$0")/token.mjs" "$agent" env)
eval "$env_lines"
exec "$@"
