# Seed Data Layout

Seed source of truth is now:

- `scripts/data/seed/tables/*.csv`

Each CSV maps directly to a `public` schema table and is consumed by:

- `scripts/seed-db.js`

Schema design diagram is included in the same folder:

- `scripts/data/seed/tables/schema-diagram.mmd`

## Update Workflow

1. Export latest DB tables to CSV snapshot files.
2. Commit CSV updates.
3. Run `npm run db:seed` to reseed from snapshots.
4. Validate app flows and E2E behavior.
