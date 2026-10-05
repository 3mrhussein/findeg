## Agent skills

### Issue tracker

GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (root `GLOSSARY.md` + `docs/adr/`) when those files exist. See `docs/agents/domain.md`.

### Next.js version

`frontend/dashboard` and `frontend/storefront` pin a Next.js version newer than training data, with breaking API/convention changes. Before writing Next.js-specific code, read `node_modules/next/AGENTS.md` and the bundled docs it points to (`node_modules/next/dist/docs/`) rather than relying on memory.

### Branch naming

Branches follow `<type>/<kebab-case-slug>` (e.g. `feat/backend-feature-barrels`).
Types: `feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`. See `docs/adr/0002-conventional-branch-and-commit-naming.md`.
