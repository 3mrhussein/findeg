# Contributing

Use the native Matt Pocock skills for planning, implementation, and review.
See [the skill installation](docs/agents/skills.md) for the upstream source and
[ask-matt](.agents/skills/ask-matt/SKILL.md) for choosing a workflow.

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

## Pull requests

Pull requests must pass `Quality gate` and resolve review conversations before
merge. The existing `main` and `develop` branches remain protected against force
pushes and deletion.

Target architecture documentation starts at
[`docs/architecture/README.md`](docs/architecture/README.md).
