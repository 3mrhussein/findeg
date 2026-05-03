# Implementation Plan: Backend Architectural Refactoring (Phase 1: Admin Dashboard)

**Branch**: `008-backend-arch-audit` | **Date**: 2026-05-02 | **Spec**: [008-backend-arch-audit/spec.md](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/specs/008-backend-arch-audit/spec.md)

## Summary

This plan outlines the refactoring of the `AdminDashboardService` to enforce strict separation of concerns. All direct database access (Drizzle/SQL) will be moved into the `@findeg/db` package, and complex analytics/aggregations will be wrapped in CQRS Query classes. This phase is strictly limited to the dashboard to ensure a safe, incremental refactor.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16+, Drizzle ORM, Zod, date-fns  
**Storage**: PostgreSQL (via Drizzle)  
**Testing**: Vitest  
**Target Platform**: Node.js  
**Project Type**: Web service (Monorepo)  
**Performance Goals**: Optimized analytics queries; zero direct DB dependency in application layer.  
**Constraints**: Phase 1 focus only (AdminDashboardService); No new repositories; No refactoring of simple CRUD services.  
**Scale/Scope**: 1 Service, 2 Query classes, 2 DB query functions.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**FindEg.com Constitution (.specify/memory/constitution.md) Compliance Gates** — Test each principle:

1. **[x] Clean Architecture** - Feature will use domain/application/infrastructure/presentation layers; no infrastructure imports between features.
2. **[n/a] Server-Components First** - UI will default to Server Components; Client Components only for interactivity.
3. **[n/a] Bilingual & RTL-First** - All strings will be i18n externalized; EN + AR translations added simultaneously.
4. **[x] Feature-Oriented Core Kernel** - Feature depends on `core` only; self-contained in `src/features/[feature]/`.
5. **[x] Type-Safe & Testable** - Zod schemas at API boundaries and for all new Read Models; TypeScript strict checked; critical path tests included.
6. **[x] DRY Principle** - No duplicated logic, components, or utilities; reusable abstractions identified and extracted to shared/core.
7. **[x] SOLID Design** - Single Responsibility verified for functions/classes; Dependency Inversion applied via Query class injection.
8. **[x] Definition of Done** - Plan includes Zod validation, type-check, lint, build, and unit tests.

**Violations found**: None.

## Project Structure

### Documentation (this feature)

```text
specs/008-backend-arch-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/src/features/administration/
├── application/
│   ├── queries/
│   │   ├── GetCatalogHealthQuery.ts
│   │   └── GetCategoryDistributionQuery.ts
│   └── services/
│       └── AdminDashboardService.ts
└── infrastructure/
    └── persistence/

db/
└── queries/
    └── dashboard.ts
```

**Structure Decision**: CQRS Query classes in `application/queries` to separate read-heavy analytics from general service logic. Raw DB functions in `db/queries/dashboard.ts` to centralize SQL/Drizzle logic.

## Proposed Changes

### [Phase 1: Admin Dashboard Refactor]

#### [NEW] [dashboard.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/db/queries/dashboard.ts)
- Implement `getCatalogHealthRaw()` and `getCategoryDistributionRaw()`.

#### [NEW] [GetCatalogHealthQuery.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/backend/src/features/administration/application/queries/GetCatalogHealthQuery.ts)
- Orchestrates catalog health data retrieval.
- Implements Zod validation for the raw DB result.

#### [NEW] [GetCategoryDistributionQuery.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/backend/src/features/administration/application/queries/GetCategoryDistributionQuery.ts)
- Orchestrates category distribution data retrieval and mapping.
- Implements Zod validation for the raw DB result.

#### [MODIFY] [AdminDashboardService.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/backend/src/features/administration/application/services/AdminDashboardService.ts)
- Refactor to use injected Query classes.

#### [MODIFY] [ServiceContainer.ts](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/backend/src/features/core/infrastructure/di/ServiceContainer.ts)
- Inject new Query classes into `AdminDashboardService`.

## Verification Plan

### Automated Tests
- `pnpm build` to verify type safety.
- `pnpm --filter @findeg/backend test:unit` to verify business logic.

### Manual Verification
- Verify Admin Dashboard stats still load correctly in the UI.
