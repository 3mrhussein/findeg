# Feature Specification: Database Layer Migration to Standalone Package

**Feature Branch**: `007-db-layer-migration`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "Migrate DB layer from backend/ to ./db following bytedash type-safe clean architecture, with JSON-based seeding and backend cleanup"

## Clarifications

### Session 2026-04-20

- Q: Schema file grouping strategy for 25 flat schema files? → A: Group by PostgreSQL schema — subdirectories `identity/`, `catalog/`, `sales/`, `inventory/`, `school-engine/`, `system/`, plus root-level files for `public` schema tables.
- Q: Where should database documentation (SCHEMA.md, SETUP.md, TAXONOMY.md) live after migration? → A: Co-located inside the db package at `db/docs/`.
- Q: Seed data scope and approach for CSV-to-JSON conversion? → A: For CSVs with existing data, preserve ALL data in JSON. For empty/header-only CSVs, add minimal representative data to validate the seeding orchestration. Seed scripts must be clean and organized like bytedash — use helpers to maintain correct data relations (e.g., FK lookups by name). Use the same `bcryptjs` hashing logic as the app (cost factor 12) for password seeding. Also clean unused shell scripts from `backend/scripts/` that can be replaced with simple docker-compose commands.

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: The `db/` package becomes a standalone workspace package; backend imports from `@findeg/db` only
- **II. Server-Components First**: N/A — infrastructure-only change, no UI
- **III. Bilingual & RTL-First**: N/A — no UI text
- **IV. Feature-Oriented Core Kernel**: DB package is a shared infrastructure package, not feature-specific
- **V. Type-Safe & Testable**: Zod-validated env config; typed seed scripts; type-safe Drizzle schema
- **VI. DRY Principle**: Single source of truth for DB connection, schema, and seeding — eliminating current duplication between backend/src and backend/scripts
- **VII. SOLID Design**: DB package has single responsibility (data persistence); backend decoupled from DB internals

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Complete DB Package Setup (Priority: P1)

A developer needs a self-contained `./db` workspace package that owns all database concerns: connection, schema (organized by PostgreSQL schema namespace), migrations, and seeding — following the bytedash clean architecture pattern.

**Why this priority**: Without a complete DB package, no other workspace packages can reliably use the database layer independently.

**Independent Test**: Can be tested by running `pnpm --filter @findeg/db type-check` and verifying the package compiles with zero errors.

**Acceptance Scenarios**:

1. **Given** the db package has a valid `package.json` with name `@findeg/db`, **When** `pnpm install` is run, **Then** the package is recognized as a workspace member
2. **Given** the db package has `drizzle.config.ts`, `index.ts`, `migrate.ts`, and `seed.ts`, **When** TypeScript type-checks, **Then** all files pass with zero errors
3. **Given** the db package references `@findeg/env` for environment variables, **When** env vars are set, **Then** db connection is established using Zod-validated config
4. **Given** schema files are organized into subdirectories by PostgreSQL schema (`identity/`, `catalog/`, `sales/`, `inventory/`, `school-engine/`, `system/`), **When** the barrel index re-exports all, **Then** all downstream imports resolve correctly

---

### User Story 2 - JSON-Based Type-Safe Seeding (Priority: P1)

A developer needs to seed the database from JSON data files using typed seed scripts that follow the bytedash pattern: JSON data → typed seed functions → orchestrated seeder with table truncation. JSON data preserves ALL existing CSV data. Seed scripts use shared helpers (e.g., `bcryptjs` for password hashing, FK lookups by name) to maintain correct data relations.

**Why this priority**: Seeding is essential for development and testing environments.

**Independent Test**: Can be tested by running `pnpm db:seed` and verifying all tables are populated correctly.

**Acceptance Scenarios**:

1. **Given** JSON data files exist in `db/seeds/data/`, **When** each file is imported, **Then** TypeScript validates the data shape at compile time
2. **Given** a seed orchestrator runs in dependency order, **When** `pnpm db:seed` executes, **Then** all tables are truncated and re-seeded in the correct FK order
3. **Given** seed scripts use relational lookups (e.g., resolving category name → ID), **When** a referenced entity is missing, **Then** the script throws a descriptive error
4. **Given** password seed data stores plaintext passwords in JSON, **When** seeding runs, **Then** passwords are hashed using `bcryptjs` (cost factor 12) matching the app's auth strategy

---

### User Story 3 - Backend & Infrastructure Cleanup (Priority: P2)

A developer needs the old database-related files removed from `backend/`, unused shell scripts cleaned, root `package.json` scripts updated, `docker-compose.yml` fixed, and database docs migrated to `db/docs/`.

**Why this priority**: Cleanup prevents confusion and import conflicts, but the system functions without it.

**Independent Test**: Can be tested by verifying `backend/` has no `drizzle.config.ts`, no `database.config.ts`, no schema files, no seeding scripts, and no trivial shell script wrappers — and `pnpm type-check` still passes.

**Acceptance Scenarios**:

1. **Given** all DB files are in `./db`, **When** `backend/src/features/core/infrastructure/persistence/schema/` is removed, **Then** backend imports from `@findeg/db` instead
2. **Given** `backend/scripts/seed-*.ts`, `seed-db.js`, and trivial shell scripts (`db-stop.sh`, `db-logs.sh`) are removed, **When** developers need these functions, **Then** equivalent commands are available via root `package.json` scripts or `docker-compose` directly
3. **Given** root `package.json` db scripts are updated, **When** `pnpm db:seed` runs, **Then** it invokes the new `db/seed.ts` orchestrator
4. **Given** `docker-compose.yml` init-db.sql volume mount is fixed, **When** Docker starts, **Then** the init script loads from `db/init-db.sql`
5. **Given** database docs (SCHEMA.md, SETUP.md, TAXONOMY.md) are moved to `db/docs/`, **When** the backend README references database docs, **Then** links point to `db/docs/`

---

### User Story 4 - Migration Script (Priority: P2)

A developer needs a working migration script so schema changes can be applied to the database via Drizzle Kit.

**Why this priority**: Migrations are needed for deployment but not for initial development setup.

**Independent Test**: Can be tested by running `pnpm db:migrate` and verifying migrations apply cleanly.

**Acceptance Scenarios**:

1. **Given** the migrate script reads `DB_MIGRATING=true`, **When** the env var is not set, **Then** it throws a clear error
2. **Given** migration SQL files exist in `db/migrations/`, **When** `pnpm db:migrate` runs, **Then** all pending migrations are applied

---

### Edge Cases

- What happens when the database is unreachable during seeding? → Connection error propagates with a clear message
- What happens when a seed JSON references a non-existent FK entity? → Descriptive error thrown with entity name and failed lookup value
- What happens when `DB_SEEDING` env var is not set? → Seed script refuses to run with clear instructions
- What happens when a CSV table no longer exists in the current schema? → It is skipped; no JSON file is created for deprecated tables

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a `db/package.json` with name `@findeg/db`, correct dependencies (`drizzle-orm`, `postgres`, `zod`), and npm scripts for `db:generate`, `db:migrate`, `db:seed`
- **FR-002**: System MUST provide a `db/index.ts` that exports the database connection and typed `Db` type, using `@findeg/env` for configuration
- **FR-003**: System MUST provide a `db/drizzle.config.ts` pointing to schema at `./schema/index.ts` and migrations output at `./migrations`
- **FR-004**: System MUST provide a `db/migrate.ts` that runs Drizzle migrations with `DB_MIGRATING` guard
- **FR-005**: System MUST provide a `db/seed.ts` orchestrator that truncates tables in reverse-FK order and seeds in dependency order
- **FR-006**: System MUST provide typed seed scripts in `db/seeds/` — one per domain entity — importing JSON data from `db/seeds/data/`
- **FR-007**: System MUST convert CSV seed data to JSON: preserve ALL existing data for populated CSVs, add minimal representative data for empty/header-only CSVs. Seed scripts MUST use helpers (bcryptjs hashing, FK lookups) matching the app's data handling patterns
- **FR-008**: System MUST update `backend/` to import DB connection from `@findeg/db` instead of local persistence files
- **FR-009**: System MUST remove old DB files from `backend/` (schema, database.config.ts, drizzle.config.ts, seed scripts, csv-seed lib, trivial shell scripts)
- **FR-010**: System MUST NOT create any Express API server — db package is infrastructure only
- **FR-011**: System MUST adapt the root `tsconfig.json` to properly resolve the `@findeg/db` path aliases across the monorepo
- **FR-012**: System MUST organize schema files into subdirectories by PostgreSQL schema namespace (`identity/`, `catalog/`, `sales/`, `inventory/`, `school-engine/`, `system/`)
- **FR-013**: System MUST update root `package.json` db scripts to point to new `db/` package locations
- **FR-014**: System MUST fix `docker-compose.yml` init-db.sql volume mount path
- **FR-015**: System MUST move database documentation (SCHEMA.md, SETUP.md, TAXONOMY.md) from `backend/docs/database/` to `db/docs/` and update all doc references

### Key Entities

- **DB Connection**: Singleton postgres.js + Drizzle ORM instance with all schema registered
- **Schema**: 25 table definition files organized into subdirectories by PostgreSQL schema namespace (identity, catalog, sales, inventory, school-engine, system, public)
- **Seed Data**: JSON files preserving ALL existing CSV data for each seedable table
- **Seed Scripts**: Clean, bytedash-style typed functions with shared helpers — FK lookups by name, bcryptjs password hashing (cost 12), mapped JSON → Drizzle insert

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `pnpm --filter @findeg/db type-check` passes with zero errors
- **SC-002**: `pnpm db:seed` populates all development tables successfully
- **SC-003**: `pnpm db:migrate` applies all pending migrations successfully
- **SC-004**: `pnpm --filter @findeg/backend type-check` passes after backend cleanup
- **SC-005**: All existing CSV seed data is fully converted to JSON with correct data preservation
- **SC-006**: Zero database-related files remain in `backend/` persistence layer (schema, config, seed scripts, trivial shell wrappers)
- **SC-007**: Root `package.json` db scripts all resolve to correct paths
- **SC-008**: `docker-compose up` starts PostgreSQL with correct init-db.sql mount

## Assumptions

- The existing 25 schema files in `db/schema/` are already correct and match the backend's schema files (they appear to be copies)
- The root `env.ts` at project root already provides `DB_MIGRATING`, `DB_SEEDING`, and `DATABASE_URL` via Zod — the db package will import from `@findeg/env`
- PostgreSQL is running locally via `docker-compose.yml` during development
- The `pnpm-workspace.yaml` already includes `./db` as a workspace member
- The existing `.env` file has all required database connection variables
- The db package will use `tsx` for running TypeScript files directly (same as bytedash)
- Shell scripts `db-stop.sh` and `db-logs.sh` are trivial docker-compose wrappers and can be replaced by inline commands in root `package.json`
- `db-start.sh` provides Docker auto-start + readiness wait — keep or simplify based on implementation
