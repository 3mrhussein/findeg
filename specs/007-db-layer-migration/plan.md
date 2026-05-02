# Database Layer Migration to Standalone `./db` Package

Migrate all database concerns from `backend/` to `./db` following bytedash architecture. Organize schema by PG namespace, create type-safe JSON seeding, update all scripts/configs, and clean backend.

## Proposed Changes

### DB Package Setup (`./db`)

#### [MODIFY] [package.json](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/db/package.json)

- Populate with `@findeg/db`, deps (`drizzle-orm`, `postgres`, `zod`, `cross-env`, `tsx`), scripts (`db:generate`, `db:migrate`, `db:seed`, `type-check`)

#### [MODIFY] [index.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/db/index.ts)

- Fix imports: use relative `./schema` and root `env.ts` via `@findeg/env`

#### [MODIFY] [drizzle.config.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/db/drizzle.config.ts)

- Fix paths, add `schemaFilter` for all 7 PG schemas

#### [MODIFY] [migrate.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/db/migrate.ts)

- Fix import paths to relative within package

#### [NEW] [seed.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/db/seed.ts)

- Orchestrator: truncate reverse-FK order → seed dependency order, `DB_SEEDING` guard

#### [NEW] [tsconfig.json](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/db/tsconfig.json)

- Extend root, `resolveJsonModule: true`

---

### Schema Reorganization (`./db/schema/`)

#### Reorganize 25 flat files into PG-schema subdirectories:

- `schema/identity/` — `identity-access.ts`, `users.ts`
- `schema/catalog/` — `brands.ts`, `categories.ts`, `products.ts`, `product-variants.ts`, `variant-pricing.ts`, `product-attributes.ts`, `tags.ts`, `collections.ts`
- `schema/sales/` — `orders.ts`, `cart-kits.ts`, `discount-rules.ts`, `reviews.ts`
- `schema/inventory/` — `inventory.ts`
- `schema/school-engine/` — `school-lists.ts`, `school-list-sessions.ts`, `school-access.ts`
- `schema/system/` — `audit-log.ts`, `server-logs.ts`, `search-logs.ts`, `notifications.ts`
- Root level (public) — `schemas.ts`, `addresses.ts`
- Each subdir gets a barrel `index.ts`; main `schema/index.ts` re-exports all

---

### Seed Infrastructure (`./db/seeds/`)

#### [NEW] seeds/index.ts + typed seed scripts

- One per domain entity, clean bytedash-style with shared helpers
- Helpers: `bcryptjs` password hashing (cost 12), FK lookups by name
- Each imports full data from `seeds/data/`

#### [NEW] seeds/data/\*.json

- Convert ALL 45 CSV files to JSON preserving real data
- Skip only tables with no corresponding schema table (deprecated)

---

### Config & Infrastructure Updates

#### [MODIFY] [root package.json](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/package.json)

- Update all `db:*` scripts to point to new `db/` package locations
- Replace shell script references with direct docker-compose commands where trivial
- Update `db:seed` to use `cross-env DB_SEEDING=true tsx db/seed.ts`

#### [MODIFY] [root tsconfig.json](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/tsconfig.json)

- Add path aliases mapping `"@findeg/db/*"` to `["./db/*"]`

#### [MODIFY] [docker-compose.yml](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/docker-compose.yml)

- Fix stale volume mount: `./packages/backend/scripts/init-db.sql` → `./db/init-db.sql`

#### [NEW] [db/init-db.sql](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/db/init-db.sql)

- Move from `backend/scripts/init-db.sql`

---

### Documentation Migration

#### [NEW] `db/docs/` — move from `backend/docs/database/`

- `SCHEMA.md`, `SETUP.md`, `TAXONOMY.md`

#### [MODIFY] [backend/README.md](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/backend/README.md)

- Update DB references to point to `@findeg/db` and `db/docs/`
- Clean merge conflicts from `006-docs-restructure` branch

---

### Backend Cleanup

#### [MODIFY] ~37 backend repository files

- `persistence/schema` imports → `@findeg/db/schema`
- `database.config` imports → `@findeg/db`

#### [MODIFY] [persistence/index.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/backend/src/features/core/infrastructure/persistence/index.ts)

- Re-export `db` from `@findeg/db`

#### [MODIFY] [backend/package.json](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/backend/package.json)

- Add `@findeg/db` dependency, remove `drizzle-kit`

#### [DELETE] Backend DB files

- `backend/drizzle.config.ts`
- `backend/src/features/core/infrastructure/persistence/database.config.ts`
- `backend/src/features/core/infrastructure/persistence/schema/` (entire dir)
- `backend/scripts/seed-brands.ts`, `seed-products.ts`, `seed-db.js`
- `backend/scripts/lib/csv-seed.js`
- `backend/scripts/data/seed/` (entire dir)
- `backend/scripts/db-stop.sh`, `backend/scripts/db-logs.sh` (trivial wrappers)
- `backend/scripts/db-start.sh`, `backend/scripts/db-reset.sh` (move logic to `db/` or simplify)
- `backend/scripts/init-db.sql` (moved to `db/`)
- `backend/scripts/generate-schema-doc.js` (if applicable, move to `db/`)
- `backend/docs/database/` (moved to `db/docs/`)

---

## Verification Plan

### Automated Tests

1. `pnpm --filter @findeg/db type-check`
2. `pnpm --filter @findeg/backend type-check`
3. `pnpm --filter @findeg/backend test:unit`

### Manual Verification

- `docker-compose up -d` — verify init-db.sql loads from `db/init-db.sql`
- `pnpm db:seed` — verify all tables seed with minimal data
- `pnpm db:migrate` — verify migration applies
- Verify no stale DB files remain in `backend/`
- Verify root `package.json` scripts all work
