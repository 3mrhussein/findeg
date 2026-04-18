# Quickstart: Backend Pure TypeScript Migration Guide

**Feature**: Backend Pure TypeScript Refactoring  
**Date**: April 5, 2026  
**Audience**: Developers migrating backend code to framework-agnostic architecture

## Overview

This guide provides practical before/after examples for migrating backend code from Next.js-dependent to pure TypeScript. Follow the patterns shown here when refactoring the 21 identified Next.js imports.

---

## Pattern 1: Remove Cache Revalidation from Backend

### Before: Backend performs cache invalidation (VIOLATES Principle VIII)

```typescript
// ❌ packages/backend/src/features/order/application/actions/order.ts
"use server";
import { revalidatePath } from "next/cache";  // Framework dependency
import { container } from "@features/core/infrastructure/di/ServiceContainer";

export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const service = container.adminOrderService;
    await service.updateStatus(id, input);
    
    // ❌ Side effect: cache invalidation in backend
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error) };
  }
}
```

### After: Backend returns data, app-layer handles caching

**Step 1**: Create cache path builder in backend (pure function)

```typescript
// ✅ packages/backend/src/features/order/domain/cache.ts
export function getOrderCachePaths(orderId?: number): string[] {
  const paths = ["/admin/orders"];
  if (orderId) {
    paths.push(`/admin/orders/${orderId}`);
  }
  return paths;
}
```

**Step 2**: Refactor backend service to return result with cache metadata

```typescript
// ✅ packages/backend/src/features/order/application/services/OrderService.ts
import { getOrderCachePaths } from "../../domain/cache";
import type { ServiceResult } from "@features/core/application/types/ServiceResult";

export async function updateOrderStatus(
  id: number, 
  input: OrderStatusUpdate
): Promise<ServiceResult<Order>> {
  const service = container.adminOrderService;
  const order = await service.updateStatus(id, input);
  
  // ✅ Returns data + cache metadata (no side effects)
  return {
    data: order,
    cache: {
      paths: getOrderCachePaths(id),
    },
  };
}
```

**Step 3**: Create app-layer Server Action that orchestrates backend + caching

```typescript
// ✅ packages/dashboard/src/actions/order-actions.ts
"use server";
import { revalidatePath } from "next/cache";  // Framework usage in app-layer
import { updateOrderStatus } from "@backend/features/order";
import { resolveErrorMessage } from "@backend/features/core";

export async function updateOrderStatusAction(id: number, input: OrderStatusUpdate) {
  try {
    const result = await updateOrderStatus(id, input);
    
    // ✅ App-layer executes cache invalidation
    result.cache?.paths?.forEach(path => revalidatePath(path));
    
    return { success: true, order: result.data };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error) };
  }
}
```

**Step 4**: Update dashboard page to use new app-layer action

```typescript
// ✅ packages/dashboard/src/app/admin/orders/[id]/page.tsx
import { updateOrderStatusAction } from "@actions/order-actions";  // App-layer action

// Component uses app-layer action (unchanged from user perspective)
<form action={updateOrderStatusAction}>
  {/* ... */}
</form>
```

---

## Pattern 2: Remove Redirects from Backend, Throw Domain Errors

### Before: Backend calls redirect() (VIOLATES Principle VIII)

```typescript
// ❌ packages/backend/src/features/identity/application/queries/dashboard.ts
import { redirect } from "next/navigation";  // Framework dependency
import { getServices } from "@server/getServices";

export async function getDashboardDataOrRedirect(locale: string): Promise<DashboardData> {
  const { auth, products, repositories } = getServices();
  const session = await auth.getSession();  // Reads global context

  if (!session?.userId) {
    redirect("/login");  // ❌ Framework operation
  }

  const [allProducts, userOrders] = await Promise.all([
    products.getAll(locale),
    repositories.orders.getByUserId(session.userId),
  ]);

  return { products: allProducts, orders: userOrders, session };
}
```

### After: Backend throws error, app-layer redirects

**Step 1**: Create domain error in backend

```typescript
// ✅ packages/backend/src/features/core/domain/errors/NotAuthenticatedError.ts
export class NotAuthenticatedError extends DomainError {
  constructor(message = "User not authenticated") {
    super("NOT_AUTHENTICATED", message, { statusCode: 401 });
  }
  
  getRedirectPath(): string {
    return "/login";
  }
}
```

**Step 2**: Refactor backend query to throw error and accept session parameter

```typescript
// ✅ packages/backend/src/features/identity/application/queries/dashboard.ts
import { NotAuthenticatedError } from "@features/core/domain/errors";
import { getServices } from "@server/getServices";

export async function getDashboardData(
  locale: string,
  userId: string | null  // ✅ Explicit parameter, not global read
): Promise<DashboardData> {
  if (!userId) {
    throw new NotAuthenticatedError();  // ✅ Domain error, not redirect
  }

  const { products, repositories } = getServices();
  const [allProducts, userOrders] = await Promise.all([
    products.getAll(locale),
    repositories.orders.getByUserId(userId),
  ]);

  return { products: allProducts, orders: userOrders };
}
```

**Step 3**: Create app-layer helper to extract session

```typescript
// ✅ packages/dashboard/src/lib/session.ts
import { cookies } from "next/headers";
import { container } from "@backend";

export async function extractSession() {
  const cookieStore = await cookies();
  const authService = container.authService;
  return authService.getSession();  // Backend service validates session
}
```

**Step 4**: Update dashboard page to handle error and redirect

```typescript
// ✅ packages/dashboard/src/app/dashboard/page.tsx
import { redirect } from "next/navigation";  // Framework usage in app-layer
import { getDashboardData, NotAuthenticatedError } from "@backend/features/identity";
import { extractSession } from "@lib/session";

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  try {
    const session = await extractSession();  // ✅ App-layer extracts session
    const data = await getDashboardData(params.locale, session?.userId);
    
    return <DashboardView data={data} />;
    
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      redirect(error.getRedirectPath());  // ✅ App-layer translates error to redirect
    }
    throw error;  // Re-throw for error boundary
  }
}
```

---

## Pattern 3: Remove Query Cache Directives from Backend

### Before: Backend uses "use cache" directive (VIOLATES Principle VIII)

```typescript
// ❌ packages/backend/src/features/catalog/application/queries/shop-page.ts
import { cacheTag, cacheLife } from "next/cache";  // Framework dependency
import { CACHE_TAGS } from "@features/core/domain/constants/cache-tags";

export async function getShopPageViewModel(locale: string, query: object) {
  "use cache";  // ❌ Next.js directive
  cacheTag(CACHE_TAGS.SHOP_PAGE);  // ❌ Framework API
  cacheLife("hours");  // ❌ Framework API
  
  const products = await repositories.products.getAll(locale);
  const categoryTree = buildCategoryTree(categories, products);
  
  return { products, categoryTree };
}
```

### After: Backend exports pure function + cache config, app-layer applies caching

**Step 1**: Refactor backend query to pure function (no cache directives)

```typescript
// ✅ packages/backend/src/features/catalog/application/queries/shop-page.ts
export async function getShopPageViewModel(
  locale: string, 
  query: object
): Promise<ShopPageViewModel> {
  // ✅ Pure function - no framework dependencies
  const products = await repositories.products.getAll(locale);
  const categories = await repositories.categories.getAll(locale);
  
  const categoryTree = buildCategoryTree(categories, products);
  const filteredProducts = applyListingFilters(products, parseFilters(query));
  
  return { products, filteredProducts, categoryTree };
}
```

**Step 2**: Export cache configuration as data

```typescript
// ✅ packages/backend/src/features/catalog/application/queries/cache-config.ts
import { CACHE_TAGS } from "@features/core/domain/constants/cache-tags";

export const SHOP_PAGE_CACHE_CONFIG = {
  tags: [CACHE_TAGS.SHOP_PAGE, CACHE_TAGS.PRODUCTS, CACHE_TAGS.CATEGORIES],
  revalidate: 3600,  // 1 hour in seconds
} as const;
```

**Step 3**: Create app-layer query wrapper with cache directives

```typescript
// ✅ packages/storefront/src/queries/shop-queries.ts
"use cache";
import { cacheTag, cacheLife } from "next/cache";  // Framework usage in app-layer
import { 
  getShopPageViewModel, 
  SHOP_PAGE_CACHE_CONFIG 
} from "@backend/features/catalog";

export async function getCachedShopPageData(locale: string, query: object) {
  // ✅ App-layer applies caching
  SHOP_PAGE_CACHE_CONFIG.tags.forEach(tag => cacheTag(tag));
  cacheLife("hours");
  
  return getShopPageViewModel(locale, query);
}
```

**Step 4**: Update storefront page to use app-layer query

```typescript
// ✅ packages/storefront/src/app/shop/page.tsx
import { getCachedShopPageData } from "@queries/shop-queries";  // App-layer query

export default async function ShopPage({ 
  params, 
  searchParams 
}: { 
  params: { locale: string }, 
  searchParams: object 
}) {
  const data = await getCachedShopPageData(params.locale, searchParams);
  return <ShopView data={data} />;
}
```

---

## Pattern 4: Remove cookies() from Backend, Inject Session

### Before: Backend reads cookies() directly (VIOLATES Principle VIII)

```typescript
// ❌ packages/backend/src/features/core/infrastructure/auth/CookieSessionProvider.ts
import { cookies } from "next/headers";  // Framework dependency

export class CookieSessionProvider implements ISessionProvider {
  async getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();  // ❌ Global framework API
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    
    return this.sessionManager.validateToken(token);
  }
  
  async createSession(payload: SessionPayload): Promise<void> {
    const jwt = await this.sessionManager.createToken(payload);
    const cookieStore = await cookies();
    cookieStore.set("session", jwt, { httpOnly: true });
  }
}
```

### After: App-layer provides cookies, backend receives cookie store

**Option A**: Inject cookie store via constructor (Dependency Injection)

```typescript
// ✅ packages/backend/src/features/core/infrastructure/auth/CookieSessionProvider.ts
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export class CookieSessionProvider implements ISessionProvider {
  constructor(private cookieStore: ReadonlyRequestCookies) {}  // ✅ Injected
  
  async getSession(): Promise<SessionPayload | null> {
    const token = this.cookieStore.get("session")?.value;  // ✅ Uses injected cookies
    if (!token) return null;
    return this.sessionManager.validateToken(token);
  }
  
  // createSession and deleteSession also use this.cookieStore
}
```

```typescript
// ✅ packages/dashboard/src/lib/session.ts
import { cookies } from "next/headers";
import { CookieSessionProvider } from "@backend/features/core";

export async function getSessionProvider(): Promise<CookieSessionProvider> {
  const cookieStore = await cookies();  // ✅ App-layer reads framework API
  return new CookieSessionProvider(cookieStore);
}

export async function extractSession() {
  const provider = await getSessionProvider();
  return provider.getSession();
}
```

**Option B**: Simpler pattern - Extract session in app-layer, pass userId to backend

```typescript
// ✅ packages/backend/src/features/identity/application/queries/dashboard.ts
export async function getDashboardData(
  locale: string,
  userId: string  // ✅ Simple parameter instead of injected provider
): Promise<DashboardData> {
  const [products, orders] = await Promise.all([
    repositories.products.getAll(locale),
    repositories.orders.getByUserId(userId),  // ✅ Uses parameter
  ]);
  return { products, orders };
}
```

```typescript
// ✅ packages/dashboard/src/app/dashboard/page.tsx
import { extractSession } from "@lib/session";
import { getDashboardData } from "@backend/features/identity";

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = await extractSession();  // ✅ App-layer extracts
  if (!session) redirect("/login");
  
  const data = await getDashboardData(params.locale, session.userId);  // ✅ Pass userId
  return <DashboardView data={data} />;
}
```

**Recommendation**: Use **Option B** (parameter passing) for most cases. Only use Option A (DI) if backend service needs full session provider capabilities (create/delete).

---

## Pattern 5: Move React Hooks from Backend to App-Layer

### Before: Backend presentation layer uses React hooks (VIOLATES Clean Architecture + Principle VIII)

```typescript
// ❌ packages/backend/src/features/school/presentation/hooks/useSchoolListLookup.ts
import { usePathname, useRouter } from "next/navigation";  // Framework dependency
import { useState } from "react";

export function useSchoolListLookup() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // ... hook logic
  return { isOpen, openModal, closeModal };
}
```

### After: Move hook to app-layer (dashboard/storefront)

**Step 1**: Move file to dashboard app

```bash
# Move from backend to dashboard
mv packages/backend/src/features/school/presentation/hooks/useSchoolListLookup.ts \
   packages/dashboard/src/hooks/useSchoolListLookup.ts
```

**Step 2**: Update imports in dashboard components

```typescript
// ✅ packages/dashboard/src/components/school/SchoolListModal.tsx
import { useSchoolListLookup } from "@hooks/useSchoolListLookup";  // App-layer hook

export function SchoolListModal() {
  const { isOpen, openModal, closeModal } = useSchoolListLookup();
  // ... component logic
}
```

**Step 3**: Clean up backend exports (remove presentation layer)

```typescript
// ✅ packages/backend/src/features/school/index.ts
// Remove export for useSchoolListLookup (no longer in backend)
export * from "./application/services/SchoolListService";
export * from "./domain/entities/SchoolList";
```

**Reasoning**: React hooks are UI concerns and belong in app-layer, not backend. Backend should only export business logic (services, entities, queries).

---

## Testing Patterns

### Backend Unit Test (Pure Node.js - No Next.js Runtime)

```typescript
// ✅ packages/backend/src/features/order/__tests__/OrderService.test.ts
import { describe, it, expect, vi } from "vitest";
import { OrderService } from "../application/services/OrderService";
import { ResourceNotFoundError } from "@features/core/domain/errors";

describe("OrderService - updateStatus", () => {
  it("throws ResourceNotFoundError when order not found", async () => {
    // ✅ Pure mocks - no Next.js APIs
    const mockRepository = {
      getById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };
    
    const service = new OrderService(mockRepository);
    
    // ✅ Test pure business logic
    await expect(service.updateStatus(999, { status: "shipped" }))
      .rejects
      .toThrow(ResourceNotFoundError);
  });
  
  it("updates order and returns result", async () => {
    const mockOrder = { id: 1, status: "pending", updateStatus: vi.fn() };
    const mockRepository = {
      getById: vi.fn().mockResolvedValue(mockOrder),
      save: vi.fn().mockResolvedValue(mockOrder),
    };
    
    const service = new OrderService(mockRepository);
    const result = await service.updateStatus(1, { status: "shipped" });
    
    expect(mockOrder.updateStatus).toHaveBeenCalledWith("shipped", undefined);
    expect(result).toBe(mockOrder);
  });
});
```

### App-Layer Integration Test (Mocks Next.js APIs)

```typescript
// ✅ packages/dashboard/src/actions/__tests__/order-actions.test.ts
import { describe, it, expect, vi } from "vitest";
import { updateOrderStatusAction } from "../order-actions";

// ✅ Mock Next.js cache API
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ✅ Mock backend service
vi.mock("@backend/features/order", () => ({
  updateOrderStatus: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@backend/features/order";

describe("updateOrderStatusAction", () => {
  it("calls backend and revalidates cache on success", async () => {
    vi.mocked(updateOrderStatus).mockResolvedValue({
      data: { id: 1, status: "shipped" },
      cache: { paths: ["/admin/orders", "/admin/orders/1"] },
    });
    
    const result = await updateOrderStatusAction(1, { status: "shipped" });
    
    // ✅ Verify orchestration
    expect(updateOrderStatus).toHaveBeenCalledWith(1, { status: "shipped" });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/orders");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/orders/1");
    expect(result.success).toBe(true);
  });
});
```

---

## Migration Checklist

For each file being migrated, verify:

- [ ] **Backend file**:
  - [ ] Removed all `import` from `next/cache`, `next/navigation`, `next/headers`
  - [ ] Services accept explicit parameters (userId, locale), not read global context
  - [ ] Services return data or throw typed domain errors
  - [ ] Cache metadata returned as data (paths/tags), not executed as side effects
  - [ ] Unit tests run in pure Node.js (Vitest) without Next.js runtime

- [ ] **App-layer file** (dashboard/storefront):
  - [ ] Created Server Action or query wrapper
  - [ ] Extracts session/cookies using Next.js APIs
  - [ ] Passes required data to backend as parameters
  - [ ] Executes cache invalidation based on backend metadata
  - [ ] Catches domain errors and translates to redirects/notFound
  - [ ] Integration tests mock Next.js APIs and backend services

- [ ] **Functionality**:
  - [ ] Existing feature works identically from user perspective
  - [ ] E2E tests pass
  - [ ] Cache invalidation verified (paths/tags revalidated correctly)

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting to pass session parameter

```typescript
// ❌ Bad: backend query reads global context
export async function getUserOrders(userId: string) {
  const session = await getSession();  // ❌ Where does this come from?
  // ...
}

// ✅ Good: explicit parameter
export async function getUserOrders(userId: string) {
  // userId passed as parameter from app-layer
  return repositories.orders.getByUserId(userId);
}
```

### ❌ Pitfall 2: Hardcoding cache paths in app-layer (violates DRY)

```typescript
// ❌ Bad: duplicated cache paths
export async function updateOrderStatusAction(id: number, input: any) {
  await updateOrderStatus(id, input);
  revalidatePath("/admin/orders");  // ❌ Hardcoded
  revalidatePath(`/admin/orders/${id}`);  // ❌ Duplicated logic
}

// ✅ Good: backend provides cache paths
export async function updateOrderStatusAction(id: number, input: any) {
  const result = await updateOrderStatus(id, input);
  result.cache?.paths?.forEach(path => revalidatePath(path));  // ✅ DRY
}
```

### ❌ Pitfall 3: Not throwing typed errors

```typescript
// ❌ Bad: generic error
if (!user) {
  throw new Error("User not found");  // ❌ App-layer can't handle specifically
}

// ✅ Good: typed domain error
if (!user) {
  throw new ResourceNotFoundError("User", userId);  // ✅ App-layer knows to call notFound()
}
```

### ❌ Pitfall 4: Leaving "use server" in backend files

```typescript
// ❌ Bad: backend file with "use server"
"use server";  // ❌ Server Actions belong in app-layer, not backend
export async function updateOrder() { }

// ✅ Good: backend exports pure function
export async function updateOrder() { }  // ✅ No directive

// ✅ App-layer wraps with "use server"
"use server";
export async function updateOrderAction() {
  return updateOrder(...);
}
```

---

## Summary

Follow these 5 patterns for migration:

1. **Cache Revalidation**: Backend returns paths/tags as data → app-layer executes `revalidatePath`
2. **Redirects**: Backend throws `NotAuthenticatedError` → app-layer calls `redirect()`
3. **Query Caching**: Backend exports pure function + cache config → app-layer wraps with `"use cache"`
4. **Session Access**: App-layer extracts session → passes to backend as parameter
5. **React Hooks**: Move from backend to app-layer (hooks are UI concerns)

Each pattern maintains backward compatibility while achieving framework independence.
