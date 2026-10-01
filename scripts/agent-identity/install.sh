#!/bin/sh
# Installs the agent-identity gh/git wrappers for this machine's user, so every
# Claude Code and Codex session (CLI, desktop app, IDE extension) acts on GitHub
# as its own bot inside findeg checkouts. Safe to re-run.
#
# - Copies bin/gh and bin/git into ~/.local/bin (override with FINDEG_AGENT_BIN_DIR).
#   That directory must come before the real gh/git on PATH.
# - Claude Code needs no config: it sets CLAUDECODE=1 in every shell it starts.
# - Codex: adds FINDEG_AGENT = "codex" under [shell_environment_policy.set] in
#   ~/.codex/config.toml (a backup is kept next to it).
# See docs/agents/agent-identity.md.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
bin_dir=${FINDEG_AGENT_BIN_DIR:-$HOME/.local/bin}
codex_config=${CODEX_HOME:-$HOME/.codex}/config.toml

mkdir -p "$bin_dir"
for tool in gh git; do
  cp "$here/bin/$tool" "$bin_dir/$tool"
  chmod 755 "$bin_dir/$tool"
done
echo "Installed gh and git wrappers into $bin_dir"

# Agents' shells are login shells, so check the PATH a login shell sees.
for tool in gh git; do
  found=$(zsh -lc "command -v $tool" 2>/dev/null || true)
  if [ "$found" != "$bin_dir/$tool" ]; then
    echo "WARNING: a login shell resolves $tool to '$found', not $bin_dir/$tool." >&2
    echo "         Put $bin_dir before it on PATH (e.g. in ~/.zprofile)." >&2
  fi
done

if [ -f "$codex_config" ] && grep -q '^FINDEG_AGENT *=' "$codex_config"; then
  echo "Codex already sets FINDEG_AGENT in $codex_config"
else
  mkdir -p "$(dirname "$codex_config")"
  touch "$codex_config"
  cp "$codex_config" "$codex_config.bak-agent-identity"
  if grep -q '^\[shell_environment_policy\.set\]' "$codex_config"; then
    awk '{ print } /^\[shell_environment_policy\.set\]/ { print "FINDEG_AGENT = \"codex\"" }' \
      "$codex_config.bak-agent-identity" > "$codex_config"
  else
    printf '\n[shell_environment_policy.set]\nFINDEG_AGENT = "codex"\n' >> "$codex_config"
  fi
  echo "Codex now sets FINDEG_AGENT=codex ($codex_config; backup: $codex_config.bak-agent-identity)"
fi

echo
echo "Check from a findeg checkout:"
echo "  node scripts/agent-identity/token.mjs claude whoami"
echo "  FINDEG_AGENT=codex git var GIT_AUTHOR_IDENT   # expect findeg-codex[bot]"
