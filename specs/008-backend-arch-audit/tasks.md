# Tasks: Backend Architectural Refactoring (Phase 1: Admin Dashboard)

**Input**: Design documents from `specs/008-backend-arch-audit/`
**Prerequisites**: [plan.md](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/specs/008-backend-arch-audit/plan.md), [spec.md](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/specs/008-backend-arch-audit/spec.md)
**Constitution**: All tasks must satisfy FindEg.com Constitution principles (see `.specify/memory/constitution.md`)

## Constitution Compliance Tasks (Principle-Driven)

- [x] T001 [P] **Clean Architecture**: Verify no direct database imports in `AdminDashboardService.ts`
- [x] T002 [P] **SOLID**: Verify Single Responsibility in `AdminDashboardService.ts` by offloading queries to Query classes
- [x] T003 **Feature-Oriented Core Kernel**: Ensure all new files reside within `administration` feature or `db` package
- [/] T004 **Type-Safe & Testable**: Run `pnpm build` to verify type safety across the refactor

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Infrastructure preparation for dashboard queries

- [x] T005 [P] Create directory `db/queries/` if not exists
- [x] T006 [P] Update `db/index.ts` to export new query modules

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database functions required by all dashboard queries

- [x] T007 [P] Implement `getCatalogHealthRaw()` in `db/queries/dashboard.ts`
- [x] T008 [P] Implement `getCategoryDistributionRaw()` in `db/queries/dashboard.ts`

---

## Phase 3: User Story 1 - Catalog Health Stats (Priority: P1) 🎯 MVP

**Goal**: Move catalog health aggregation logic out of the service and into a decoupled Query class.

**Independent Test**: Call `GetCatalogHealthQuery.execute()` and verify it returns correct counts for products, categories, and brands.

### Implementation for User Story 1

- [x] T009 [P] [US1] Define `CatalogHealthStats` DTO in `data-model.md`
- [x] T010 [P] [US1] Create `GetCatalogHealthQuery.ts` in `backend/src/features/administration/application/queries/`
- [x] T011 [US1] Update `AdminDashboardService.ts` to use `GetCatalogHealthQuery` for `getCatalogHealthStats()`

---

## Phase 4: User Story 2 - Category Distribution (Priority: P2)

**Goal**: Move category distribution aggregation and mapping logic into a decoupled Query class.

**Independent Test**: Call `GetCategoryDistributionQuery.execute()` and verify it returns localized category names and accurate percentages.

### Implementation for User Story 2

- [x] T012 [P] [US2] Define `CategoryProductDistribution` DTO in `data-model.md`
- [x] T013 [P] [US2] Create `GetCategoryDistributionQuery.ts` in `backend/src/features/administration/application/queries/`
- [x] T014 [US2] Update `AdminDashboardService.ts` to use `GetCategoryDistributionQuery` for `getCategoryProductDistribution()`

---

## Phase 5: Validation & Error Handling (Priority: P1)

**Purpose**: Ensure strict data validation at the boundary and robust error handling.

- [x] T008a Define query error types in `backend/src/features/core/domain/errors/`
- [x] T008b Add Zod schemas for raw query results in `db/queries/dashboard.ts`
- [x] T008c Update `GetCatalogHealthQuery` and `GetCategoryDistributionQuery` with Zod validation
- [x] T008d Document error handling strategy in `specs/008-backend-arch-audit/quickstart.md`

---

## Phase 5: Refactoring AdminDashboardService (Priority: P1)
- [x] T013 Update `GetCatalogHealthQuery` to use `QueryError`
- [x] T014 Update `GetCategoryDistributionQuery` to use `QueryError`
- [x] T015 Implement `GetDashboardStatsQuery` (orchestrates revenue, KPIs, trends)
- [x] T016 Refactor `AdminDashboardService` to consume queries via DI

### Phase 6: Dependency Injection & Verification (Priority: P1)
- [x] T017 Update `factory.ts` to wire up new queries
- [x] T018 Update `ServiceContainer.ts` to wire up new queries
- [ ] T019 Verify Build (Run `pnpm build` in backend)
- [ ] T020 Manual Verification: Ensure Admin Dashboard UI renders correctly with new data layer

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1.
- **User Stories (Phase 3 & 4)**: Depend on Foundational (Phase 2) completion.
- **Polish (Phase 5)**: Depends on completion of User Stories.

### Parallel Opportunities

- T007 and T008 can be implemented in parallel.
- US1 (Phase 3) and US2 (Phase 4) can be implemented in parallel once Foundational is ready.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Implement raw query in `db/`.
2. Implement Query class in `administration/`.
3. Refactor Service to use the Query.
4. Verify independently.

### Incremental Delivery

1. Foundation ready.
2. Add US1 (Catalog Health).
3. Add US2 (Category Distribution).
4. Finalize DI and full build.
