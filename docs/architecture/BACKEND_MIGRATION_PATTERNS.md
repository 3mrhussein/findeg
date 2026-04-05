# Backend Pure TypeScript Migration Patterns

**Purpose**: Guide for migrating framework-dependent code to pure TypeScript patterns  
**Epic**: `002-backend-pure-typescript`  
**Completed**: April 5, 2026

## Overview

This guide documents the migration patterns used to transform `@findeg/backend` from a Next.js-dependent package to a pure TypeScript library with zero framework dependencies.

**Before Migration**: 21 Next.js imports across 15 files in 6 feature areas  
**After Migration**: Zero framework dependencies, all tests run in pure Node.js

---

## Pattern 1: Cache Invalidation → ServiceResult Metadata

**Problem**: Backend services called `revalidatePath()` and `revalidateTag()` directly, coupling business logic to Next.js framework.

### Before

```typescript
// ❌ Backend service with framework dependency
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createProduct(input: ProductInput) {
  const product = await db.product.create(input);
  
  // Framework coupling - backend calling Next.js API
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${product.id}`);
  revalidateTag('products');
  revalidateTag('shop');
  
  return { success: true, productId: product.id };
}
```

### After

```typescript
// ✅ Backend service returns data + cache metadata
import type { ServiceResult } from '@/features/core/application/types';

export async function createProduct(input: ProductInput): Promise<ServiceResult<{ productId: number }>> {
  const product = await db.product.create(input);
  
  // Pure function - returns cache metadata for app-layer to handle
  return {
    success: true,
    data: { productId: product.id },
    cachePaths: ['/admin/products', `/admin/products/${product.id}`],
    cacheTags: ['products', 'shop']
  };
}
```

```typescript
// ✅ App-layer Server Action handles framework integration
'use server';
import { createProduct } from '@findeg/backend/features/catalog';
import { invalidateCaches } from '@/lib/cache';

export async function createProductAction(input: ProductInput) {
  try {
    const result = await createProduct(input);
    await invalidateCaches(result); // Framework integration happens here
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**Key Benefits**:
- Backend remains pure and testable without Next.js
- App-layer controls cache strategy
- Cache invalidation centralized in helpers

---

## Pattern 2: redirect() → Domain Errors

**Problem**: Backend services called `redirect()` and `notFound()` directly, making them untestable outside Next.js runtime.

### Before

```typescript
// ❌ Backend query with framework dependency
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';

export async function getDashboardData(locale: string) {
  const cookieStore = cookies();
  const session = await getSession(cookieStore);
  
  if (!session?.userId) {
    redirect('/login'); // Framework coupling
  }
  
  const user = await db.user.getById(session.userId);
  if (!user) {
    notFound(); // Framework coupling
  }
  
  return { user };
}
```

### After

```typescript
// ✅ Backend query throws domain errors
import { NotAuthenticatedError, ResourceNotFoundError } from '@/features/core/domain/errors';

export async function getDashboardData(
  locale: string,
  userId: number | null
): Promise<DashboardData> {
  if (!userId) {
    throw new NotAuthenticatedError('Session required to access dashboard');
  }
  
  const user = await db.user.getById(userId);
  if (!user) {
    throw new ResourceNotFoundError('User account not found');
  }
  
  return { user };
}
```

```typescript
// ✅ App-layer translates errors to framework responses
import { getDashboardData } from '@findeg/backend/features/identity';
import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function DashboardPage() {
  const session = await getSession();
  
  try {
    const data = await getDashboardData('en', session?.userId);
    return <Dashboard data={data} />;
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      redirect('/login'); // Framework integration happens here
    }
    if (error instanceof ResourceNotFoundError) {
      notFound(); // Framework integration happens here
    }
    throw error;
  }
}
```

**Key Benefits**:
- Backend throws semantic errors (testable)
- App-layer decides routing behavior
- Error handling centralized in error catalog

---

## Pattern 3: cookies() → Dependency Injection

**Problem**: Backend services read `cookies()` directly from Next.js global context, making them framework-dependent.

### Before

```typescript
// ❌ Backend service with framework dependency
import { cookies } from 'next/headers';

export class CookieSessionProvider {
  async getSession(): Promise<SessionPayload | null> {
    const cookieStore = cookies(); // Framework coupling
    const sessionCookie = cookieStore.get('session');
    // ...
  }
  
  async createSession(payload: SessionPayload): Promise<void> {
    const cookieStore = cookies(); // Framework coupling
    const token = this.jwtManager.sign(payload);
    cookieStore.set('session', token, { httpOnly: true });
  }
}
```

### After

```typescript
// ✅ Backend service accepts injected dependency
export interface ICookieStore {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: any): void;
  delete(name: string): void;
}

export class CookieSessionProvider {
  constructor(private cookieStore: ICookieStore) {} // Dependency injection
  
  async getSession(): Promise<SessionPayload | null> {
    const sessionCookie = this.cookieStore.get('session');
    // Pure logic - works with any ICookieStore implementation
  }
  
  async createSession(payload: SessionPayload): Promise<void> {
    const token = this.jwtManager.sign(payload);
    this.cookieStore.set('session', token, { httpOnly: true });
  }
}
```

```typescript
// ✅ App-layer provides Next.js implementation
import { cookies } from 'next/headers';
import { CookieSessionProvider, ICookieStore } from '@findeg/backend/features/core';

async function nextCookiesToStore(): Promise<ICookieStore> {
  const cookieStore = await cookies();
  return {
    get: (name) => cookieStore.get(name),
    set: (name, value, options) => cookieStore.set(name, value, options),
    delete: (name) => cookieStore.delete(name)
  };
}

export async function getSession() {
  const store = await nextCookiesToStore();
  const provider = new CookieSessionProvider(store);
  return provider.getSession();
}
```

**Key Benefits**:
- Backend testable with mock cookie store
- Multiple implementations possible (Next.js, Express, etc.)
- Framework-agnostic design

---

## Pattern 4: "use cache" Directives → Cache Config Export

**Problem**: Backend queries used Next.js-specific cache directives, making them framework-dependent.

### Before

```typescript
// ❌ Backend query with framework dependency
import { cacheTag, cacheLife } from 'next/cache';

export async function getShopPageData(locale: string) {
  'use cache'; // Framework coupling
  cacheTag('shop'); // Framework coupling
  cacheLife('minutes'); // Framework coupling
  
  const products = await db.product.getAll(locale);
  return { products };
}
```

### After

```typescript
// ✅ Backend exports pure function + cache config
export const SHOP_PAGE_CACHE_CONFIG = {
  tags: ['shop', 'products'],
  revalidate: 60, // seconds
};

export async function getShopPageData(locale: string) {
  // Pure function - no cache directives
  const products = await db.product.getAll(locale);
  return { products };
}
```

```typescript
// ✅ App-layer applies cache config
import { getShopPageData, SHOP_PAGE_CACHE_CONFIG } from '@findeg/backend/features/catalog';
import { cacheTag, cacheLife } from 'next/cache';

export async function getShopPageCached(locale: string) {
  'use cache';
  SHOP_PAGE_CACHE_CONFIG.tags.forEach(tag => cacheTag(tag));
  cacheLife('minutes');
  
  return getShopPageData(locale);
}
```

**Key Benefits**:
- Backend query is pure function
- Cache configuration exportable and reusable
- App-layer controls caching strategy

---

## Pattern 5: Presentation Layer Removal

**Problem**: Backend package contained React hooks, violating Clean Architecture.

### Before

```typescript
// ❌ Backend with React hook (architecture violation)
// packages/backend/src/features/school/presentation/hooks/useSchoolListLookup.ts
import { useRouter, usePathname } from 'next/navigation';

export function useSchoolListLookup() {
  const router = useRouter();
  const pathname = usePathname();
  // ...
}
```

### After

```typescript
// ✅ Hook moved to storefront app (correct location)
// packages/storefront/src/features/school/presentation/hooks/useSchoolListLookup.ts
import { useRouter, usePathname } from 'next/navigation';

export function useSchoolListLookup() {
  const router = useRouter();
  const pathname = usePathname();
  // ...
}
```

**Key Benefits**:
- Backend has no presentation layer
- Clean Architecture restored
- React hooks belong in app-layer, not backend

---

## Domain Error Catalog

All backend services throw typed domain errors:

```typescript
// Core domain errors
import {
  DomainError,              // Base class
  NotAuthenticatedError,    // 401 - session required
  NotAuthorizedError,       // 403 - insufficient permissions
  ResourceNotFoundError,    // 404 - entity not found
  ValidationError,          // 400 - single field validation
  ValidationErrors,         // 400 - multiple field validation
  ConflictError,           // 409 - duplicate/conflict
  BusinessRuleViolationError // 422 - business logic failure
} from '@findeg/backend/features/core/domain/errors';
```

**Error Translation in App-Layer**:

```typescript
import { isDomainError, getErrorMessage } from '@/lib/errors';

export async function someAction() {
  try {
    const result = await backendService();
    await invalidateCaches(result);
    return { success: true };
  } catch (error) {
    if (isDomainError(error)) {
      return { success: false, error: getErrorMessage(error) };
    }
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
```

---

## Testing Patterns

### Backend Tests (Pure Node.js)

```typescript
// ✅ Test runs in Vitest without Next.js
import { describe, it, expect, vi } from 'vitest';
import { createProduct } from '../product';

describe('Product Actions', () => {
  it('returns ServiceResult with cache metadata', async () => {
    const result = await createProduct({ name: 'Test', price: 99.99 });
    
    expect(result.success).toBe(true);
    expect(result.data.productId).toBeDefined();
    expect(result.cachePaths).toContain('/admin/products');
    expect(result.cacheTags).toContain('products');
  });
  
  it('throws ValidationError for invalid input', async () => {
    await expect(createProduct(null as any)).rejects.toThrow(ValidationError);
  });
});
```

### Mock Dependency Injection

```typescript
// ✅ Mock ICookieStore for session tests
import { CookieSessionProvider, ICookieStore } from '../CookieSessionProvider';

const mockCookieStore: ICookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn()
};

describe('CookieSessionProvider', () => {
  it('creates session with injected cookie store', async () => {
    const provider = new CookieSessionProvider(mockCookieStore);
    await provider.createSession({ userId: 1, email: 'test@example.com' });
    
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    );
  });
});
```

---

## Migration Checklist

When migrating a backend file:

- [ ] Remove all `next/cache`, `next/navigation`, `next/headers` imports
- [ ] Replace `revalidatePath/Tag` with `ServiceResult` metadata
- [ ] Replace `redirect/notFound` with domain errors
- [ ] Replace `cookies()` reads with injected parameters
- [ ] Move cache directives to app-layer
- [ ] Add unit tests that run in pure Node.js
- [ ] Create app-layer wrapper (Server Action/query)
- [ ] Update consuming pages/components
- [ ] Verify E2E tests pass

---

## Success Metrics

**Achieved**:
- ✅ Zero Next.js imports in `packages/backend/src` (21 violations eliminated)
- ✅ Zero framework dependencies in `package.json`
- ✅ All tests run in pure Node.js (188/188 passing, 13.15 seconds)
- ✅ Backend type-check passes independently
- ✅ Backend builds without Next.js runtime

**Validation Commands**:
```bash
# Verify zero framework imports
grep -r "from ['\"]next/" packages/backend/src

# Run backend tests (pure Node.js)
pnpm --filter @findeg/backend test

# Type-check backend independently
pnpm --filter @findeg/backend type-check

# Build backend independently
pnpm --filter @findeg/backend build
```

---

## References

- **Epic Spec**: `/specs/002-backend-pure-typescript/spec.md`
- **Implementation Plan**: `/specs/002-backend-pure-typescript/plan.md`
- **Tasks**: `/specs/002-backend-pure-typescript/tasks.md`
- **Backend README**: `/packages/backend/README.md`
- **Constitution Principle VIII**: Backend Packages - Pure TypeScript Libraries

---

**Migration completed**: April 5, 2026  
**All 21 violations eliminated** ✅  
**Backend is production-ready** 🚀
