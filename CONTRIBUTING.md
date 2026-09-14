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
the runner checks Docker first and, on macOS, installs missing Docker Desktop
from the official download and starts it. Complete any first-run setup in its
window. Run `pnpm docker:ensure` to prepare it separately. Other operating systems
and CI require pre-provisioned Docker; supplying the test database URL skips
Docker setup entirely. CI supplies `MIGRATION_TEST_DATABASE_URL` from its
PostgreSQL service instead. That URL must name a test server whose user may create
and drop temporary databases.

Every commit formats staged files with lint-staged, then runs `pnpm quality:check`.
The same command runs in GitHub Actions on every PR, with no path filter:
architecture checks and their tests, Next.js type generation, workspace type
checking, and the existing test suites.

The gate includes lint, real-PostgreSQL workflows, contracts, and Arabic/English
Cypress Customer and operator journeys. `pnpm security:check` is a separate
blocking dependency audit; the Documentation gate requires canonical updates for
implementation changes. Production certification additionally requires independent
security, migration, documentation and release review and validated delivery.
See [production readiness](docs/operations/production-readiness.md).

## Pull requests

Pull requests must pass `Quality gate`, `Security gate`, and `Documentation gate` and resolve review conversations
before merge. The existing `main` and `develop` branches remain protected
against force pushes and deletion.

Target architecture documentation starts at
[`docs/architecture/README.md`](docs/architecture/README.md).
