# FindEg

FindEg is a bilingual Egyptian stationery marketplace with one target web application and a separate notification worker.

## Target architecture

- `frontend/web` owns the Customer Storefront, Partner Workspace, and FindEg Back Office routes.
- `backend` owns framework-independent application operations and business modules.
- `db` owns the assembled schema and the ordered PostgreSQL migration history.
- `runtime` owns process configuration and web, worker, and migration composition.
- `frontend/ui` retains prototype presentation components for possible reuse; the target web application does not currently depend on it.

The retired Storefront and Dashboard applications, their dedicated tests, and obsolete database setup entry points are no longer workspace packages. Historical architecture documents are context only; the canonical target is documented in [docs/architecture/README.md](docs/architecture/README.md).

## Development

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
