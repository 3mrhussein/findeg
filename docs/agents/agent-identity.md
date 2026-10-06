# Agent GitHub identities

Claude Code and Codex each act on GitHub as their own GitHub App bot. That covers `gh` calls, `git push`, and commit authorship. PRs written by an agent are therefore authored by the agent's own bot (e.g. `claude[bot]`, `codex[bot]`; the name comes from the app, see below) rather than by you. This means:

- you can approve agent PRs (GitHub won't let you approve your own);
- the cross-agent review workflows can tell who opened a PR (`.github/workflows/bot-claude-review.yml`);
- each agent's access is limited to this repo and revocable on its own.

## Request reviews on a human PR

Amr can request a Claude review with a simple PR comment:

```text
@claude review
```

For Codex, comment `@codex review` (optionally with a focus, e.g. `@codex review for migration safety`). The Codex GitHub app (`chatgpt-codex-connector[bot]`) answers it on the ChatGPT plan's Codex limits. There is no Codex review workflow, `OPENAI_API_KEY` secret or `AUTO_REVIEW` mode for it. It reads review rules from `AGENTS.md`, and `.github/workflows/bot-codex-label.yml` adds the `Codex Reviewed` marker label when the bot comments or reviews.

The reviewer runs in GitHub Actions with live progress in the PR Checks tab. Reviews can be triggered manually in 3 ways:

1. Commenting `@claude review` (only comments from the repository owner run);
2. Adding label `review:claude` to the PR, whoever authored it, e.g. `gh pr create --label review:claude`;
3. Clicking the **Run workflow** button in the GitHub Actions tab (`workflow_dispatch`).

Automatic review on PR open is controlled by the repo variable `AUTO_REVIEW` (`claude` or `off`, default: `off`). Change it any of these ways:

```bash
node scripts/auto-review-mode.mjs         # show current
node scripts/auto-review-mode.mjs claude  # set (claude | off)
```

- the `/auto-review-mode [claude|off]` agent skill, which runs the script above;
- **Actions → Bot · Auto review mode → Run workflow** (works from the GitHub mobile app);
- an owner comment `/auto-review claude|off` on any issue or PR (no argument replies with the current mode);
- editing the variable under Settings → Secrets and variables → Actions → Variables.

The workflow and comment paths need a secret `AUTO_REVIEW_TOKEN`: a fine-grained PAT for this repo with **Variables: read and write** (the default `GITHUB_TOKEN` can't write variables). Set it with `gh secret set AUTO_REVIEW_TOKEN`.

Once a bot has run on a PR it adds a marker label (`Claude Reviewed`, or `Codex Reviewed` for the Codex app, created on first use), so the PR list shows who reviewed it. Labels are never removed automatically, so they mean "reviewed at least once", not "approved".

Notes:

- `AUTO_REVIEW` applies to every non-draft PR on open or ready-for-review, whoever authored it.
- Only the auto/label/dispatch paths use `.agents/skills/bot-pr-review`; comment triggers run whatever the comment asks for.
- A newer run on the same PR cancels the one in progress; skipped runs (e.g. an unrelated label) don't.

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

### 2. Repo variables the review workflows match PR authors against (once, and after renaming an app)

```bash
node scripts/agent-identity/sync-authors.mjs            # sets CLAUDE_PR_AUTHORS and CODEX_PR_AUTHORS
node scripts/agent-identity/sync-authors.mjs --dry-run  # just print them
```

Each `<AGENT>_PR_AUTHORS` variable is the bot login GitHub reports for that agent's app, plus any `extraBots` listed for it. `bot-claude-review.yml` passes both variables to `allowed_bots`, so no bot name is hardcoded in the workflow.

Settings live in `scripts/agent-identity/agents.json` (committed, no secrets):

- `appNamePrefix`: prepended to the agent name when `setup-app.mjs` creates an app (currently `findeg-`, matching the existing `findeg-claude`/`findeg-codex` apps; set it empty to name apps just `claude`/`codex`; `--name` or `FINDEG_AGENT_APP_PREFIX` override it). GitHub App names are globally unique, so a bare name may be taken; set a prefix then.
- `agents.<name>.extraBots`: other bot logins to allow for that agent, e.g. `chatgpt-codex-connector[bot]` for Codex.

To rename an existing app, change its name under GitHub → Settings → Developer settings → GitHub Apps, then re-run `sync-authors.mjs` (it also refreshes the stored git identity).

The workflow needs `CLAUDE_CODE_OAUTH_TOKEN` configured in the repository (`bot-claude-review.yml`).

### 3. Install the wrappers (each machine)

```bash
sh scripts/agent-identity/install.sh
```

It warns if a login shell would still find another `gh`/`git` first.

### 4. Check

```bash
node scripts/agent-identity/token.mjs claude whoami
node scripts/agent-identity/token.mjs codex whoami
FINDEG_AGENT=codex git var GIT_AUTHOR_IDENT   # the codex app's bot <…>
```

Tests: `node --test scripts/agent-identity/token.test.mjs`.
