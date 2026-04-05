# Research: Backend Pure TypeScript Refactoring Patterns

**Feature**: Backend Pure TypeScript Refactoring  
**Date**: April 5, 2026  
**Phase**: 0 - Research & Pattern Discovery

## Executive Summary

This research identifies concrete refactoring patterns to eliminate all 21 Next.js framework dependencies from @findeg/backend while maintaining 100% backward compatibility for dashboard/storefront functionality. Three primary patterns emerged: **Service Refactoring Pattern** (extract pure logic), **App-Layer Integration Pattern** (orchestrate with framework), and **Error Translation Pattern** (domain errors to HTTP responses).

---

## 1. Service Refactoring Pattern

**Problem**: Backend services currently perform side effects (cache invalidation) and framework operations (redirect) instead of returning data.

**Solution**: Extract pure business logic that returns operation results; app-layer handles side effects.

### Pattern 1A: Cache Revalidation Extraction

**Current Implementation** (backend violates Principle VIII):

```typescript
// packages/backend/src/features/order/application/actions/order.ts
"use server";
import { revalidatePath } from "next/cache"; // ❌ Framework dependency

export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const service = container.adminOrderService;
    await service.updateStatus(id, input);
    revalidatePath("/admin/orders"); // ❌ Side effect in backend
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error) };
  }
}
```

**Refactored Implementation** (backend - pure TypeScript):

```typescript
// packages/backend/src/features/order/application/services/OrderService.ts
export class OrderService {
  async updateStatus(id: number, input: OrderStatusUpdate): Promise<Order> {
    // Pure business logic - no framework dependencies
    const order = await this.repository.getById(id);
    if (!order) {
      throw new ResourceNotFoundError("Order", id);
    }

    order.updateStatus(input.status, input.trackingNumber);
    await this.repository.save(order);

    return order; // ✅ Returns data, no side effects
  }
}

// Export as interface contract for app-layer
export interface OrderUpdateResult {
  order: Order;
  invalidatePaths: string[]; // Paths to revalidate
}

export async function updateOrderStatus(
  id: number,
  input: OrderStatusUpdate,
): Promise<OrderUpdateResult> {
  const service = container.adminOrderService;
  const order = await service.updateStatus(id, input);

  return {
    order,
    invalidatePaths: ["/admin/orders", `/admin/orders/${id}`], // ✅ Data, not action
  };
}
```

**App-Layer Integration** (dashboard - Next.js Server Action):

```typescript
// packages/dashboard/src/actions/admin-actions.ts
"use server";
import { revalidatePath } from "next/cache"; // ✅ Framework usage in app-layer
import { updateOrderStatus } from "@findeg/backend/features/order";
import { resolveErrorMessage } from "@findeg/backend/features/core";

export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const result = await updateOrderStatus(id, input);

    // ✅ App-layer handles cache invalidation
    result.invalidatePaths.forEach((path) => revalidatePath(path));

    return { success: true, order: result.order };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error) };
  }
}
```

**Decision**: Return cache invalidation paths as data from backend; app-layer executes revalidation.

**Rationale**:

- Backend remains framework-agnostic and testable
- Cache strategy centralized but execution deferred to app-layer
- Enables different caching strategies per app (dashboard vs storefront)

**Alternatives Considered**:

- **Observer pattern with ICacheNotifier interface**: More complex, over-engineered for current needs
- **Hardcoded cache invalidation in app-layer**: Duplicates knowledge of which paths to invalidate
- **Chose "return paths as data"**: Simplest, DRY (paths defined once in backend), app-layer decides execution

---

### Pattern 1B: Query Caching Extraction

**Current Implementation** (backend violates Principle VIII):

```typescript
// packages/backend/src/features/catalog/application/queries/shop-page.ts
import { cacheTag, cacheLife } from "next/cache"; // ❌ Framework dependency

export async function getShopPageViewModel(locale: string, query: object) {
  "use cache"; // ❌ Next.js directive
  cacheTag("shop-page"); // ❌ Framework API
  cacheLife("hours"); // ❌ Framework API

  const { categories } = getServices();
  const shopData = await getShopPageData(locale);
  // ... build view model
  return viewModel;
}
```

**Refactored Implementation** (backend - pure TypeScript):

```typescript
// packages/backend/src/features/catalog/application/queries/shop-page.ts
export async function getShopPageViewModel(
  locale: string,
  query: object,
): Promise<ShopPageViewModel> {
  // ✅ Pure function - no cache directives
  const { categories } = getServices();
  const shopData = await getShopPageData(locale);

  const products = shopData.products;
  const categoryOptions = buildCategoryTree(categories, products);
  const brandOptions = buildBrandOptions(products);
  const filteredProducts = applyListingFilters(products, parseFilters(query));

  return { products, filteredProducts, categoryOptions, brandOptions };
}

// Export cache metadata as constant
export const SHOP_PAGE_CACHE_CONFIG = {
  tags: ["shop-page", "products", "categories"],
  revalidate: 3600, // 1 hour
} as const;
```

**App-Layer Integration** (storefront - Server Component with cache):

```typescript
// packages/storefront/src/queries/shop-queries.ts
"use cache";
import { cacheTag, cacheLife } from "next/cache";
import { getShopPageViewModel, SHOP_PAGE_CACHE_CONFIG } from "@findeg/backend/features/catalog";

export async function getCachedShopPageData(locale: string, query: object) {
  // ✅ App-layer applies caching
  SHOP_PAGE_CACHE_CONFIG.tags.forEach((tag) => cacheTag(tag));
  cacheLife("hours");

  return getShopPageViewModel(locale, query);
}
```

**Decision**: Remove cache directives from backend queries; app-layer wraps queries with `"use cache"`.

**Rationale**:

- Backend query becomes pure synchronous function (easier to test)
- Cache configuration exported as data (DRY across dashboard/storefront)
- App-layer controls cache strategy per deployment environment

**Alternatives Considered**:

- **Keep cache directives in backend**: Violates Principle VIII, couples backend to Next.js
- **Duplicate cache config in each app**: Violates DRY Principle
- **Chose "export cache config as data"**: Best of both - centralized config, framework-agnostic backend

---

## 2. Error Handling & Redirect Translation Pattern

**Problem**: Backend services call `redirect()` and `notFound()` instead of throwing typed errors.

**Solution**: Backend throws domain-specific errors; app-layer catches and translates to Next.js responses.

### Pattern 2A: Authentication Error Translation

**Current Implementation** (backend violates Principle VIII):

```typescript
// packages/backend/src/features/identity/application/queries/dashboard.ts
import { redirect } from "next/navigation"; // ❌ Framework dependency

export async function getDashboardDataOrRedirect(locale: string): Promise<DashboardData> {
  const { auth } = getServices();
  const session = await auth.getSession();

  if (!session?.userId) {
    redirect("/login"); // ❌ Framework operation in backend
  }

  // ... fetch data
  return { products, orders, session };
}
```

**Refactored Implementation** (backend - pure TypeScript):

```typescript
// packages/backend/src/features/core/domain/errors/DomainError.ts
export class NotAuthenticatedError extends DomainError {
  constructor(message = "User not authenticated") {
    super("NOT_AUTHENTICATED", message, { statusCode: 401 });
  }

  // Metadata for app-layer routing decisions
  getRedirectPath(): string {
    return "/login";
  }
}

// packages/backend/src/features/identity/application/queries/dashboard.ts
export async function getDashboardData(
  locale: string,
  session: SessionPayload | null, // ✅ Explicit parameter, not global read
): Promise<DashboardData> {
  if (!session?.userId) {
    throw new NotAuthenticatedError(); // ✅ Domain error, not redirect
  }

  const { products, schoolLists, repositories } = getServices();
  const [allProducts, userOrders, allSchoolLists] = await Promise.all([
    products.getAll(locale),
    repositories.orders.getByUserId(session.userId),
    schoolLists.getAllLists(),
  ]);

  return { products: allProducts, orders: userOrders, schoolLists: allSchoolLists, session };
}
```

**App-Layer Integration** (dashboard - Server Component):

```typescript
// packages/dashboard/src/app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardData, NotAuthenticatedError } from "@findeg/backend/features/identity";
import { extractSession } from "@/lib/session";

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  try {
    const cookieStore = await cookies();
    const session = await extractSession(cookieStore);  // ✅ App-layer extracts session

    const data = await getDashboardData(params.locale, session);
    return <DashboardView data={data} />;

  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      redirect(error.getRedirectPath());  // ✅ App-layer translates error to redirect
    }
    throw error;
  }
}
```

**Decision**: Backend throws typed domain errors with metadata; app-layer translates to redirects.

**Rationale**:

- Backend becomes testable (throw error vs calling framework API)
- Error handling logic centralized in app-layer error boundaries
- Error metadata (redirect path, status code) defined in domain, not repeated in app-layer

**Alternatives Considered**:

- **Return Result<T, E> type**: More functional, but JavaScript lacks native pattern matching
- **Throw generic Error with codes**: Loses type safety, no IDE autocomplete for error types
- **Chose "typed domain errors with metadata"**: Type-safe, IDE-friendly, minimal boilerplate

---

### Pattern 2B: Resource Not Found Translation

**Current Implementation** (backend violates Principle VIII):

```typescript
// packages/backend/src/features/identity/application/queries/my-account.ts
import { notFound } from "next/navigation"; // ❌ Framework dependency

export async function getMyAccountData(userId: string) {
  const user = await repositories.users.getById(userId);
  if (!user) {
    notFound(); // ❌ Framework operation
  }
  return user;
}
```

**Refactored Implementation** (backend - pure TypeScript):

```typescript
// packages/backend/src/features/core/domain/errors/DomainError.ts
export class ResourceNotFoundError extends DomainError {
  constructor(resourceType: string, identifier: string | number) {
    super("RESOURCE_NOT_FOUND", `${resourceType} with identifier ${identifier} not found`, {
      resourceType,
      identifier,
      statusCode: 404,
    });
  }
}

// packages/backend/src/features/identity/application/queries/my-account.ts
export async function getMyAccountData(userId: string): Promise<User> {
  const user = await repositories.users.getById(userId);
  if (!user) {
    throw new ResourceNotFoundError("User", userId); // ✅ Domain error
  }
  return user;
}
```

**App-Layer Integration** (dashboard - Server Component):

```typescript
// packages/dashboard/src/app/my-account/page.tsx
import { notFound } from "next/navigation";
import { getMyAccountData, ResourceNotFoundError } from "@findeg/backend/features/identity";

export default async function MyAccountPage() {
  try {
    const session = await extractSession();
    const data = await getMyAccountData(session.userId);
    return <MyAccountView data={data} />;

  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      notFound();  // ✅ App-layer calls Next.js notFound()
    }
    throw error;
  }
}
```

**Decision**: Backend throws `ResourceNotFoundError`; app-layer calls `notFound()`.

**Rationale**:

- Backend error is framework-agnostic (could translate to 404 JSON in API, or notFound() in Next.js)
- Error contains metadata (resource type, identifier) for logging/debugging
- App-layer has single responsibility: translate domain errors to framework responses

---

## 3. Session & Request Context Injection Pattern

**Problem**: Backend services read session from global `cookies()` API instead of accepting parameters.

**Solution**: Backend services accept session as explicit parameters; app-layer extracts and passes session.

### Pattern 3A: Session Provider Abstraction

**Current Implementation** (backend violates Principle VIII):

```typescript
// packages/backend/src/features/core/infrastructure/auth/CookieSessionProvider.ts
import { cookies } from "next/headers"; // ❌ Framework dependency

export class CookieSessionProvider implements ISessionProvider {
  async getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies(); // ❌ Global framework API
    const token = cookieStore.get("session")?.value;
    // ... validate token
    return session;
  }
}
```

**Refactored Implementation** (backend - pure TypeScript):

```typescript
// packages/backend/src/features/core/application/interfaces/ISessionProvider.ts
export interface ISessionProvider {
  createSession(payload: SessionPayload): Promise<void>;
  getSession(): Promise<SessionPayload | null>;
  deleteSession(): Promise<void>;
}

// packages/backend/src/features/core/infrastructure/auth/CookieSessionProvider.ts
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export class CookieSessionProvider implements ISessionProvider {
  constructor(private cookieStore: ReadonlyRequestCookies) {} // ✅ Injected dependency

  async getSession(): Promise<SessionPayload | null> {
    const token = this.cookieStore.get("session")?.value; // ✅ Uses injected cookies
    if (!token) return null;
    return this.sessionManager.validateToken(token);
  }

  // ... createSession, deleteSession
}
```

**App-Layer Integration** (dashboard - session extraction helper):

```typescript
// packages/dashboard/src/lib/session.ts
import { cookies } from "next/headers";
import { CookieSessionProvider } from "@findeg/backend/features/core";

export async function extractSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies(); // ✅ App-layer reads framework API
  const provider = new CookieSessionProvider(cookieStore);
  return provider.getSession();
}

// Usage in Server Component
export default async function DashboardPage() {
  const session = await extractSession();
  const data = await getDashboardData(locale, session); // ✅ Pass as parameter
  // ...
}
```

**Decision**: **REJECTED** - Dependency injection adds complexity. **Alternative chosen**: Extract session in app-layer, pass as parameter.

**Simpler Alternative** (FINAL PATTERN):

```typescript
// packages/backend/src/features/identity/application/queries/dashboard.ts
export async function getDashboardData(
  locale: string,
  userId: string  // ✅ Simple parameter, not injected provider
): Promise<DashboardData> {
  const { products, repositories } = getServices();
  const [allProducts, userOrders] = await Promise.all([
    products.getAll(locale),
    repositories.orders.getByUserId(userId),  // ✅ Uses parameter
  ]);
  return { products: allProducts, orders: userOrders };
}

// App-layer extracts session and passes userId
export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = await extractSession();
  if (!session) redirect("/login");

  const data = await getDashboardData(params.locale, session.userId);  // ✅ Pass userId
  return <DashboardView data={data} />;
}
```

**Final Decision**: Extract session in app-layer, pass required fields (userId, permissions) as parameters to backend.

**Rationale**:

- Simpler than dependency injection (no constructor complexity)
- Backend signature clearly shows required auth context
- App-layer controls when/how session is extracted (can cache, can mock)

**Alternatives Considered**:

- **Dependency Injection with ISessionProvider**: Over-engineered for current needs
- **Keep CookieSessionProvider with cookies() import**: Violates Principle VIII
- **Chose "parameter passing"**: Simplest solution that maintains testability

---

## 4. Testing Strategy

**Objective**: Backend unit tests run in pure Node.js (Vitest) without Next.js runtime; app-layer integration tests verify framework orchestration.

### Backend Unit Test Pattern

```typescript
// packages/backend/src/features/order/__tests__/OrderService.test.ts
import { describe, it, expect, vi } from "vitest";
import { OrderService } from "../application/services/OrderService";
import { ResourceNotFoundError } from "@/features/core/domain/errors";

describe("OrderService", () => {
  it("throws ResourceNotFoundError when order not found", async () => {
    const mockRepository = {
      getById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };

    const service = new OrderService(mockRepository);

    await expect(service.updateStatus(999, { status: "shipped" })).rejects.toThrow(
      ResourceNotFoundError,
    );

    expect(mockRepository.getById).toHaveBeenCalledWith(999);
  });

  it("updates order status and returns order", async () => {
    const mockOrder = { id: 1, status: "pending", updateStatus: vi.fn() };
    const mockRepository = {
      getById: vi.fn().mockResolvedValue(mockOrder),
      save: vi.fn().mockResolvedValue(mockOrder),
    };

    const service = new OrderService(mockRepository);
    const result = await service.updateStatus(1, { status: "shipped" });

    expect(mockOrder.updateStatus).toHaveBeenCalledWith("shipped", undefined);
    expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    expect(result).toBe(mockOrder);
  });
});
```

**Key Points**:

- No Next.js imports or runtime required
- Mocks injected via constructor or parameters
- Tests verify business logic, not framework integration

### App-Layer Integration Test Pattern

```typescript
// packages/dashboard/src/actions/__tests__/admin-actions.test.ts
import { describe, it, expect, vi } from "vitest";
import { updateOrderStatusAction } from "../admin-actions";

// Mock Next.js cache API
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock backend service
vi.mock("@findeg/backend/features/order", () => ({
  updateOrderStatus: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@findeg/backend/features/order";

describe("updateOrderStatusAction", () => {
  it("calls backend service and revalidates cache on success", async () => {
    const mockOrder = { id: 1, status: "shipped" };
    vi.mocked(updateOrderStatus).mockResolvedValue({
      order: mockOrder,
      invalidatePaths: ["/admin/orders", "/admin/orders/1"],
    });

    const result = await updateOrderStatusAction(1, { status: "shipped" });

    expect(updateOrderStatus).toHaveBeenCalledWith(1, { status: "shipped" });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/orders");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/orders/1");
    expect(result).toEqual({ success: true, order: mockOrder });
  });
});
```

**Key Points**:

- Mocks Next.js APIs (`revalidatePath`, `redirect`)
- Mocks backend services
- Tests verify orchestration: backend called, cache invalidated, result returned

---

## 5. Domain Error Catalog

**Requirement**: All backend services throw typed domain errors; app-layer translates to framework responses.

### Core Domain Errors

```typescript
// packages/backend/src/features/core/domain/errors/DomainError.ts
export abstract class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotAuthenticatedError extends DomainError {
  constructor(message = "User not authenticated") {
    super("NOT_AUTHENTICATED", message, { statusCode: 401 });
  }
  getRedirectPath(): string {
    return "/login";
  }
}

export class NotAuthorizedError extends DomainError {
  constructor(action: string, resource?: string) {
    super("NOT_AUTHORIZED", `Not authorized to ${action}${resource ? ` on ${resource}` : ""}`, {
      statusCode: 403,
      action,
      resource,
    });
  }
}

export class ResourceNotFoundError extends DomainError {
  constructor(resourceType: string, identifier: string | number) {
    super("RESOURCE_NOT_FOUND", `${resourceType} with identifier ${identifier} not found`, {
      statusCode: 404,
      resourceType,
      identifier,
    });
  }
}

export class ValidationError extends DomainError {
  constructor(field: string, message: string) {
    super("VALIDATION_ERROR", message, { statusCode: 400, field });
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, conflictingResource?: string) {
    super("CONFLICT", message, { statusCode: 409, conflictingResource });
  }
}
```

### App-Layer Error Translation Utility

```typescript
// packages/dashboard/src/lib/errors.ts
import {
  NotAuthenticatedError,
  NotAuthorizedError,
  ResourceNotFoundError
} from "@findeg/backend/features/core";
import { redirect, notFound } from "next/navigation";

export function handleDomainError(error: unknown): never {
  if (error instanceof NotAuthenticatedError) {
    redirect(error.getRedirectPath());
  }
  if (error instanceof NotAuthorizedError) {
    redirect("/403");
  }
  if (error instanceof ResourceNotFoundError) {
    notFound();
  }
  // Re-throw for error boundary
  throw error;
}

// Usage in Server Component
try {
  const data = await getDashboardData(locale, session);
  return <DashboardView data={data} />;
} catch (error) {
  handleDomainError(error);
}
```

---

## 6. Migration Execution Strategy

**Objective**: Minimize risk by migrating incrementally per feature area, maintaining 100% backward compatibility at each step.

### Migration Phases

**Phase A: Foundation (Core Errors & Interfaces)**

1. Create domain error classes in `core/domain/errors/`
2. Define `ISessionProvider`, `ICacheInvalidator` interfaces in `core/application/interfaces/`
3. Export cache tag constants from `core/domain/constants/cache-tags.ts`
4. Create app-layer helper modules (`lib/session.ts`, `lib/cache.ts`) in dashboard/storefront
5. **Test**: All existing functionality still works (no code using new APIs yet)

**Phase B: Identity Feature (High Risk - Auth)**

1. Refactor `auth.ts` actions: extract pure `AuthService.login()`; remove `redirect()`
2. Create dashboard `actions/auth-actions.ts`: wrap backend + call `redirect()`
3. Refactor `dashboard.ts` query: remove `redirect()`, throw `NotAuthenticatedError`
4. Update dashboard pages to use new actions/queries with error handling
5. **Test**: Login/logout flows work identically; backend tests run in pure Node.js

**Phase C: Order Feature (Medium Risk - Critical Business Logic)**

1. Refactor `order.ts` actions: remove `revalidatePath`, return invalidation paths
2. Create dashboard `actions/order-actions.ts`: wrap backend + revalidate cache
3. Update dashboard order pages to use new actions
4. **Test**: Order creation/update works; cache invalidation verified

**Phase D: Catalog Feature (Medium Risk - Multiple Files)**

1. Refactor `product.ts`, `brand.ts`, `category.ts`: remove `revalidatePath/Tag`
2. Refactor `shop-page.ts`, `storefront.ts`, `category-page.ts`: remove `cacheTag/cacheLife`
3. Create storefront `queries/shop-queries.ts` with `"use cache"` wrappers
4. Create dashboard `actions/catalog-actions.ts` for admin operations
5. **Test**: Shop pages load correctly; cache hit rates unchanged

**Phase E: Administration Feature (Low Risk - Admin Only)**

1. Refactor all `admin-*-actions.ts` files: remove `revalidatePath/Tag`
2. Create dashboard `actions/admin-actions.ts` wrappers
3. Update admin pages to use new actions
4. **Test**: Admin CRUD operations work; cache invalidation verified

**Phase F: School Feature (Low Risk - Move Presentation Hook)**

1. **SPECIAL CASE**: `useSchoolListLookup.ts` is a React hook in backend presentation layer (violates Clean Architecture + Principle VIII)
2. Move `useSchoolListLookup.ts` to `dashboard/src/hooks/` (where React hooks belong)
3. Update import paths in dashboard components
4. **Test**: School list lookup functionality works

**Phase G: Core Session Provider (Final Step)**

1. Refactor `CookieSessionProvider.ts`: make app-layer instantiate with injected `cookies()`
2. **OR** keep in backend but mark as "app-layer integration utility" (exported from `backend/app-layer/`)
3. **Decision pending research**: If CookieSessionProvider is ONLY used by app-layer, move it entirely to app packages
4. **Test**: Session creation/retrieval/deletion works

### Rollback Strategy

Each phase is **independently deployable**:

- If Phase B (Identity) fails, revert dashboard actions/queries; backend code is unused but harmless
- If Phase C (Order) fails, revert app-layer actions; existing backend actions still callable
- Migration is NOT "all-or-nothing" - can pause at any phase

### Success Metrics Per Phase

- **Zero Next.js imports** in migrated backend files
- **100% test coverage** for new pure backend services
- **Zero regressions** in E2E tests for affected features
- **Backend test execution <5 seconds** for migrated features (demonstrates framework independence)

---

## 7. Best Practices Summary

### DO

✅ **Backend services**: Accept explicit parameters (userId, locale, filters), return data or throw typed errors  
✅ **App-layer**: Extract session/cookies using Next.js APIs, pass to backend as parameters  
✅ **Errors**: Throw domain-specific errors in backend, catch and translate to redirects/notFound in app-layer  
✅ **Caching**: Return cache metadata (tags, paths) as data from backend; app-layer executes `revalidatePath`  
✅ **Testing**: Write backend unit tests in pure Node.js; write app-layer integration tests with mocked Next.js APIs

### DON'T

❌ **Backend services**: Import from `next/cache`, `next/navigation`, `next/headers`  
❌ **Backend services**: Call `redirect()`, `notFound()`, `revalidatePath()`, `cookies()`  
❌ **Backend services**: Read global context (`cookies()`, `headers()`)  
❌ **App-layer**: Duplicate business logic or validation (call backend services, don't reimplement)  
❌ **App-layer**: Hardcode cache invalidation paths (get from backend metadata)

---

## 8. Open Questions & Decisions Needed

### Q1: CookieSessionProvider Location

**Question**: Should `CookieSessionProvider` stay in backend or move to app-layer?

**Options**:

- **A**: Keep in backend, make app-layer inject `cookies()` via constructor
- **B**: Move entirely to app packages (dashboard/storefront each have their own)
- **C**: Keep in backend under `app-layer/` directory (mark as "framework integration utility")

**Recommendation**: **Option A** - Keep in backend with dependency injection. Reasoning: Session management is business logic (JWT validation, token expiry), only cookie reading/writing is framework-specific. Backend exports `ISessionProvider` interface + implementation, app-layer instantiates with injected `cookies()`.

### Q2: Shared Cache Invalidation Helper

**Question**: Should dashboard and storefront share cache invalidation logic?

**Options**:

- **A**: Each app has own `lib/cache.ts` with duplicated `invalidateOrderCache(orderId)` helpers
- **B**: Create `@findeg/shared` package with cache helpers
- **C**: Backend exports cache path builders as functions (not constants)

**Recommendation**: **Option C** - Backend exports path builder functions. Reasoning:

```typescript
// packages/backend/src/features/order/domain/cache.ts
export function getOrderCachePaths(orderId: number): string[] {
  return ["/admin/orders", `/admin/orders/${orderId}`];
}

// App-layer usage
import { getOrderCachePaths } from "@findeg/backend/features/order";
const paths = getOrderCachePaths(orderId);
paths.forEach((path) => revalidatePath(path));
```

This maintains DRY without creating a new package, and keeps path logic centralized in backend.

### Q3: Error Handling - Catch-All vs Per-Error

**Question**: Should app-layer have catch-all error handler or catch each error type individually?

**Options**:

- **A**: Catch each error type separately in every Server Component/Action
- **B**: Global error boundary with type checking
- **C**: Utility function `handleDomainError(error)` centralizes translation logic

**Recommendation**: **Option C** - Centralized `handleDomainError()` utility (shown in section 5). Reasoning: DRY, single place to add new error translations, consistent error handling across app.

---

## Conclusion

All research complete. Three primary patterns identified:

1. **Service Refactoring**: Extract pure logic, return data (not side effects)
2. **Error Translation**: Throw domain errors, app-layer translates to redirects
3. **Session Injection**: Extract session in app-layer, pass as parameters

Migration strategy defined with 7 phases (A-G), each independently testable. Ready to proceed to Phase 1: Design (data-model.md, contracts/).
