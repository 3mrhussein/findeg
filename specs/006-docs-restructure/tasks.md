# Tasks: Monorepo Documentation Restructure

**Branch**: `006-docs-restructure` | **Date**: 2026-04-19 | **Spec**: [spec.md](./spec.md)

## Phase 1: Deep Codebase Investigation (User Story 1 & 2)

### Goal: Extract ground-truth technical configuration for build and deployment docs.
- [ ] T001 [P] [US2] Inspect `turbo.json` and extract Next.js integration rules.
- [ ] T002 [P] [US2] Inspect `package.json` across packages to map exact scripts and dependencies.
- [ ] T003 [P] [US2] Inspect `docker-compose.yml` to extract Postgres configuration.
- [ ] T004 [P] [US1] Inspect deployment configurations (Vercel/Docker) for CI/CD strategy.

## Phase 2: Feature Codebase Investigation (User Story 3)

### Goal: Extract real domain entities, services, and db endpoints from application code.
- [ ] T005 [P] [US3] Extract backend `catalog` feature domain entities and services (`packages/backend/src/features/catalog/`).
- [ ] T006 [P] [US3] Extract backend `order` and `cart` feature domain entities (`packages/backend/src/features/cart/` & `order/`).
- [ ] T007 [P] [US3] Extract backend `identity` and `administration` feature domains.
- [ ] T008 [P] [US3] Extract backend `school`, `review`, `notifications`, `media`, and `core` domains.
- [ ] T009 [P] [US3] Extract dashboard `administration` and `catalog` feature components (`packages/dashboard/src/features/`).
- [ ] T010 [P] [US3] Extract storefront `catalog`, `cart`, `order`, `review`, `notifications` features (`packages/storefront/src/features/`).

## Phase 3: Root README (User Story 1)

### Goal: Create the single entry point for the monorepo with executive vision and tech maps.
- [ ] T011 [US1] Create root `README.md` layout with Executive Summary and Business Overview.
- [ ] T012 [US1] Add Technology Stack & Architecture Overview (incorporating turbo and docker details).
- [ ] T013 [US1] Add Monorepo Package Map & Integration logic.
- [ ] T014 [US1] Add Build, Docker & Deployment Strategy section.
- [ ] T015 [US1] Add Quick Start & Environment Setup instructions.
- [ ] T016 [US1] Add Engineering Standards summary (Clean Code, Vitest, Cypress).
- [ ] T017 [US1] Add Documentation Map (Mermaid graph) pointing to Tier 2/3.
- [ ] T018 [US1] Add Current Status, Roadmap, and Test Accounts.

## Phase 4: Package READMEs (User Story 2)

### Goal: Create Tier 2 package-level technical documentation.
- [ ] T019 [P] [US2] Create `packages/backend/README.md` capturing deep clean architecture patterns.
- [ ] T020 [P] [US2] Create `packages/dashboard/README.md` capturing admin layouts and Cypress standards.
- [ ] T021 [P] [US2] Create `packages/storefront/README.md` capturing RSC boundaries and cache strategy.
- [ ] T022 [P] [US2] Create `packages/ui/README.md` capturing shadcn inventory and Tailwind config.

## Phase 5: Feature READMEs (Backend) (User Story 3)

### Goal: Document deeply analyzed backend services in Tier 3 docs.
- [ ] T023 [P] [US3] Write `packages/backend/src/features/catalog/README.md` with true entities and DB sequence flow.
- [ ] T024 [P] [US3] Write `packages/backend/src/features/cart/README.md` with true data models.
- [ ] T025 [P] [US3] Write `packages/backend/src/features/order/README.md`.
- [ ] T026 [P] [US3] Write `packages/backend/src/features/identity/README.md`.
- [ ] T027 [P] [US3] Write `packages/backend/src/features/administration/README.md`.
- [ ] T028 [P] [US3] Write `packages/backend/src/features/review/README.md`.
- [ ] T029 [P] [US3] Write `packages/backend/src/features/media/README.md`.
- [ ] T030 [P] [US3] Write `packages/backend/src/features/core/README.md`.
- [ ] T031 [P] [US3] Write `packages/backend/src/features/notifications/README.md`.
- [ ] T032 [P] [US3] Write `packages/backend/src/features/school/README.md` (migrating the private access spec details).

## Phase 6: Feature READMEs (Frontend) (User Story 3)

### Goal: Document detailed frontend components and integration routes.
- [ ] T033 [P] [US3] Write `packages/dashboard/src/features/administration/README.md`.
- [ ] T034 [P] [US3] Write `packages/dashboard/src/features/catalog/README.md`.
- [ ] T035 [P] [US3] Write `packages/storefront/src/features/catalog/README.md`.
- [ ] T036 [P] [US3] Write `packages/storefront/src/features/cart/README.md`.
- [ ] T037 [P] [US3] Write `packages/storefront/src/features/order/README.md`.
- [ ] T038 [P] [US3] Write `packages/storefront/src/features/review/README.md`.
- [ ] T039 [P] [US3] Write `packages/storefront/src/features/notifications/README.md`.
- [ ] T040 [P] [US3] Write `packages/storefront/src/features/school/README.md`.

## Phase 7: Schema Database Document (User Story 2)

### Goal: Consolidate DB schemas.
- [ ] T041 [US2] Update `packages/backend/docs/database/SCHEMA.md` with final diagram verifications.

## Phase 8: Cleanup and Validation (User Story 4)

### Goal: Clean up old docs and validate exact references.
- [ ] T042 [US4] Dissolve remaining files in `docs/` or other root locations that were absorbed.
- [ ] T043 [US4] Validate 100% of internal links using a manual verification pass.

## Dependencies
- Phase 1 & 2 must be completed before docs (Phases 3-6) can be written to ensure truthfulness.
- Phase 3 provides the index for Phase 4.
