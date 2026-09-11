# Delivery workflow

Use `main` as the integration branch. Each implementation ticket gets a short-lived
branch and a pull request. Use squash merges and delete merged branches.

## Starting a ticket

1. Read the issue and its blockers using `docs/agents/issue-tracker.md`. Start only
   when blocking tickets are merged, not merely committed on another branch.
2. Start from up-to-date `main`, with a clean working tree:

   ```sh
   git switch main
   git pull --ff-only
   git switch -c feat/123-short-description
   ```

3. Use `feat/`, `fix/`, `docs/`, or `chore/` plus the issue number. Keep research
   and prototype work on their dedicated branches. A spec lives in GitHub Issues;
   it does not need a permanent branch or `develop` branch.
4. Run `/implement` with the issue in a fresh session. Agree test seams, use
   red-green slices, and run Standards and Spec reviews against the starting
   commit. Commit only the ticket's work.
5. Open a PR into `main` with its issue link and verification evidence. Merge
   after the `Quality gate` check passes and review findings are resolved.
6. Start the next unblocked ticket from the merged `main` in a fresh session.

For parallel tickets, use separate worktrees and branches. Do not share a working
directory between concurrent implementations. Merge dependencies before starting
their dependents.

## Checks

Use the Node version in `.nvmrc` and the pnpm version in `package.json`.
`pnpm install --frozen-lockfile` installs dependencies and activates Husky locally.
Every commit formats staged files with lint-staged, then runs `pnpm quality:check`.
The same command runs in GitHub Actions on every PR, with no path filter:
architecture checks and their tests, Next.js type generation, workspace type
checking, and the existing test suites.

This is the initial implementation gate. It does not certify production readiness:
lint cleanup, real-database migration/integration tests, production builds, and
bilingual Cypress journeys need reliable gates as the target implementation lands.
The replaced workflows referenced obsolete packages and tool versions. Do not
treat the initial gate as evidence that their intended coverage has been achieved.

## Repository safeguards

Protect `main` against force pushes and deletion, require PRs and the `Quality gate`
status, and resolve review conversations before merging. For solo development,
human approval count may be zero: GitHub does not allow authors to approve their
own PRs. Matt's two-axis code review still applies; require another human's approval
when a second maintainer is available.

Existing long-lived work must be reviewed and integrated separately before new
dependent tickets branch from `main`. Workflow setup alone does not merge it.

Target architecture documentation starts at
[`docs/architecture/README.md`](docs/architecture/README.md).
