# Implementation Plan: Backend Pure TypeScript Refactoring

**Branch**: `002-backend-pure-typescript` | **Date**: April 5, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-backend-pure-typescript/spec.md`

**Note**: This plan addresses refactoring @findeg/backend to eliminate all 21 Next.js framework dependencies and ensure Constitution Principle VIII compliance (Pure TypeScript Libraries).

## Summary

Refactor the @findeg/backend package to become a pure TypeScript library by removing all 21 Next.js framework dependencies (from `next/cache`, `next/navigation`, `next/headers`). Backend services will expose pure business logic that accepts explicit parameters and returns data or throws domain errors. App-layer code in dashboard/storefront will handle framework integration (cache revalidation, redirects, cookie/session management) by orchestrating backend services with Next.js APIs. This decoupling enables independent backend testing in pure Node.js (Vitest), framework portability, and strict Clean Architecture compliance.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**: Drizzle ORM, Zod, bcrypt, jsonwebtoken, sharp, nodemailer  
**Framework Dependencies to Remove**: Next.js 16 (`next/cache`, `next/navigation`, `next/headers`)  
**Storage**: PostgreSQL via Drizzle ORM  
**Testing**: Vitest (pure Node.js environment, no Next.js runtime)  
**Target Platform**: Node.js library (consumed by Next.js apps: dashboard + storefront)  
**Project Type**: Monorepo package - business logic library  
**Performance Goals**: Backend unit tests <30 seconds execution time (demonstrates framework independence)  
**Constraints**: Must maintain 100% backward compatibility for dashboard/storefront functionality  
**Scale/Scope**: 21 Next.js import violations across 15 files in 6 feature areas (catalog, identity, order, administration, school, core)

### Current Next.js Import Analysis

**Files Affected (21 violations)**:

1. **next/cache imports (14 files)**:
   - `revalidatePath`: 10 files (actions for order, auth, profile, admin operations)
   - `revalidateTag`: 6 files (admin collection, product, inventory, brand, category actions)
   - `cacheTag`, `cacheLife`: 3 files (shop-page, storefront, category-page queries)

2. **next/navigation imports (5 files)**:
   - `redirect`: 4 files (auth actions, profile actions, dashboard/my-account queries)
   - `notFound`: 1 file (my-account query)
   - `useRouter`, `usePathname`: 1 file (school presentation hook - VIOLATES Clean Architecture)

3. **next/headers imports (2 files)**:
   - `cookies`: 2 files (CookieSessionProvider, auth-helpers)

**Architecture Violations**:
- Backend services perform side effects (cache invalidation) instead of returning results
- Backend services call framework routing (`redirect`, `notFound`) instead of throwing domain errors
- Backend services read global context (`cookies`) instead of accepting parameters
- Presentation layer in backend uses React hooks (`useRouter`, `usePathname`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**FindEg.com Constitution (.specify/memory/constitution.md) Compliance Gates** — Test each principle:

1. **☑ Clean Architecture** - Refactoring STRENGTHENS 4-layer architecture by removing framework coupling from application layer; infrastructure layer will use adapter pattern for framework integration; no cross-feature infrastructure dependencies (violations already prohibited)

2. **☑ Server-Components First** - N/A - backend package contains no UI components (violation: `useSchoolListLookup.ts` presentation hook will be migrated to app-layer)

3. **☑ Bilingual & RTL-First** - N/A - backend package contains no user-facing strings (all i18n handled in dashboard/storefront)

4. **☑ Feature-Oriented Core Kernel** - Refactoring PRESERVES feature boundaries; each feature (`catalog`, `identity`, `order`, `administration`, `school`) remains self-contained in `src/features/[feature]/`; core provides shared interfaces (session, errors, cache contracts)

5. **☑ Type-Safe & Testable** - Refactoring ENABLES pure Node.js testing without Next.js runtime; all backend services become unit-testable with mock implementations; Zod schemas remain at boundaries; strict TypeScript already enforced

6. **☑ DRY Principle** - Cache invalidation tags/paths will be centralized in `core` domain constants; app-layer reuses shared cache invalidation helpers; eliminates current duplication where same paths revalidated across dashboard + storefront

7. **☑ SOLID Design** - Refactoring ENFORCES SOLID:
   - **Single Responsibility**: Backend services focus on business logic only (not caching/routing)
   - **Open/Closed**: New cache strategies added via app-layer wrappers without backend changes
   - **Liskov Substitution**: Session providers interchangeable via `ISessionProvider` interface
   - **Interface Segregation**: Backend depends on minimal interfaces (`ISessionProvider`, `ICacheNotifier`)
   - **Dependency Inversion**: Backend depends on abstractions (interfaces), app-layer provides Next.js implementations

8. **☑ Backend Packages - Pure TypeScript Libraries** - PRIMARY OBJECTIVE: Eliminates all 21 Next.js imports from @findeg/backend; enforces framework-agnostic architecture; backend becomes reusable across any Node.js runtime

9. **☑ Monorepo Architecture & Package Boundaries** - Refactoring CLARIFIES package boundaries:
   - @findeg/backend exports: domain entities, service interfaces, business logic, error types
   - @findeg/dashboard + @findeg/storefront: import backend services, wrap with Next.js Server Actions/queries, handle caching/redirects
   - No circular dependencies introduced (apps depend on backend, backend remains independent)

**Violations found**: None - refactoring resolves Constitution Principle VIII violation

## Project Structure

### Documentation (this feature)

```text
specs/002-backend-pure-typescript/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: refactoring patterns, error handling catalog, testing strategies
├── data-model.md        # Phase 1 output: domain error types, service interfaces, session contracts
├── quickstart.md        # Phase 1 output: migration guide with before/after examples
├── contracts/           # Phase 1 output: service interface definitions
│   ├── ISessionProvider.ts
│   ├── ICacheInvalidator.ts
│   └── DomainErrors.ts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/backend/
├── src/
│   ├── features/
│   │   ├── core/
│   │   │   ├── application/
│   │   │   │   └── interfaces/
│   │   │   │       ├── ISessionProvider.ts      # NEW: Session abstraction
│   │   │   │       └── ICacheInvalidator.ts     # NEW: Cache notification interface
│   │   │   ├── domain/
│   │   │   │   ├── errors/
│   │   │   │   │   ├── DomainError.ts           # Enhanced: base class
│   │   │   │   │   ├── NotAuthenticatedError.ts # NEW
│   │   │   │   │   ├── ResourceNotFoundError.ts # NEW
│   │   │   │   │   └── ValidationError.ts       # Enhanced
│   │   │   │   └── constants/
│   │   │   │       └── cache-tags.ts            # Existing: centralized tags
│   │   │   └── infrastructure/
│   │   │       └── auth/
│   │   │           └── CookieSessionProvider.ts # REFACTOR: remove cookies() import
│   │   ├── identity/
│   │   │   └── application/
│   │   │       ├── actions/
│   │   │       │   ├── auth.ts                  # REFACTOR: remove redirect/revalidatePath
│   │   │       │   └── profile.ts               # REFACTOR: remove redirect/revalidatePath
│   │   │       ├── queries/
│   │   │       │   ├── dashboard.ts             # REFACTOR: remove redirect, add session param
│   │   │       │   └── my-account.ts            # REFACTOR: remove notFound/redirect
│   │   │       └── services/
│   │   │           └── AuthService.ts           # REFACTOR: pure logic extraction
│   │   ├── catalog/
│   │   │   └── application/
│   │   │       ├── actions/
│   │   │       │   ├── product.ts               # REFACTOR: remove revalidatePath/Tag
│   │   │       │   ├── brand.ts                 # REFACTOR: remove revalidatePath/Tag
│   │   │       │   └── category.ts              # REFACTOR: remove revalidatePath/Tag
│   │   │       └── queries/
│   │   │           ├── shop-page.ts             # REFACTOR: remove cacheTag/cacheLife
│   │   │           ├── storefront.ts            # REFACTOR: remove cacheTag/cacheLife
│   │   │           └── category-page.ts         # REFACTOR: remove cacheTag/cacheLife
│   │   ├── order/
│   │   │   └── application/
│   │   │       └── actions/
│   │   │           └── order.ts                 # REFACTOR: remove revalidatePath
│   │   ├── administration/
│   │   │   └── application/
│   │   │       └── actions/
│   │   │           ├── admin-tag-actions.ts     # REFACTOR: remove revalidatePath/Tag
│   │   │           ├── admin-collection-actions.ts # REFACTOR
│   │   │           ├── admin-order-actions.ts   # REFACTOR
│   │   │           ├── admin-product-actions.ts # REFACTOR
│   │   │           └── inventory.ts             # REFACTOR
│   │   └── school/
│   │       └── presentation/
│   │           └── hooks/
│   │               └── useSchoolListLookup.ts   # MIGRATE: move to app-layer (violates VIII)
│   └── index.ts                                 # UPDATE: export new interfaces/errors
└── vitest.config.ts                             # UNCHANGED: already pure Node.js

packages/dashboard/
└── src/
    ├── actions/                                 # NEW: Server Actions orchestrating backend
    │   ├── auth-actions.ts                      # NEW: wraps backend auth + redirect
    │   ├── profile-actions.ts                   # NEW: wraps backend profile + cache
    │   └── admin-actions.ts                     # NEW: wraps backend admin + cache
    ├── queries/                                 # NEW: Server queries with cache directives
    │   └── dashboard-queries.ts                 # NEW: wraps backend queries + session extraction
    └── lib/
        ├── cache.ts                             # NEW: centralized cache invalidation
        └── session.ts                           # NEW: session extraction helpers

packages/storefront/
└── src/
    ├── actions/                                 # NEW: Server Actions orchestrating backend
    │   └── order-actions.ts                     # NEW: wraps backend order + cache
    ├── queries/                                 # NEW: Server queries with cache directives
    │   └── shop-queries.ts                      # NEW: wraps backend shop queries + caching
    └── lib/
        ├── cache.ts                             # NEW: centralized cache invalidation
        └── session.ts                           # NEW: session extraction helpers
```

**Structure Decision**: Monorepo with 3 packages (@findeg/backend, @findeg/dashboard, @findeg/storefront). Backend package contains only pure TypeScript business logic. App packages (dashboard/storefront) contain Next.js-specific integration code (Server Actions, queries with cache directives, session extraction). This enforces Constitution Principle VIII (Backend Packages - Pure TypeScript Libraries) and Principle IX (Monorepo Architecture & Package Boundaries).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations - refactoring resolves existing Constitution Principle VIII violation._

---

## Phase 0: Research & Pattern Discovery (COMPLETE)

**Deliverable**: `research.md`

**Objectives**:
- ✅ Identify all 21 Next.js import violations across backend
- ✅ Define 3 primary refactoring patterns (service refactoring, error translation, session injection)
- ✅ Research cache invalidation strategies (return metadata vs observer pattern)
- ✅ Design domain error catalog (7 error types)
- ✅ Document testing strategies (backend unit tests + app-layer integration tests)
- ✅ Plan migration execution strategy (7 phases: Foundation → Identity → Order → Catalog → Administration → School → Core)

**Key Findings**:
1. **Service Refactoring Pattern**: Extract pure logic, return data + cache metadata
2. **Error Translation Pattern**: Throw typed domain errors, app-layer translates to redirects
3. **Session Injection Pattern**: App-layer extracts session, passes to backend as parameters

**Decision Points Resolved**:
- Cache invalidation: Return paths/tags as data (simpler than observer pattern)
- Session access: Parameter passing (simpler than dependency injection)
- Error handling: Centralized `handleDomainError()` utility in app-layer

**Research complete** → Ready for Phase 1

---

## Phase 1: Design & Contracts (COMPLETE)

**Deliverables**: `data-model.md`, `contracts/`, `quickstart.md`

**Objectives**:
- ✅ Define domain error types (7 error classes with metadata)
- ✅ Define service interfaces (`ISessionProvider`, `ICacheInvalidator`)
- ✅ Design data transfer objects (DTOs) for service inputs/outputs
- ✅ Create cache metadata structures (tags, path builders, query configs)
- ✅ Document session payload types (SessionPayload, AuthenticatedContext, AuthorizedContext, AdminContext)
- ✅ Generate before/after migration examples (5 patterns)

**Artifacts Created**:
1. **contracts/DomainErrors.ts**: Base `DomainError` class + 7 concrete error types
2. **contracts/ISessionProvider.ts**: Session management abstraction
3. **contracts/ICacheInvalidator.ts**: Optional cache notification interface
4. **data-model.md**: Complete type definitions and entity relationships
5. **quickstart.md**: 5 migration patterns with before/after examples

**Design complete** → Phase 2 will generate `tasks.md` for implementation

---

## Implementation Strategy

### Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking auth flows (login/logout/session) | **HIGH** - users locked out | Medium | Phase B migration first; comprehensive E2E tests before deployment |
| Cache invalidation missing (stale data) | **MEDIUM** - incorrect UI state | Medium | Verify cache paths/tags in `research.md`; add cache hit monitoring |
| Type errors at backend/app-layer boundary | **LOW** - build failures | High | TypeScript strict mode catches at compile time |
| Performance regression (extra abstraction) | **LOW** - <10ms overhead | Low | Benchmark critical paths (order creation, shop page load) |
| Duplicate cache logic (dashboard + storefront) | **MEDIUM** - maintenance burden | Medium | Centralize cache path builders in backend `domain/cache.ts` |

### Migration Phases (7 Phases)

**Phase A: Foundation (Core Errors & Interfaces)** - 1-2 days
- Create domain error classes (`NotAuthenticatedError`, `ResourceNotFoundError`, etc.)
- Define service interfaces (`ISessionProvider`, `ICacheInvalidator`)
- Export cache constants (`CACHE_TAGS`) from core domain
- Create app-layer helper modules (`lib/session.ts`, `lib/cache.ts`) in dashboard/storefront
- **Test**: All existing functionality still works (no code using new APIs yet)
- **Files affected**: 0 backend violations fixed (foundation only)

**Phase B: Identity Feature (High Risk - Auth)** - 2-3 days
- Refactor `auth.ts` actions: extract pure `AuthService.login()`, remove `redirect()`
- Create dashboard `actions/auth-actions.ts`: wrap backend + call `redirect()`
- Refactor `dashboard.ts` query: remove `redirect()`, throw `NotAuthenticatedError`
- Refactor `my-account.ts` query: remove `notFound()`, throw `ResourceNotFoundError`
- Update dashboard pages to use new actions/queries with error handling
- **Test**: Login/logout flows work identically; backend tests run in pure Node.js
- **Files affected**: 4 backend violations fixed (`auth.ts`, `profile.ts`, `dashboard.ts`, `my-account.ts`)

**Phase C: Order Feature (Medium Risk - Critical Business Logic)** - 1-2 days
- Refactor `order.ts` actions: remove `revalidatePath`, return invalidation paths
- Create dashboard `actions/order-actions.ts`: wrap backend + revalidate cache
- Update dashboard order pages to use new actions
- **Test**: Order creation/update works; cache invalidation verified
- **Files affected**: 1 backend violation fixed (`order.ts`)

**Phase D: Catalog Feature (Medium Risk - Multiple Files)** - 3-4 days
- Refactor `product.ts`, `brand.ts`, `category.ts`: remove `revalidatePath/Tag`
- Refactor `shop-page.ts`, `storefront.ts`, `category-page.ts`: remove `cacheTag/cacheLife`
- Create storefront `queries/shop-queries.ts` with `"use cache"` wrappers
- Create dashboard `actions/catalog-actions.ts` for admin operations
- **Test**: Shop pages load correctly; cache hit rates unchanged
- **Files affected**: 6 backend violations fixed (3 actions + 3 queries)

**Phase E: Administration Feature (Low Risk - Admin Only)** - 2-3 days
- Refactor all `admin-*-actions.ts` files: remove `revalidatePath/Tag`
- Create dashboard `actions/admin-actions.ts` wrappers
- Update admin pages to use new actions
- **Test**: Admin CRUD operations work; cache invalidation verified
- **Files affected**: 5 backend violations fixed (admin-tag, admin-collection, admin-order, admin-product, inventory)

**Phase F: School Feature (Low Risk - Move Presentation Hook)** - 1 day
- Move `useSchoolListLookup.ts` from backend presentation to `dashboard/src/hooks/`
- Update import paths in dashboard components
- **Test**: School list lookup functionality works
- **Files affected**: 1 backend violation fixed (hook removed from backend)

**Phase G: Core Session Provider (Final Step)** - 1-2 days
- Refactor `CookieSessionProvider.ts`: make app-layer instantiate with injected `cookies()` parameter
- Update `auth-helpers.ts`: remove direct `cookies()` import, accept session as parameter
- App-layer extracts cookies and passes to backend services
- **Test**: Session creation/retrieval/deletion works
- **Files affected**: 2 backend violations fixed (`CookieSessionProvider.ts`, `auth-helpers.ts`)

**Total Duration**: 11-17 days (estimated)  
**Critical Path**: Phase B (Identity) → Phase C (Order) must be sequential; others can overlap

### No Rollback Strategy - Direct Migration

This refactoring uses a **direct replacement approach** with no fallback code:

1. **No feature flags**: Old code is deleted, new structure is the only implementation
2. **No dual code paths**: Each file is refactored once and fully migrated
3. **Branch strategy**: 
   - Create `002-backend-pure-typescript` branch
   - Each phase fully replaces old implementation
   - Thorough testing before merge ensures correctness
   - Once merged to main, the new architecture becomes permanent

4. **Package dependency cleanup**:
   - Remove `next` from `peerDependencies` in `packages/backend/package.json`
   - Remove `react`, `react-dom` from `peerDependencies` (not needed in pure backend)
   - Remove `@findeg/ui` from `peerDependencies` (backend should not depend on UI)
   - Keep only pure TypeScript dependencies (zod, drizzle-orm, postgres, etc.)

**Rationale**: Maintaining dual code paths violates DRY principle and Constitution Principle VI. The new architecture is the correct implementation per Constitution Principle VIII; there is no valid reason to preserve framework-coupled code.

### Success Metrics

**Per Phase**:
- ✅ Zero Next.js imports in migrated backend files
- ✅ 100% test coverage for new pure backend services
- ✅ Zero regressions in E2E tests for affected features
- ✅ Backend test execution <5 seconds for migrated features

**Overall**:
- ✅ All 21 Next.js import violations eliminated from `packages/backend/src`
- ✅ Zero Next.js dependencies in `packages/backend/package.json` (removed from peerDependencies)
- ✅ Zero React dependencies in backend package (removed react, react-dom, @findeg/ui)
- ✅ `pnpm --filter @findeg/backend test` completes in <30 seconds (pure Node.js environment)
- ✅ 100% of critical user flows pass Cypress E2E tests
- ✅ Cache hit rates remain unchanged (no performance regression)
- ✅ TypeScript strict mode passes with zero errors
- ✅ Lint passes with zero violations
- ✅ Backend package can be tested/used in pure Node.js environment without any framework
- ✅ Build succeeds for all 3 packages (backend, dashboard, storefront)

---

## Refactoring Patterns Summary

### Pattern 1: Cache Revalidation Extraction

**Before**: Backend calls `revalidatePath()` as side effect  
**After**: Backend returns paths as data, app-layer executes revalidation

**Example**: Order status update
- Backend: `return { data: order, cache: { paths: ["/admin/orders", "/admin/orders/123"] } }`
- App-layer: `result.cache?.paths?.forEach(path => revalidatePath(path))`

### Pattern 2: Query Caching Extraction

**Before**: Backend uses `"use cache"` directive and `cacheTag()`  
**After**: Backend exports pure function + cache config, app-layer wraps with `"use cache"`

**Example**: Shop page query
- Backend: `export async function getShopPageViewModel(locale, query) { /* pure logic */ }`
- Backend: `export const SHOP_PAGE_CACHE_CONFIG = { tags: [...], revalidate: 3600 }`
- App-layer: `"use cache"; cacheTag(...); return getShopPageViewModel(...)`

### Pattern 3: Error Translation (Auth)

**Before**: Backend calls `redirect("/login")`  
**After**: Backend throws `NotAuthenticatedError`, app-layer catches and redirects

**Example**: Dashboard query
- Backend: `if (!userId) throw new NotAuthenticatedError()`
- App-layer: `catch (error) { if (error instanceof NotAuthenticatedError) redirect(error.getRedirectPath()) }`

### Pattern 4: Error Translation (Not Found)

**Before**: Backend calls `notFound()`  
**After**: Backend throws `ResourceNotFoundError`, app-layer catches and calls `notFound()`

**Example**: User profile query
- Backend: `if (!user) throw new ResourceNotFoundError("User", userId)`
- App-layer: `catch (error) { if (error instanceof ResourceNotFoundError) notFound() }`

### Pattern 5: Session Injection

**Before**: Backend reads `cookies()` directly  
**After**: App-layer extracts session, passes to backend as parameter

**Example**: Dashboard data query
- Backend: `export async function getDashboardData(locale, userId: string) { /* use userId */ }`
- App-layer: `const session = await extractSession(); const data = await getDashboardData(locale, session.userId)`

---

## Concrete Examples (Before/After Code)

### Example 1: Order Status Update (Cache Revalidation)

**Before (Backend - VIOLATES Principle VIII)**:
```typescript
// packages/backend/src/features/order/application/actions/order.ts
"use server";
import { revalidatePath } from "next/cache";  // ❌

export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    await service.updateStatus(id, input);
    revalidatePath("/admin/orders");  // ❌ Side effect
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error) };
  }
}
```

**After (Backend - Pure TypeScript)**:
```typescript
// packages/backend/src/features/order/application/services/OrderService.ts
export async function updateOrderStatus(
  id: number, 
  input: OrderStatusUpdate
): Promise<ServiceResult<Order>> {
  const order = await service.updateStatus(id, input);
  return {
    data: order,
    cache: { paths: getOrderCachePaths(id) }  // ✅ Returns data, not action
  };
}
```

**After (App-Layer - Dashboard Server Action)**:
```typescript
// packages/dashboard/src/actions/order-actions.ts
"use server";
import { revalidatePath } from "next/cache";  // ✅ Framework usage in app-layer
import { updateOrderStatus } from "@findeg/backend/features/order";

export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const result = await updateOrderStatus(id, input);
    result.cache?.paths?.forEach(path => revalidatePath(path));  // ✅ Executes invalidation
    return { success: true, order: result.data };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error) };
  }
}
```

### Example 2: Dashboard Query (Auth Error Translation)

**Before (Backend - VIOLATES Principle VIII)**:
```typescript
// packages/backend/src/features/identity/application/queries/dashboard.ts
import { redirect } from "next/navigation";  // ❌

export async function getDashboardDataOrRedirect(locale: string) {
  const session = await auth.getSession();  // ❌ Reads global context
  if (!session?.userId) {
    redirect("/login");  // ❌ Framework operation
  }
  // ... fetch data
  return { products, orders, session };
}
```

**After (Backend - Pure TypeScript)**:
```typescript
// packages/backend/src/features/identity/application/queries/dashboard.ts
export async function getDashboardData(
  locale: string,
  userId: string | null  // ✅ Explicit parameter
): Promise<DashboardData> {
  if (!userId) {
    throw new NotAuthenticatedError();  // ✅ Domain error
  }
  const [products, orders] = await Promise.all([
    repositories.products.getAll(locale),
    repositories.orders.getByUserId(userId),
  ]);
  return { products, orders };
}
```

**After (App-Layer - Dashboard Server Component)**:
```typescript
// packages/dashboard/src/app/dashboard/page.tsx
import { redirect } from "next/navigation";  // ✅ Framework usage in app-layer
import { getDashboardData, NotAuthenticatedError } from "@findeg/backend/features/identity";
import { extractSession } from "@/lib/session";

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  try {
    const session = await extractSession();  // ✅ App-layer extracts
    const data = await getDashboardData(params.locale, session?.userId);
    return <DashboardView data={data} />;
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      redirect(error.getRedirectPath());  // ✅ Translates error to redirect
    }
    throw error;
  }
}
```

### Example 3: Shop Page Query (Cache Directive Removal)

**Before (Backend - VIOLATES Principle VIII)**:
```typescript
// packages/backend/src/features/catalog/application/queries/shop-page.ts
import { cacheTag, cacheLife } from "next/cache";  // ❌

export async function getShopPageViewModel(locale: string, query: object) {
  "use cache";  // ❌ Next.js directive
  cacheTag("shop-page");  // ❌ Framework API
  cacheLife("hours");  // ❌
  // ... build view model
  return viewModel;
}
```

**After (Backend - Pure TypeScript)**:
```typescript
// packages/backend/src/features/catalog/application/queries/shop-page.ts
export async function getShopPageViewModel(
  locale: string, 
  query: object
): Promise<ShopPageViewModel> {
  // ✅ Pure function - no cache directives
  const products = await repositories.products.getAll(locale);
  const categoryTree = buildCategoryTree(categories, products);
  return { products, categoryTree };
}

// Export cache config separately
export const SHOP_PAGE_CACHE_CONFIG = {
  tags: ["shop-page", "products", "categories"],
  revalidate: 3600
} as const;
```

**After (App-Layer - Storefront Query Wrapper)**:
```typescript
// packages/storefront/src/queries/shop-queries.ts
"use cache";
import { cacheTag, cacheLife } from "next/cache";  // ✅ Framework usage in app-layer
import { getShopPageViewModel, SHOP_PAGE_CACHE_CONFIG } from "@findeg/backend/features/catalog";

export async function getCachedShopPageData(locale: string, query: object) {
  SHOP_PAGE_CACHE_CONFIG.tags.forEach(tag => cacheTag(tag));  // ✅ Applies caching
  cacheLife("hours");
  return getShopPageViewModel(locale, query);
}
```

---

## Testing Strategy

### Backend Unit Tests (Pure Node.js)

**Objective**: All backend services testable in Vitest without Next.js runtime

**Pattern**:
```typescript
import { describe, it, expect, vi } from "vitest";
import { OrderService } from "../application/services/OrderService";

describe("OrderService", () => {
  it("throws ResourceNotFoundError when order not found", async () => {
    const mockRepository = { getById: vi.fn().mockResolvedValue(null) };
    const service = new OrderService(mockRepository);
    
    await expect(service.updateStatus(999, { status: "shipped" }))
      .rejects.toThrow(ResourceNotFoundError);
  });
});
```

**Characteristics**:
- No `import` from `next/*` packages
- Mocks injected via constructor or test setup
- Tests verify business logic, not framework integration
- Execution time <5 seconds per feature (demonstrates framework independence)

### App-Layer Integration Tests (Mocks Next.js APIs)

**Objective**: Verify orchestration between backend and framework

**Pattern**:
```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@findeg/backend/features/order", () => ({ updateOrderStatus: vi.fn() }));

import { updateOrderStatusAction } from "../order-actions";
import { revalidatePath } from "next/cache";

describe("updateOrderStatusAction", () => {
  it("calls backend and revalidates cache", async () => {
    vi.mocked(updateOrderStatus).mockResolvedValue({
      data: { id: 1 },
      cache: { paths: ["/admin/orders"] }
    });
    
    await updateOrderStatusAction(1, { status: "shipped" });
    
    expect(revalidatePath).toHaveBeenCalledWith("/admin/orders");
  });
});
```

**Characteristics**:
- Mocks Next.js APIs (`revalidatePath`, `redirect`, `cookies`)
- Mocks backend services
- Tests verify correct orchestration: backend called, cache invalidated, errors handled

### E2E Tests (Cypress)

**Objective**: Verify end-to-end functionality unchanged

**Scenarios**:
- Login flow: User logs in → redirected to dashboard (tests auth + redirect translation)
- Order creation: Admin creates order → cache invalidated → order appears in list (tests cache orchestration)
- Shop page load: User visits shop → cached data served → correct products displayed (tests query caching)

**Run**: `pnpm run e2e:run --spec "cypress/e2e/auth.cy.ts,cypress/e2e/orders.cy.ts,cypress/e2e/shop.cy.ts"`

---

## Definition of Done

### Code Quality Gates

- ✅ **Type-check passes**: `pnpm run type-check` (all 3 packages)
- ✅ **Lint passes**: `pnpm run lint` (includes ESLint + i18n validation)
- ✅ **Build succeeds**: `pnpm run build` (all 3 packages)
- ✅ **Backend tests pass**: `pnpm --filter @findeg/backend test` (<30 seconds execution)
- ✅ **App-layer tests pass**: `pnpm --filter @findeg/dashboard test && pnpm --filter @findeg/storefront test`
- ✅ **E2E tests pass**: `pnpm run e2e:run` (critical user journeys)

### Architecture Compliance

- ✅ **Zero Next.js imports** in `packages/backend/src` (verified by grep search)
- ✅ **Constitution Principle VIII**: Backend package is pure TypeScript library
- ✅ **Constitution Principle IX**: Package boundaries respected (no circular dependencies)
- ✅ **Clean Architecture**: 4-layer structure maintained; no cross-feature infrastructure dependencies
- ✅ **SOLID Principles**: Single Responsibility (backend = logic, app = framework); Dependency Inversion (backend depends on interfaces)

### Code Quality

- ✅ **DRY Principle**: Cache invalidation paths centralized in backend `domain/cache.ts`
- ✅ **No duplicated logic**: Backend services reused across dashboard/storefront
- ✅ **CLEAN CODE**: Meaningful names, small functions, early returns, no deep nesting

### Documentation

- ✅ **Migration guide updated**: `quickstart.md` has before/after examples for all patterns
- ✅ **Type exports documented**: Backend `index.ts` exports all public APIs
- ✅ **Error catalog complete**: All 7 domain error types documented with usage examples

### Backward Compatibility

- ✅ **Zero regressions**: All existing functionality works identically from user perspective
- ✅ **Cache behavior unchanged**: Cache hit rates remain same (verified by monitoring)
- ✅ **Performance acceptable**: <10ms overhead from abstraction layers (benchmarked on critical paths)

---

## Next Steps

This plan is **Phase 1 complete**. Proceed to Phase 2:
