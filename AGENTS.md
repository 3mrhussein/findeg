## Agent skills

### Issue tracker

GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (root `CONTEXT.md` + `docs/adr/`) when those files exist. See `docs/agents/domain.md`.

### Branch, commit, and PR naming

Conventional Commits, enforced by commitlint on `commit-msg` and by `.github/workflows/branch-and-pr-naming.yml` on PR title. Branches follow `<type>/<kebab-case-slug>` (e.g. `feat/backend-feature-barrels`), enforced by `scripts/validate-branch-name.mjs` on `pre-push` and by the same workflow for the PR's head branch. Types: `feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`. See `docs/adr/0002-conventional-branch-and-commit-naming.md`.
