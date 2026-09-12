# Operational expectations

This is the canonical phase-one runbook baseline. It describes required
operational behavior before target certification; it does not assert that every
legacy executable already provides it.

- Web, worker, and migrations start from explicit runtime composition and
  process-scoped validated configuration.
- Web and worker releases use the same revision and may restart independently.
- Migrations run through the single ordered PostgreSQL migration history before
  an application revision needing them receives traffic.
- Transactional outbox delivery occurs after commit, uses stable delivery IDs,
  retries failures, and retains exhausted failures for investigation.
- Production notification delivery fails closed until a configured, validated
  provider adapter exists. Development/test may use an explicit local sink.
- Deployments must expose structured logs and health/readiness signals for web,
  worker, database connectivity, and undelivered outbox work.
- Rollback never rewrites accepted Orders, reservations, or reward accounting;
  it uses forward corrective records or a compatible application revision.

The implementation-level commands and provider-specific procedures belong next
to the owning runtime adapter when that adapter is introduced.

See [Guest Checkout](guest-checkout.md) for ordinary Cart operations, retry behavior,
verification and the #59 delivery dependency.

## Executable foundation (#52)

Use Node and pnpm pinned by `.nvmrc` and `package.json`, then
`pnpm install --frozen-lockfile`. From the repository root:

```sh
export RELEASE_REVISION="$(git rev-parse HEAD)"
# Supply DATABASE_URL and optional DB_SSL for authenticated web requests.
pnpm runtime:build
pnpm start:web
# In another terminal, export the same RELEASE_REVISION:
pnpm start:worker
```

`pnpm dev` compiles server adapters and starts only the target web host with Next.js
development mode. `pnpm build` and `pnpm start` also select the target host.
No process loads the legacy global environment module. Supply variables in the
process environment; configuration parsing reports invalid keys without values.

| Process   | Configuration                                                                                         | Signals                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Web       | `RELEASE_REVISION` (40-character Git SHA), `DATABASE_URL`, optional `DB_SSL` and `NODE_ENV`           | Port 3000, `/health/live` reports revision and liveness                   |
| Worker    | Same release settings, `WORKER_HOST` (default `127.0.0.1`), `WORKER_PORT` (default 3100)              | `/health/live`, `/health/ready`, SIGTERM/SIGINT shutdown                  |
| Migration | Same release settings, `DATABASE_URL` (PostgreSQL URL), `DB_SSL` (`true` or `false`, default `false`) | Exits 0 on success, nonzero on invalid configuration or migration failure |

Migrations run explicitly with `pnpm migrate` after the build, before routing
traffic to a revision that needs them. The command uses `db/migrations`, regardless
of working directory, opens one connection, and closes it on success or failure.
`DB_SSL=true` verifies the server certificate and hostname. The process neither
generates migrations nor pushes a schema nor seeds data. The existing history is
retained for this ticket; #53 owns module data and schema assembly.

Portal entry points are `/en` and `/ar` for the Customer Storefront,
`/{locale}/partner` for Partner Workspace, and `/{locale}/back-office` for
FindEg Back Office. Each has a separate layout. Protected entry redirects to its
own sign-in page. Sign-in now uses PostgreSQL-backed Current Sessions; valid
sessions denied authorization remain signed in. Legacy cookies and client-supplied
roles cannot authorize the new host. See [Current Sessions](current-sessions.md)
for the fixed staff permissions, authentication setup, and HTTP behavior. See [Partner access](partner-access.md) for Partner Membership, invitations,
and selected Workspace context.

The worker currently provides supervision and lifecycle entry, with no delivery
adapter. Its readiness endpoint returns **503** (`delivery-not-configured`) in
every environment. It never reports successful delivery, consumes outbox records,
or sends notifications. #59 owns durable delivery and provider configuration.
Web liveness likewise does not certify database or business-operation readiness.
These foundations are not production certification; #63 owns that gate.

### One release image, independent processes

```sh
export RELEASE_REVISION="$(git rev-parse HEAD)"
docker compose -f compose.runtime.yml build web
# Supply DATABASE_URL and DB_SSL for the migration process first.
docker compose -f compose.runtime.yml run --rm migrate
docker compose -f compose.runtime.yml up -d web worker
docker compose -f compose.runtime.yml restart worker
```

`Dockerfile.runtime` compiles all target executables into one image tagged with the
revision. Web, worker, and migrations use that identical image. The revision is
baked into the image environment. Do not rebuild an existing deployed tag or
override the revision at runtime. Retain the previous image for compatible
application rollback; schema corrections use forward migrations. Compose
supervises web and worker independently. Health checks use liveness; delivery
readiness remains unavailable until #59. Worker health is internal to the container.

### Verification

`pnpm quality:check` includes a production web build, public runtime tests, HTTP
portal and worker-restart tests, and a real PostgreSQL migration/replay test.
The migration test creates and drops only a uniquely named temporary database.
By default the local runner owns a disposable PostgreSQL container; set
`MIGRATION_TEST_DATABASE_URL` to use an explicit test server instead. CI uses its
own PostgreSQL service. Existing architecture, type generation, type checks, and
legacy behavioral suites remain required.
