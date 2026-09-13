# Database

The target runtime uses one ordered PostgreSQL history in `migrations` and the
owner schema assembly in `src/runtime/schema.ts`. Persistence adapters receive
connections and transactions from runtime composition. Browser code must not
import any `@findeg/db` entry point, including its schema and type barrels.

From the repository root, supply `DATABASE_URL` and optional `DB_SSL`, then run:

```sh
export RELEASE_REVISION="$(git rev-parse HEAD)"
pnpm runtime:compile
pnpm migrate
```

These are the supported migration commands. `db:generate` drafts migrations for
review; it does not apply them. `db:studio` is an inspection tool, not a schema
deployment path. See the [runbook](../docs/operations/README.md) for startup,
migration/replay verification, and operational procedures.

The root, connection, schema, query, and type exports retain prototype
compatibility callers. `seed.ts`, `seeds`, and `db:seed` are historical fixture
tools for disposable prototype databases only: they truncate data and do not
provision target access. They are not part of target startup or migration.
Target tests own their fixtures; see [Current Sessions](../docs/operations/current-sessions.md)
for target authentication setup.

Retire compatibility tools and exports only after their last callers are removed
and replacement gates pass. Retain schema mappings still used by owner schemas.
The original SQL and snapshots remain required immutable migration history;
code cleanup must not remove them or persisted records. The
[retirement register](../docs/package-guidance.md#retained-compatibility-evidence-64)
defines these boundaries separately.
