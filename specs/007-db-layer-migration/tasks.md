---
description: "Task list for Database Layer Migration"
---

# Tasks: Database Layer Migration to Standalone Package

**Input**: Design documents from `/specs/007-db-layer-migration/`
**Prerequisites**: plan.md, spec.md
**Constitution**: All tasks must satisfy FindEg.com Constitution principles

## Constitution Compliance Tasks (Principle-Driven)

These tasks verify adherence to FindEg.com Constitution and MUST be completed for all features:

### I. Clean Architecture

- [ ] T001 [P] Create db package strict structure: `schema/`, `seeds/`, `migrations/`, `docs/`
- [ ] T002 [P] Verify `db` package exports only necessary types/instances, abstracting the raw ORM driver
- [ ] T003 Ensure backend is fully decoupled from local `persistence/schema` by validating `@findeg/db/schema` imports

### II. Server-Components First (Type-Safe UI)

- _N/A (Infrastructure package)_

### III. Bilingual & RTL-First (i18n Mandatory)

- _N/A (Infrastructure package)_

### IV. Feature-Oriented Core Kernel

- [ ] T004 Verify `db` package holds generic database concerns only, zero feature-specific business logic (feature schemas are permitted)
- [ ] T005 Verify db README/documentation moved to `db/docs/` and properly outlines the ORM layout

### V. Type-Safe & Testable Code

- [ ] T006 Ensure strict DB connection configs parsed using `zod` via `@findeg/env`
- [ ] T007 Run full gate: `pnpm --filter @findeg/db type-check` before integration

### VI. DRY Principle (Don't Repeat Yourself)

- [ ] T008 [P] Abstract shared seed helper utilities (e.g. `bcryptjs` password hasher, table truncater)
- [ ] T009 Ensure db shell scripts duplication is removed

### VII. SOLID Design Principles

- [ ] T010 **Single Responsibility Check**: Schema grouped by specific PostgreSQL namespace (identity, catalog, etc.)

---

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database workspace package initialization

- [x] T011 Create and configure `db/package.json` with correct name (`@findeg/db`), external dependencies (drizzle-orm, postgres, zod, bcryptjs, cross-env), and db-specific npm scripts
- [x] T012 Create `db/tsconfig.json` extending root tsconfig with `resolveJsonModule: true` for seed JSON resolution
- [x] T012.1 Add `@findeg/db/*` paths configuration to root `tsconfig.json`

---

## Phase 2: Foundational (Schema Reorganization)

**Purpose**: Modularize raw DB schema into domain packages

- [x] T013 Create domain subdirectories inside `db/schema/` (`identity/`, `catalog/`, `sales/`, `inventory/`, `school-engine/`, `system/`)
- [x] T014 Move existing 25 schema definition files into their corresponding mapped subdirectories
- [x] T015 Create local `index.ts` barrel exports for each schema subdirectory
- [x] T016 Setup main `db/schema/index.ts` exporting all subdirectory barrels, and fix circular dependency conflicts

**Checkpoint**: Base db schema correctly typed and indexed

---

## Phase 3: User Story 1 - Complete DB Package Setup (Priority: P1) 🎯 MVP

**Goal**: Prepare the core connection exports and local Drizzle environment configuration

**Independent Test**: `pnpm --filter @findeg/db type-check` compiles zero errors

### Implementation for User Story 1

- [ ] T017 [US1] Create `db/index.ts` connection provider utilizing standard TS imports against `@findeg/env`
- [ ] T018 [US1] Set up `db/drizzle.config.ts`, ensuring it targets `./schema/index.ts` with correct `schemaFilter` definitions handling multi-schemas
- [ ] T019 [US1] Define shared core helper types (e.g. `Db`) exported directly from the package root

**Checkpoint**: Connection infrastructure established

---

## Phase 4: User Story 2 - JSON-Based Type-Safe Seeding (Priority: P1)

**Goal**: Build a deterministic, dependency-ordered seeder using Bytedash execution patterns and converted CSV data.

**Independent Test**: `pnpm db:seed` executes cleanly and loads all tables successfully

### Implementation for User Story 2

- [ ] T020 [P] [US2] Convert existing structural `users.csv`, `roles.csv`, `password_credentials.csv` mapping data correctly to `db/seeds/data/users.json` etc., populating real existing data
- [ ] T021 [P] [US2] Convert all functional product catalogs (brands, categories, products, variants) from populated CSVs to corresponding `db/seeds/data/[name].json`
- [ ] T022 [P] [US2] Stub missing empty CSV tables with absolute minimal JSON mock data to pass foreign-key checks
- [ ] T023 [P] [US2] Create typed seed scripts in `db/seeds/` mapping all catalog logic using correct dependency loops
- [ ] T024 [P] [US2] Implement `bcryptjs` cost-12 hashing inside `db/seeds/users.ts` mapping passwords
- [ ] T025 [US2] Create `db/seeds/index.ts` aggregating specific seed exports
- [ ] T026 [US2] Develop `db/seed.ts` orchestrator defining table truncate constraints against specific schemas

**Checkpoint**: Seeds functional completely

---

## Phase 5: User Story 3 - Backend & Infrastructure Cleanup (Priority: P2)

**Goal**: Erase duplication and transition backend logic over exclusively to `@findeg/db` module

**Independent Test**: `pnpm --filter @findeg/backend type-check` yields zero errors against db integrations

### Implementation for User Story 3

- [ ] T027 [US3] Move DB docs (`SCHEMA.md`, `SETUP.md`, `TAXONOMY.md`) and global `init-db.sql` explicitly directly under `db/docs/` and `db/` root
- [ ] T028 [US3] Update backend `package.json` to link `@findeg/db` as workspace dependency and strip internal `drizzle-kit` references
- [ ] T029 [P] [US3] Refactor schema import paths across 37 backend repository domains using fast global regexp resolution (`@findeg/db/schema`)
- [ ] T030 [P] [US3] Modify `persistence/index.ts` dropping obsolete db configurations into static re-exports from global db package
- [ ] T031 [US3] Obliterate existing legacy implementation schemas (`backend/src/features/core/infrastructure/persistence/schema/*`, `backend/scripts/data/seed/tables/*`, `csv-seed.js`)
- [ ] T032 [US3] Overhaul global root `package.json` executing direct mappings (`tsx db/seed.ts`) and drop `backend/scripts/*.sh` bash wrappers modifying `docker-compose.yml` mounts properly
- [ ] T033 [US3] Sync backend `README.md` stripping conflicting git artifacts regarding db configurations

**Checkpoint**: Duplication eradicated, clean boundary complete

---

## Phase 6: User Story 4 - Migration Script (Priority: P2)

**Goal**: Standardize schema iteration flow

**Independent Test**: `pnpm db:migrate` successfully checks conditions and fires migration runner

### Implementation for User Story 4

- [ ] T034 [US4] Configure `db/migrate.ts` script referencing `DB_MIGRATING=true` gating check preventing unauthorized run execution

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple boundaries and global deployment stability

- [ ] T035 [P] Run holistic TypeScript monorepo coverage test guaranteeing cross-module linkages: `pnpm type-check`
- [ ] T036 Update relevant environment `drizzle.config.ts` validations, testing UI application runtime sanity via Next Dev execution

## Dependencies & Execution Order

- **Foundational (Phase 2)**: Reorganizing schema definitions is blocking mapping configurations and seeding functions
- **User Story 1**: Core Setup must follow Foundation. Blocks Seed Orchestration
- **User Story 2**: The seed logic safely proceeds knowing db layer connections format logic
- **User Story 3**: Relies directly on existing implementation correctness from US1 so the backend does not crash on typing
- **Parallel Opportunities**: CSV data transformation (T020-T022), frontend string replacement (T029) can easily occur asynchronously alongside direct logic implementation
