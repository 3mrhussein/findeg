# Feature Specification: Backend Clean Architecture Audit

**Feature Branch**: `008-backend-arch-audit`  
**Created**: 2026-05-02  
**Status**: Analysis Complete (Refined)  
**Input**: User description: "Analyze the provided backend files in a Clean Architecture monorepo. Identify violations of separation of concerns: Direct DB usage (drizzle, sql, joins), Business logic mixed with data access, Overloaded services."
**Refinement (2026-05-02)**: 
- PRIMARY GOAL: Move ALL direct DB access (drizzle, sql, joins, aggregations) out of backend services into the `db` package.
- SECONDARY GOAL: Apply CQRS ONLY to dashboard logic and analytics/aggregation-heavy reads.
- TARGET: `AdminDashboardService` (Priority 1).
- CONSTRAINTS: 
  - DO NOT refactor domain entities for now.
  - DO NOT introduce specification pattern.
  - DO NOT optimize repositories (no batching/N+1 fixes yet).
  - DO NOT apply CQRS to simple CRUD services.
  - KEEP existing repositories as-is (unless they contain raw SQL).

## Constitution Compliance _(mandatory before implementation)_

## Clarifications

### Session 2026-05-02
- Q: How should the Application layer consume the new dashboard queries? → A: Use direct query functions from `@findeg/db` (Option B). No repository/interface layer needed for queries. Keep mapping logic inside Query classes in the backend.
- Q: Where should these new exported query functions live within the `@findeg/db` package? → A: `db/queries/`.
- Q: Where should the new `Query` classes (which perform the mapping) be located within the `administration` feature? → A: `application/queries/` (Queries are part of application logic).

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Feature uses 4-layer structure (domain/application/infrastructure/presentation); no cross-feature infrastructure imports. **Refined focus**: Ensure Application layer (services) has ZERO direct dependency on Drizzle/SQL.
- **II. Server-Components First**: N/A (Backend only)
- **III. Bilingual & RTL-First**: N/A (Backend only)
- **IV. Feature-Oriented Core Kernel**: Feature is self-contained in `src/features/[feature]/`; dependencies on `core` only.
- **V. Type-Safe & Testable**: Zod schemas at boundaries; TypeScript strict mode; tests for critical paths.
- **VI. DRY Principle**: No duplicated logic, components, or utilities; single source of truth for all abstractions.
- **VII. SOLID Design**: Single Responsibility verified; Open/Closed principle applied; Dependency Inversion evident (Interfaces for DB access).

---

## Architectural Analysis Summary

The backend codebase follows a 4-layer Clean Architecture structure, but several violations exist where boundaries leak, specifically between Infrastructure (Persistence) and Domain layers. Recent analysis shows critical leaks in the Administration feature.

### Per-File Analysis & Classification

| File Path | Layer | Responsibilities | Classification |
| :--- | :--- | :--- | :--- |
| `administration/application/services/AdminDashboardService.ts` | Application | KPI aggregation, Dashboard stats | ❌ |
| `administration/application/services/AdminProductService.ts` | Application | Admin-side product management (with transactions) | ❌ |
| `administration/application/services/AdminTagService.ts` | Application | Tag management | ❌ |
| `identity/application/services/UserService.ts` | Application | User profile and role management | ❌ |
| `identity/application/services/AdminUserService.ts` | Application | Admin-side user management | ❌ |
| `identity/application/services/AdminRoleService.ts` | Application | Role and permission management | ❌ |
| `catalog/application/services/SearchService.ts` | Application | Search logging and raw query execution | ❌ |
| `core/application/services/LoggerService.ts` | Application | Multi-channel logging (File + DB) | ❌ |
| `catalog/application/services/ProductService.ts` | Application | Product CRUD orchestration, simple filtering | ✅ |
| `catalog/infrastructure/persistence/DrizzleProductRepository.ts` | Infrastructure | Persistence implementation, hydration of variants/tags | ⚠️ |
| `catalog/domain/entities/Product.ts` | Domain | Product schema and behavioral methods | ✅ (Deferred) |
| `identity/application/services/AuthService.ts` | Application | Authentication flow orchestration (Login/Register) | ⚠️ |
| `identity/infrastructure/persistence/DrizzleUserRepository.ts` | Infrastructure | User persistence, RBAC context resolution | ❌ |
| `order/application/services/OrderService.ts` | Application | Order retrieval, checkout prefill data | ✅ |
| `order/infrastructure/persistence/DrizzleOrderRepository.ts` | Infrastructure | Order/Transaction persistence, revenue analytics | ❌ |

### Detailed Method Classification (Selected Highlights)

#### administration/application/services/AdminDashboardService.ts
- `getDashboardStats`, `getRecentOrders`: ⚠️ Correct orchestration but potential for CQRS split.
- `getCatalogHealthStats`, `getCategoryProductDistribution`: ❌ **Direct DB Access Violation**. Uses `sql`, `leftJoin`, etc. Must move to `@findeg/db/queries`.

#### administration/application/services/AdminProductService.ts
- `createProduct`, `updateProduct`, `deleteProducts`: ❌ **Transaction/DB Leak**. Uses `db.transaction` and direct `db.insert/update` in the service. Must move to `IProductRepository`.

#### identity/application/services/UserService.ts / AdminUserService.ts
- `updateUserRoles`, `updateUserPermissions`: ❌ **Direct DB Access**. Uses `db.insert`, `db.delete` for many-to-many relations directly in service.

#### catalog/application/services/SearchService.ts
- `searchWithRawQuery`: ❌ **Direct DB Execution**. Uses `db.execute(query)` with raw strings.

#### core/application/services/LoggerService.ts
- `logRequest`: ❌ **Direct DB Access**. Uses `db.insert(serverLogs)` directly.

#### catalog/infrastructure/persistence/DrizzleProductRepository.ts
- `mapToDomain`: ✅ Infrastructure concern (mapping).
- `getFeatured`, `search`, `getByCategory`: ⚠️ **Orchestration Violation**. (Note: User requested NOT to optimize batching/N+1 yet, but these remain flagged).
- `search`: ⚠️ **Direct DB Logic**. Contains SQL for localized name matching.

#### identity/application/services/AuthService.ts
- `login`, `register`: ⚠️ **Infrastructure Leak**. Uses `bcryptjs` directly.
- `login` (permission logic): ⚠️ Hardcoded role checks (`portalRole === 'staff'`).

#### identity/infrastructure/persistence/DrizzleUserRepository.ts
- `getAuthorizationContext`: ❌ **Domain Logic Leak**. Implements logic for permission overrides.

#### order/infrastructure/persistence/DrizzleOrderRepository.ts
- `hasPurchasedProduct`: ❌ **Domain Logic Leak**. Defines `purchasableStatuses` inside repo.
- `getRevenueByPeriod`: ❌ **Portability Leak**. Uses raw `db.execute` with PG-specific `TO_CHAR`.

---

## Core Refactoring Strategy (Pragmatic Approach)

### 1. Zero-SQL Services (Primary Goal)
**Violation**: Services importing `@findeg/db` or `drizzle-orm` directly.
**Action**: 
- Extract all SQL/Drizzle query builders from `AdminDashboardService` and move them to `@findeg/db` as exported query functions.
- Services must only interact with `Interfaces` or `Query/Read Models`.

### 2. Selective CQRS (Secondary Goal)
**Action**:
- Split `AdminDashboardService` into a Read-only path for analytics.
- Create "Query" classes in the `administration` feature that call the direct `@findeg/db` query functions.
- Move mapping logic (e.g., localized name extraction) from the service into these backend Query classes.
- Use specialized DTOs/ReadModels for dashboard stats that are decoupled from Domain Entities.

### 3. Business Logic Extraction
**Action**:
- Move definitions like `purchasableStatuses` or `effectivePermission` calculations into Domain Services or Entities (as feasible without full domain refactor).

## Success Criteria

- **SC-001**: `AdminDashboardService` has ZERO imports from `drizzle-orm` or `@findeg/db`.
- **SC-002**: All dashboard-related SQL logic is moved to a dedicated module in the `db` package.
- **SC-003**: Dashbord-related logic uses a ReadModel/CQRS pattern.
- **SC-004**: Simple CRUD services remain unchanged (no CQRS overkill).
- **SC-005**: Build passes (`pnpm build`) and no regressions in existing dashboard functionality.

