# Agent GitHub identities

Claude Code and Codex each act on GitHub as their own GitHub App bot. That covers `gh` calls, `git push`, and commit authorship. PRs written by an agent are therefore authored by `findeg-claude[bot]` or `findeg-codex[bot]` rather than by you. This means:

- you can approve agent PRs (GitHub won't let you approve your own);
- the cross-agent review workflows can tell who opened a PR (`.github/workflows/claude-review.yml`, `codex-review-trigger.yml`);
- each agent's access is limited to this repo and revocable on its own.

`scripts/agent-identity/token.mjs` mints short-lived installation tokens (1 hour, cached until 5 minutes before expiry). The `gh` and `git` wrappers in `scripts/agent-identity/bin/` call it on every use, so long sessions never hold an expired token. The wrappers bypass your own git credential helpers (keychain, `store`), so an agent can't fall back to your credentials or save its token into them.

## One-time setup (per repo owner)

1. Create two GitHub Apps under **Settings → Developer settings → GitHub Apps → New GitHub App**, one per agent, e.g. `findeg-claude` and `findeg-codex`:
   - **Webhook:** uncheck _Active_.
   - **Repository permissions:**
     - Contents: Read and write
     - Pull requests: Read and write
     - Issues: Read and write
     - Workflows: Read and write (only if agents may edit `.github/workflows`)
     - Metadata: Read-only (always required)
   - **Where can this app be installed:** _Only on this account_.
2. On each app's page, **Install App** → only select `findeg`.
3. Set the repo variables the review workflows match PR authors against:

   ```bash
   gh variable set CLAUDE_PR_AUTHORS --body 'findeg-claude[bot]'
   gh variable set CODEX_PR_AUTHORS --body 'findeg-codex[bot],chatgpt-codex-connector[bot]'
   ```

## Per-machine setup

1. On each app's page, **Generate a private key** and move it into place:

   ```bash
   mkdir -p ~/.config/findeg/agents && chmod 700 ~/.config/findeg/agents
   mv ~/Downloads/findeg-claude.*.private-key.pem ~/.config/findeg/agents/claude.pem
   mv ~/Downloads/findeg-codex.*.private-key.pem ~/.config/findeg/agents/codex.pem
   chmod 600 ~/.config/findeg/agents/*.pem
   ```

2. Write `~/.config/findeg/agents/claude.json` and `codex.json`, using the **App ID** from each app's page:

   ```json
   { "appId": 123456, "privateKeyPath": "~/.config/findeg/agents/claude.pem" }
   ```

3. Check that each one works:

   ```bash
   node scripts/agent-identity/token.mjs claude whoami
   node scripts/agent-identity/token.mjs codex whoami
   ```

### Claude Code

Add this SessionStart hook to `.claude/settings.json`, or to `.claude/settings.local.json` to keep it to your machine:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/agent-identity/claude-session-start.sh"
          }
        ]
      }
    ]
  }
}
```

The hook writes the identity exports to `$CLAUDE_ENV_FILE`, so every Bash command in the session uses the Claude bot. On a machine without `claude.json`, it does nothing.

### Codex CLI

Codex's hooks and `config.toml` can't change `PATH` for shell commands, so start Codex through the launcher:

```bash
alias codex-findeg='scripts/agent-identity/with-agent.sh codex codex'
```

The `gh` and `git` wrappers need network access to reach `api.github.com`, just like `gh` does already.

## How to tell it's working

In an agent's shell, `command -v gh` should point at `scripts/agent-identity/bin/gh`, and `echo $GIT_AUTHOR_NAME` should print the bot login. A pushed commit and an opened PR should show the bot as author.

Tests: `node --test scripts/agent-identity/token.test.mjs`.
