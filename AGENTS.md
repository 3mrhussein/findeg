## Agent skills

### Issue tracker

GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (root `CONTEXT.md` + `docs/adr/`) when those files exist. See `docs/agents/domain.md`.

### Next.js version

`frontend/dashboard` and `frontend/storefront` pin a Next.js version newer than training data, with breaking API/convention changes. Before writing Next.js-specific code, read `node_modules/next/AGENTS.md` and the bundled docs it points to (`node_modules/next/dist/docs/`) rather than relying on memory.

### Branch, commit, and PR naming

Conventional Commits, enforced by commitlint on `commit-msg` and by `.github/workflows/branch-and-pr-naming.yml` on PR title. Branches follow `<type>/<kebab-case-slug>` (e.g. `feat/backend-feature-barrels`), enforced by `scripts/validate-branch-name.mjs` on `pre-push` and by the same workflow for the PR's head branch. Types: `feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`. See `docs/adr/0002-conventional-branch-and-commit-naming.md`.

### Implement PR mode

The per-user, untracked preference lives in `~/.config/findeg/implement-pr-mode`, accessed only via `node scripts/implement-pr-mode.mjs` (no arg prints `auto` or `ask`; a missing or invalid value reads as `ask`). When the user asks to enable or disable auto PR, run `node scripts/implement-pr-mode.mjs auto` or `... ask`. The `implement` skill reads it after committing, and an explicit instruction in the current request overrides it.

### Agent GitHub identity

On machines set up per `docs/agents/agent-identity.md`, Claude Code and Codex act on GitHub as their own GitHub App bots: the user-level `gh`/`git` wrappers switch automatically. Reviews can be triggered manually at any time via:

- Commenting `@claude review` or `@codex review` on the PR;
- Adding the label `agent:claude` or `agent:codex` in the PR sidebar;
- Clicking the **Run workflow** button in GitHub Actions under the review workflows (`workflow_dispatch`).

Automatic review on PR open is controlled by the repo variable `AUTO_AGENT_REVIEW` (default: `false` / off). Toggle it anytime with `node scripts/auto-review-mode.mjs on|off`.
