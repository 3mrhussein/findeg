# Delivery workflow

Use `develop` as the shared integration branch and `main` as the stable promotion
branch. Squash ticket PRs into `develop`; promote `develop` into `main` with merge
commits to retain ancestry between these long-lived branches.

## Starting a ticket

1. Read the issue and its blockers using `docs/agents/issue-tracker.md`. Start only
   when blocking tickets are merged, not merely committed on another branch.
2. Give each agent session a separate worktree and ticket branch from `develop`:

   ```sh
   git fetch origin
   git worktree add ../findeg-123 -b feat/123-short-description origin/develop
   cd ../findeg-123
   pnpm install --frozen-lockfile
   ```

3. Use `feat/`, `fix/`, `docs/`, or `chore/` plus the issue number. Keep research
   and prototype work on their dedicated branches. A spec lives in GitHub Issues;
   it does not need its own permanent branch.
4. Run `/implement` with the issue in a fresh session. Agree test seams, use
   red-green slices, and run Standards and Spec reviews against the starting
   commit. Commit only the ticket's work.
5. Open a PR with `gh pr create --base develop`, its issue link, and verification
   evidence. Agents may squash-merge their ticket PRs after the `Quality gate`
   passes, review findings are resolved, and the branch is current with `develop`.
   If another PR merges first, merge `origin/develop` into the ticket branch,
   resolve conflicts, push, and wait for fresh checks before merging.
6. Verify the PR is merged into `develop`, then record completion on the issue.
   `main` remains the GitHub default branch, so closing keywords on a PR targeting
   `develop` do not automatically close the issue. Close completed tickets explicitly.
7. Start the next unblocked ticket from the merged `develop` in a fresh session.

For parallel tickets, use separate worktrees and branches. Do not share a working
directory between concurrent implementations. Merge dependencies before starting
their dependents. Claim the issue before starting and record the branch/PR on it,
so another session can see it is in progress. Use one driving session per ticket.

## Promoting to main

Open a promotion PR with `gh pr create --base main --head develop`. Review the
combined changes and run the required checks. Promotion requires the maintainer's
approval; ordinary ticket authorization permits merging only into `develop`.
Merge promotions with a merge commit, retaining both long-lived branches. If
`main` has diverged (for example after a hotfix), integrate it back into `develop`
through a PR before continuing. Use a merge commit for that synchronization too.

## Changelog

`CHANGELOG.md` is manually maintained. `scripts/generate-changelog.js` is draft-only: use `--stdout` or an explicit temporary `--output`; never run it without an output flag or write `CHANGELOG.md`. Add concise audited delivery notes under `## Unreleased` when a material decision or intentionally excluded baseline needs durable context.

## Checks

Use the Node version in `.nvmrc` and the pnpm version in `package.json`.
`pnpm install --frozen-lockfile` installs dependencies and activates Husky locally.
Set `RELEASE_REVISION` to the full commit SHA when building or starting the target
runtime (for local work: `export RELEASE_REVISION="$(git rev-parse HEAD)"`).
The complete gate builds the unified web application and compiled server adapters,
then exercises portal HTTP entry, independent worker restart, and real PostgreSQL
migrations. Local migration checks start and remove a disposable Docker container;
start Docker Desktop first. CI supplies `MIGRATION_TEST_DATABASE_URL` from its
PostgreSQL service instead. That URL must name a test server whose user may create
and drop temporary databases.

Every commit formats staged files with lint-staged, then runs `pnpm quality:check`.
The same command runs in GitHub Actions on every PR, with no path filter:
architecture checks and their tests, Next.js type generation, workspace type
checking, and the existing test suites.

This is the initial implementation gate. It does not certify production readiness:
lint cleanup, broader real-database integration tests, deployment image certification, and
bilingual Cypress journeys need reliable gates as the target implementation lands.
The replaced workflows referenced obsolete packages and tool versions. Do not
treat the initial gate as evidence that their intended coverage has been achieved.

## Repository safeguards

Protect both `main` and `develop` against force pushes and deletion, require PRs and the `Quality gate`
status, and resolve review conversations before merging. For solo development,
human approval count may be zero: GitHub does not allow authors to approve their
own PRs. Matt's two-axis code review still applies; require another human's approval
when a second maintainer is available.

Existing long-lived work must be reviewed and integrated separately before new
dependent tickets branch from `develop`. Workflow setup alone does not merge it.

Target architecture documentation starts at
[`docs/architecture/README.md`](docs/architecture/README.md).
