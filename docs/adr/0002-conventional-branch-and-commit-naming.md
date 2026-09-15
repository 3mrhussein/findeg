---
status: accepted
---

# Enforce Conventional Commits and matching branch naming

Commit history already follows Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`) informally, but nothing enforced it, and branch names carried no convention at all (e.g. `worktree-setup-matt-pocock-skills`, `011-dashboard-read-to-db`), making it hard to tell what a branch does before opening it.

We adopt Conventional Commits for commit messages and PR titles, and a matching `<type>/<kebab-case-slug>` convention for branch names, using the same type list (`feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`) so branch, commit, and PR naming agree. Enforcement is local-first (fast feedback, no CI round-trip) with CI as the backstop for anyone who skips hooks:

- **Commits**: `commitlint` (`@commitlint/config-conventional`) on a husky `commit-msg` hook.
- **Branches**: `scripts/validate-branch-name.mjs` on a husky `pre-push` hook; harness-generated `worktree-*` branches are exempt since they aren't human-chosen task names.
- **PRs**: `.github/workflows/branch-and-pr-naming.yml` checks the PR title (via `amannn/action-semantic-pull-request`) and the head branch name on every PR, catching anything that bypassed local hooks (e.g. `--no-verify`, or a push from a client without hooks installed).

## Considered options

- **Conventional Branch spec verbatim** (`feature/`, `bugfix/`, `hotfix/`, `release/`) — rejected in favor of reusing the Conventional Commits type list already live in this repo's history, so one vocabulary covers commits, branches, and PR titles instead of two.
- **CI-only enforcement, no local hooks** — rejected: failing fast locally (before push) is cheaper than a red CI check on an already-open PR.
