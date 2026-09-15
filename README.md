# FindEg

FindEg is a bilingual Egyptian stationery marketplace with one target web application and a separate notification worker.

## Target architecture

- `frontend/web` owns the Customer Storefront, Partner Workspace, and FindEg Back Office routes.
- `backend` owns framework-independent application operations and business modules.
- `db` owns the assembled schema and the ordered PostgreSQL migration history.
- `runtime` owns process configuration and web, worker, and migration composition.
- `frontend/ui` retains prototype presentation components for possible reuse; the target web application does not currently depend on it.

The original Storefront and Dashboard sources, pages, themes, assets, and tests are preserved in `frontend/storefront` and `frontend/dashboard` as migration references, outside the active workspace. Their full experience has not yet been migrated. Follow the [frontend preservation and migration map](docs/frontend-migration.md) before changing or removing them. The supported runtime is `frontend/web`; obsolete database setup entry points remain removed.

## Development

### Quick start

```sh
pnpm local:up
```

This generates `.env.local` with local dev credentials (skipped if one already
exists), starts Docker and Postgres, installs dependencies, compiles the
runtime, runs migrations, and starts the web app on port 3000 — in that order,
with colorized progress and clear errors. It's safe to rerun on any machine.
Run `pnpm local:up --help` for options (`--reset` for a fresh database,
`--skip-install`, `--no-dev` to provision without starting the server). See
[scripts/local-up.mjs](scripts/local-up.mjs).

### Manual steps

Use the Node version in `.nvmrc` and pnpm `11.24.0` from `package.json`.
Supply `DATABASE_URL` and optional `DB_SSL` in the process environment. To use
local PostgreSQL, set `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT` for
`docker-compose.yml`, start it with `pnpm db:run`, and use the matching connection
URL. After installing dependencies, compile the migration adapter and apply the
ordered history before starting the web application:

```sh
pnpm install --frozen-lockfile
export RELEASE_REVISION="$(git rev-parse HEAD)"
pnpm runtime:compile
pnpm migrate
pnpm dev
```

The target web application runs on port 3000. For a production-style local run:

```sh
export RELEASE_REVISION="$(git rev-parse HEAD)"
pnpm runtime:build
pnpm start:web
# In another terminal with the same release and database environment:
pnpm start:worker
```

Run the ordered migration history explicitly with `pnpm migrate` before using a
revision that needs new migrations.

## Verification

```sh
pnpm quality:check
pnpm security:check
```

The quality gate covers the target build, architecture and HTTP contracts, type generation, type checks, application tests, runtime process tests, and PostgreSQL migration/replay checks. See [docs/operations/README.md](docs/operations/README.md) for supported startup, migration, health, recovery, and monitoring paths.

## Documentation

- [Target architecture](docs/architecture/README.md)
- [Package guidance](docs/package-guidance.md)
- [Operational runbook](docs/operations/README.md)
- [Production certification and controlled release](docs/operations/production-readiness.md)
- [OpenAPI v1 contract](docs/contracts/openapi/v1.yaml)
