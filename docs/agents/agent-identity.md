# Agent GitHub identities

Claude Code and Codex each act on GitHub as their own GitHub App bot. That covers `gh` calls, `git push`, and commit authorship. PRs written by an agent are therefore authored by `findeg-claude[bot]` or `findeg-codex[bot]` rather than by you. This means:

- you can approve agent PRs (GitHub won't let you approve your own);
- the cross-agent review workflows can tell who opened a PR (`.github/workflows/claude-review.yml`, `.github/workflows/codex-review.yml`);
- each agent's access is limited to this repo and revocable on its own.

## Request reviews on a human PR

Amr can request either reviewer, or both, with a simple PR comment:

```text
@claude review
```

```text
@codex review
```

```text
@codex review
@claude review
```

Both agents run in GitHub Actions with live progress in the PR Checks tab. Reviews can be triggered manually in 3 ways:

1. Commenting `@claude review` or `@codex review` (only comments from the repository owner run);
2. Adding label `agent:claude` or `agent:codex` to the PR;
3. Clicking the **Run workflow** button in the GitHub Actions tab (`workflow_dispatch`).

Automatic review on PR open is disabled by default and controlled by the repo variable `AUTO_AGENT_REVIEW`. Toggle it anytime via:

```bash
node scripts/auto-review-mode.mjs on   # enable auto-review on PR open
node scripts/auto-review-mode.mjs off  # disable auto-review (manual only)
```

## How it works

`scripts/agent-identity/install.sh` puts `gh` and `git` wrappers in `~/.local/bin`, ahead of the real ones. A wrapper switches to a bot only when both of these hold:

- **an agent is running it.** Codex sets `FINDEG_AGENT=codex` through `~/.codex/config.toml`. Claude Code sets `CLAUDECODE=1` in every shell it starts, which counts as `claude`.
- **it runs inside a findeg checkout** that has `scripts/agent-identity/token.mjs`, and the agent is configured on this machine.

Because the switch keys on the agent's environment rather than on how it was started, it works the same from the CLI, the desktop apps, and the IDE extensions. Everywhere else, including your own terminal, the wrappers are plain `gh` and `git`.

In agent mode:

- **`gh`** gets `GH_TOKEN`, a 1-hour GitHub App installation token minted by `token.mjs`. Tokens are cached until 5 minutes before expiry, in `~/.cache` or in the temp directory when a sandbox blocks `~/.cache`.
- **`git`** commits as the bot (`<slug>[bot] <id>+<slug>[bot]@users.noreply.github.com`) and authenticates to github.com with the bot's token. Your own credential helpers (keychain, `store`) are bypassed, so an agent can't fall back to your credentials or save its token into them.

If an agent is detected in a findeg checkout but its configuration is missing
or invalid, both wrappers fail closed instead of using the human identity.

`FINDEG_AGENT=none` forces plain `gh`/`git`, e.g. `FINDEG_AGENT=none gh secret set …` from a Claude `!` prompt, since the bots can't manage secrets.

## Setup

### 1. Create and install each app (repo owner, once)

From a findeg checkout:

```bash
node scripts/agent-identity/setup-app.mjs claude
node scripts/agent-identity/setup-app.mjs codex
```

Each run opens GitHub with a pre-filled app manifest: private app, no webhook, and Contents, Pull requests, Issues and Workflows read/write. Click **Create GitHub App**, then **Install** on `findeg` only. The script saves the private key and `~/.config/findeg/agents/<agent>.json` (including the bot's git identity).

On another machine, copy `~/.config/findeg/agents/` across rather than creating new apps.

### 2. Repo variables the review workflows match PR authors against (once)

```bash
gh variable set CLAUDE_PR_AUTHORS --body 'findeg-claude[bot]'
gh variable set CODEX_PR_AUTHORS --body 'findeg-codex[bot],chatgpt-codex-connector[bot]'
```

Both agent review workflows need their respective API secrets configured in the repository:

- `CLAUDE_CODE_OAUTH_TOKEN` for Claude Code (`claude.yml`, `claude-review.yml`).
- `OPENAI_API_KEY` for Codex Action (`codex.yml`, `codex-review.yml`).

```bash
gh secret set OPENAI_API_KEY
```

### 3. Install the wrappers (each machine)

```bash
sh scripts/agent-identity/install.sh
```

It warns if a login shell would still find another `gh`/`git` first.

### 4. Check

```bash
node scripts/agent-identity/token.mjs claude whoami
node scripts/agent-identity/token.mjs codex whoami
FINDEG_AGENT=codex git var GIT_AUTHOR_IDENT   # findeg-codex[bot] <…>
```

Tests: `node --test scripts/agent-identity/token.test.mjs`.
