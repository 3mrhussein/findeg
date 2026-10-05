---
status: accepted
---

# Enforce Conventional Commits and matching branch naming

> **Amended (develop-branch flow, #312):** adds the `hotfix/` branch type for PRs into `main` only, exempts tooling branches, and replaces the "Branch and PR naming" workflow with `PR conventions`. See the Amendment below.

Commit history already follows Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`) informally, but nothing enforced it, and branch names carried no convention at all (e.g. `worktree-setup-matt-pocock-skills`, `011-dashboard-read-to-db`), making it hard to tell what a branch does before opening it.

We adopt Conventional Commits for commit messages and PR titles, and a matching `<type>/<kebab-case-slug>` convention for branch names, using the same type list (`feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`) so branch, commit, and PR naming agree. Enforcement is local-first (fast feedback, no CI round-trip) with CI as the backstop for anyone who skips hooks:

- **Commits**: `commitlint` (`@commitlint/config-conventional`) on a husky `commit-msg` hook.
- **Branches**: `scripts/validate-branch-name.mjs` on a husky `pre-push` hook; harness-generated `worktree-*` branches are exempt since they aren't human-chosen task names.
- **PRs**: the `PR conventions` workflow (`.github/workflows/pr-conventions.yml`) checks the PR title (`PR title`, via `amannn/action-semantic-pull-request`) and the head branch (`Branch policy`) on every PR, catching anything that bypassed local hooks (e.g. `--no-verify`, or a push from a client without hooks installed).

## Considered options

- **Conventional Branch spec verbatim** (`feature/`, `bugfix/`, `hotfix/`, `release/`) — rejected in favor of reusing the Conventional Commits type list already live in this repo's history, so one vocabulary covers commits, branches, and PR titles instead of two.
- **CI-only enforcement, no local hooks** — rejected: failing fast locally (before push) is cheaper than a red CI check on an already-open PR.

## Amendment: develop-branch flow

The develop-branch flow (#312) sends feature PRs into `develop` and lets only releases and urgent fixes into `main`. Branch naming changes to match:

- **`hotfix/<kebab-case-slug>` is a branch type, valid only for PRs into `main`.** It marks the one path that skips `develop`, so `Branch policy` rejects a `hotfix/*` PR into any other base. Hotfix commits and PR titles still use `fix:`. `hotfix` is not a commit type, so the changelog and release-please see an ordinary fix.
- **PRs into `main` must come from `develop`, `hotfix/*` or `release-please--*`.** Every other branch goes through `develop` first.
- **Exempt branches:** `main`, `develop`, `release-please--*`, `dependabot/*` and `worktree-*`. These are long-lived branches or are named by tooling, not chosen by a person. `master` is no longer exempt, since the repo has none.
- **One rule, two callers.** The rules live in `scripts/ci-policy/policy.mjs`, a pure module with `node:test` tests. Both the pre-push hook and the `Branch policy` check call it, so local and CI enforcement can't drift apart. At push time no PR exists yet, so the hook can't know the base. It accepts `hotfix/*` and skips the release-source rule, and `Branch policy` enforces both once the PR is open. It re-runs when the PR's base is edited.
- **The `PR conventions` workflow replaces "Branch and PR naming".** Its jobs are named `PR title` and `Branch policy`, matching the names the rulesets require. The PR-title check is unchanged.
