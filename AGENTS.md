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

### PR authorship label

When you open a pull request, label it with the agent that wrote it: `gh pr create --label agent:claude` from Claude Code, `--label agent:codex` from Codex. The label drives cross-agent review: `.github/workflows/codex-review-trigger.yml` asks Codex to review `agent:claude` PRs, and `.github/workflows/claude-review.yml` has Claude review `agent:codex` PRs.

## Code Review Rules

Review the way `.agents/skills/code-review/SKILL.md` describes, on two separate axes:

- **Standards**: does the diff follow this repo's documented standards? Those are this file, `CONTEXT.md`, `docs/adr/`, and `docs/agents/`. Fowler code smells are judgement calls only, and a documented repo standard overrides them.
- **Spec**: does the diff do what the originating issue asked? The spec is the issue the PR closes (`Closes #N`), plus its parent issue if it has one. Treat an acceptance criterion that is missing, or implemented wrongly, as P1. Flag behaviour the issue didn't ask for.

Keep findings from the two axes apart, and quote the standard or spec line behind each one.
