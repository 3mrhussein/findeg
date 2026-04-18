# Implementation Plan: Next.js 16 Cache Components Migration

**Feature**: 006-nextjs16-cache-components  
**Parent Spec**: 005-decouple-app-infrastructure  
**Priority**: P0 BLOCKING  
**Estimated Duration**: 8-10 days  
**Status**: Ready for Implementation

---

## Executive Summary

This plan outlines the migration from Service Container pattern to Next.js 16 Cache Components ("use cache" directive) across the dashboard and storefront packages. The migration unblocks dashboard builds (102 Turbopack errors) while enabling modern caching patterns with PPR (Partial Prerendering), instant navigation, and explicit cache management.

**Core Strategy**: Backend exports pure TypeScript service factories (NO Next.js dependencies), apps create data layer at `src/data/{feature}/` with "use cache" queries and "use server" actions that wrap backend service calls, components use Suspense for progressive loading.

---

## Pre-Implementation Checklist

### Environment Setup

- [x] Next.js 16.2.2 installed (verified in package.json)
- [x] `cacheComponents: true` in next.config.ts (verified)
- [x] TypeScript 5.7+ installed
- [x] Turbopack enabled by default
- [x] Backend exports path configured in tsconfig.json

### Knowledge Prerequisites

- [ ] Team trained on "use cache" directive
- [ ] Team understands PPR architecture
- [ ] Team familiar with cache invalidation APIs (updateTag vs revalidateTag)
- [ ] Team reviewed research.md (Next.js 16 features)

### Documentation Review

- [ ] Read: `research.md` (Next.js 16 features deep-dive)
- [ ] Read: Original spec `spec.md` (requirements)
- [ ] Review: `docs/architecture/BACKEND_MIGRATION_PATTERNS.md`
- [ ] Review: Backend Clean Architecture rules

---

## Phase 1: Backend Use Case Refactoring (Days 1-2)

**Goal**: Ensure backend exports framework-agnostic use cases and services (NO Next.js dependencies)

**Architecture Principle**: Backend stays pure TypeScript, apps implement Next.js-specific caching layer

### 1.1 Verify Backend Exports (Framework-Agnostic)

**What Backend SHOULD Export**:

- ✅ Domain types (Product, Order, Category, etc.)
- ✅ Repository interfaces (IProductRepository, etc.)
- ✅ Use case classes (ProductService, OrderService, etc.)
- ✅ DTOs and input types (CreateProductInput, etc.)

**What Backend MUST NOT Export**:

- ❌ "use cache" functions (Next.js-specific - these belong in app data layer)
- ❌ "use server" actions (Next.js-specific - these belong in app data layer)
- ❌ ServiceContainer (infrastructure)
- ❌ Any imports from 'next/cache' or Next.js modules

**Verify Current Exports**:

```bash
# Check catalog feature exports
cat packages/backend/src/features/catalog/index.ts

# Expected: domain types, interfaces, services (NOT container, NOT cache functions)
```

### 1.2 Ensure Service Classes Are Exported (Backend)

Backend should export **service classes** that apps can instantiate and call.

**File**: `packages/backend/src/features/catalog/application/services/ProductService.ts`

This should already exist. Verify it's exported:

```typescript
// packages/backend/src/features/catalog/index.ts
export { ProductService } from "./application/services/ProductService";
export { CategoryService } from "./application/services/CategoryService";
export { BrandService } from "./application/services/BrandService";
```

**Service Interface** (Example):

```typescript
// This should already exist in backend
export class ProductService {
  constructor(private repository: IProductRepository) {}

  async getAll(locale: string, filters?: ProductFilters): Promise<Product[]> {
    return await this.repository.findAll(locale, filters);
  }

  async getById(id: string, locale: string): Promise<ProductWithRelations | null> {
    return await this.repository.findByIdWithRelations(id, locale);
  }

  async create(input: CreateProductInput): Promise<Product> {
    // Domain logic, validation
    return await this.repository.create(input);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    // Domain logic, validation
    return await this.repository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return await this.repository.delete(id);
  }
}
```

**Key Point**: These are **pure TypeScript** - no Next.js dependencies!

**File**: `packages/backend/src/features/catalog/application/queries/category-queries.ts`

````typescript
"use cache"
import { cacheLife, cacheTag } from 'next/cache';
import type { Category, CategoryWithProducts } from '../../domain';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { DrizzleConnection } from '@backend/features/core/infrastructure/database/connection';

/**
 * Get all categories (stable data, cache aggressively)
 * Cache: 24hr server, 1hr client
 */
export async function getCategories(locale: string): Promise<Category[]> {
  cacheTag('categories');
  cacheTag(`categories-${locale}`);
  cacheLife('days');

  const db = DrizzleConnection.getInstance();
  const repository = new CategoryRepository(db);

  return await repository.findAll(locale);
}

/**
 * Get category by ID with products
 * Cache: 1hr server, 10min client
 */
export async function getCategoryById(
  id: string,
  locale: string
): Promise<CategoryWithProducts | null> {
  cacheTag('categories');
  cacheTag(`category-${id}`);
  cacheTag(`categories-${locale}`);
  cacheLife('hours');

  const db = DrizzleConnection.getInstance();
  const repository = new CategoryRepository(db);

  return await repository.findByIdWithProducts(id, locale);
### 1.3 Create Service Factory (Backend)

To avoid apps directly accessing infrastructure, create a factory that returns service instances.

**File**: `packages/backend/src/features/catalog/application/services/factory.ts`

```typescript
import { ProductService } from './ProductService';
import { CategoryService } from './CategoryService';
import { BrandService } from './BrandService';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { BrandRepository } from '../../infrastructure/repositories/BrandRepository';
import { DrizzleConnection } from '@backend/features/core/infrastructure/database/connection';

/**
 * Factory to create catalog services
 * Apps can call this to get service instances without touching infrastructure
 */
export function createCatalogServices() {
  const db = DrizzleConnection.getInstance();

  return {
    products: new ProductService(new ProductRepository(db)),
    categories: new CategoryService(new CategoryRepository(db)),
    brands: new BrandService(new BrandRepository(db)),
  };
}
````

**Export from feature**:

```typescript
// packages/backend/src/features/catalog/index.ts
export { createCatalogServices } from "./application/services/factory";
export { ProductService, CategoryService, BrandService } from "./application/services";
```

**Key Benefit**: Apps can get services without importing infrastructure!onst repository = new ProductRepository(db);
const service = new ProductService(repository);

const product = await service.update(id, input);

// Invalidate caches
updateTag(`product-${id}`);
updateTag('products');
if (input.locale) {
updateTag(`products-${input.locale}`);
}

return product;
}

/\*\*

- Delete product
- Invalidates all product caches
  \*/
  export async function deleteProduct(id: string): Promise<void> {
  const db = DrizzleConnection.getInstance();
  const repository = new ProductRepository(db);
  const service = new ProductService(repository);

await service.delete(id);

// Invalidate caches
updateTag(`product-${id}`);
updateTag('products');
}

/\*\*

- Toggle product active status
- Quick update with targeted invalidation
  \*/
  export async function toggleProductStatus(id: string): Promise<Product> {
  cons4 Remove Container Export (Already Done in Spec 005)

**File**: `packages/backend/src/features/core/index.ts`

Verify `ServiceContainer` is NOT exported:

```typescript
// ❌ SHOULD NOT BE PRESENT:
// export { ServiceContainer } from './infrastructure/di/ServiceContainer';

// ✅ Should have deprecation comment (already added in spec 005)
```

### 1.5 Backend Build & Validation

**Commands**:

```bash
# Type-check
pnpm --filter @backend type-check

# Build
pnpm --filter @backend build

# Verify exports (should see services, NOT cache functions)
cat packages/backend/package.json | jq '.exports'
```

**Success Criteria**:

- ✅ Type-check passes (0 errors)
- ✅ Build succeeds
- ✅ Exports include service factories
- ✅ No "use cache" in backend code
- ✅ No "use server" in backend code
- ✅ No next/cache imports in backend
- ✅ Backend stays pure TypeScriptPromise<void> {
  const db = DrizzleConnection.getInstance();
  const repository = new OrderRepository(db);
  const service = new OrderService(repository);
  await service.updateStatus(id, status);
  // Immediate invalidation for admin read-your-writes
  updateTag(`order-${id}`);
  updateTag('orders');
  updateTag('recent-orders');
  }

/\*\*

- Cancel order
  \*/
  export async function cancelOrder(id: string): Promise<void> {
  const db = DrizzleConnection.getInstance();
  const repository = new OrderRepository(db);
  const service = new OrderService(repository);

await service.cancel(id);

updateTag(`order-${id}`);
updateTag('orders');
}

````

**Export and index**:

**File**: `packages/backend/src/features/order/application/queries/index.ts`

```typescript
export { getOrders, getOrderById, getRecentOrders } from './order-queries';
````

**File**: `packages/backend/src/features/order/application/actions/index.ts`

```typescript
export { updateOrderStatus, cancelOrder } from "./order-actions";
```

**File**: `packages/backend/src/features/order/index.ts`

```typescript
// ... existing exports ...

// Application layer
export * from "./application/queries";
export * from "./application/actions";
```

### 1.5 Identity Queries (Dashboard Data)

**File**: `packages/backend/src/features/identity/application/queries/admin-queries.ts`

````typescript
"use cache"
import { cacheLife, cacheTag } from 'next/cache';
import type { AdminUser, DashboardData } from '../../domain';
import { AdminUserRepository } from '../../infrastructure/repositories/AdminUserRepository';
import { DrizzleConnection } from '@backend/features/core/infrastructure/database/connection';

/**
 * Get dashboard data for admin
 * Cache: 5min server, 1min client (fast-changing stats)
 */
export async function getDashboardData(
  adminId: string,
  locale: string
): Promise<DashboardData> {
  cacheTag('dashboard');
  cacheTag(`dashboard-${adminId}`);
  cacheLife('minutes');

  const db = DrizzleConnection.getInstance();
  const repository = new AdminUserRepository(db);

  return await repository.getDashboardData(adminId, locale);
}

/**
 * Get admin user profile
 * Cache: 1hr server, 10min client
 */
export async function getAdminProfile(adminId: string): Promise<AdminUser | null> {
---

## Phase 2: Dashboard Data Layer (Days 2-4)

**Goal**: Create Next.js-specific data layer in dashboard app (queries with "use cache", actions with "use server")

**Architecture**: Dashboard implements its own data fetching layer that calls backend services

### 2.1 Create Dashboard Data Layer Structure

**Directory Structure**:
```bash
packages/dashboard/src/
├── data/
│   ├── products/
│   │   ├── queries.ts      # "use cache" functions
│   │   └── actions.ts      # "use server" functions
│   ├── categories/
│   │   ├── queries.ts
│   │   └── actions.ts
│   ├── orders/
│   │   ├── queries.ts
│   │   └── actions.ts
│   └── dashboard/
│       └── queries.ts
└── lib/
    └── backend.ts          # Backend service factory helper
````

### 2.2 Backend Service Helper (Dashboard)

**File**: `packages/dashboard/src/lib/backend.ts`

```typescript
import { createCatalogServices } from "@backend/features/catalog";
import { createOrderServices } from "@backend/features/order";
import { createIdentityServices } from "@backend/features/identity";

/**
 * Get backend services (cached instance per request)
 * This is the ONLY place dashboard touches backend infrastructure
 */
export function getBackendServices() {
  return {
    catalog: createCatalogServices(),
    orders: createOrderServices(),
    identity: createIdentityServices(),
  };
}
```

### 2.3 Product Queries (Dashboard)

**File**: `packages/dashboard/src/data/products/queries.ts`

```typescript
"use cache";
import { cacheLife, cacheTag } from "next/cache";
import { getBackendServices } from "@lib/backend";
import type { Product, ProductFilters } from "@backend/features/catalog";

/**
 * Get all products (admin dashboard)
 * Cache strategy: 30min server, 10min client
 */
export async function getProducts(locale: string, filters?: ProductFilters): Promise<Product[]> {
  cacheTag("products");
  cacheTag(`products-${locale}`);
  cacheLife("products"); // Custom profile from next.config.ts

  const { catalog } = getBackendServices();
  return await catalog.products.getAll(locale, filters);
}

/**
 * Get product by ID with relations
 * Cache strategy: 1hr server, 5min client
 */
export async function getProductById(id: string, locale: string): Promise<Product | null> {
  cacheTag("products");
  cacheTag(`product-${id}`);
  cacheTag(`products-${locale}`);
  cacheLife("products");

  const { catalog } = getBackendServices();
  return await catalog.products.getById(id, locale);
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  locale: string,
  filters?: ProductFilters,
): Promise<Product[]> {
  cacheTag("products");
  cacheTag(`products-${locale}`);
  cacheTag("search-results");
  cacheLife("minutes");

  const { catalog } = getBackendServices();
  return await catalog.products.search(query, locale, filters);
}
```

### 2.4 Product Actions (Dashboard)

**File**: `packages/dashboard/src/data/products/actions.ts`

````typescript
"use server";
import { updateTag } from "next/cache";
import { getBackendServices } from "@lib/backend";
import type { CreateProductInput, UpdateProductInput } from "@backend/features/catalog";

/**
 * Create product (admin action)
 * Invalidates product caches after creation
---

## Phase 3: Dashboard Pages Migration (Days 3-5)

**Goal**: Update pages to use dashboard data layer (queries/actions from `src/data/*`)

### 3t { updateTag } from 'next/cache';
import { getBackendServices } from '@lib/backend';
import type { OrderStatus } from '@backend/features/order';

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { orders } = getBackendServices();
  await orders.updateStatus(id, status);
  
  up3.2 Remove getServices() Helper

**File**: `packages/dashboard/src/server/getServices.ts`

**Delete entire file** or replace with error:

```typescript
/**
 * @deprecated getServices() is no longer supported.
 * 
 * Migration: Use cacheable queries from dashboard data layer
 * 
 * Before:
 *   const { products } = getServices();
 *   const data = await products.getAll('en');
 * 
 * After:
 *   import { getProducts } from '@data/products/queries';
 *   const data = await getProducts('en');
 * 
 * Cache & mutations handled automatically via "use cache" and "use server"
 */
export function getServices(): never {
  throw new Error("getServices() is deprecated. Use queries/actions from @data/*");
}
````

### 3

    return config;

},
};

export default nextConfig;

````

### 2.2 Remove getServices() Helper

**File**: `packages/dashboard/src/server/getServices.ts`

**Delete entire file** or replace with error:

```typescript
/**
 * @deprecated getServices() is no longer supported in Next.js 16.
 *
 * ServiceContainer cannot be exported from backend package due to
 * Turbopack bundling limitations (infrastructure with Node.js dependencies).
 *
 * Migration: Import functions directly from backend features
 *
 * Before:
 *   const { products } = getServices();
 *   const data = await products.getAll('en');
 *
 * After:
 *   import { getProducts } from '@backend/features/catalog';
 *   const data = await getProducts('en');
 *
 * See: specs/006-nextjs16-cache-components/quickstart.md
 */
export function getServices(): never {
  throw new Error(
    'getServices() is deprecated. Use direct imports from @backend/features/*'
  );
}
````

### 2.3 Migrate Dashboard Home Page

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/page.tsx`

**Before**:

```typescript
import { ServiceContainer } from '@backend/features/core';
import { requireAdmin } from '@lib/session';

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  const session = await requireAdmin(locale);

  const dashboardService = ServiceContainer.getInstance().adminDashboardService;
  const auditLogService = ServiceContainer.getInstance().auditLogService;

  const [dashboardData, recentLogs] = await Promise.all([
    dashboardService.getDashboardData(session.adminId!, locale),
    auditLogService.getRecentLogs(10),
  ]);

  return (
    <PageShell>
      <DashboardStats data={dashboardData.stats} />
      <RecentProducts products={dashboardData.products} />
      <RecentOrders orders={dashboardData.orders} />
      <AuditLog logs={recentLogs} />
    </PageShell>
  );
}
```

**After**:

```typescript
import { requireAdmin } from '@lib/session';
import { Suspense } from 'react';
import {
  DashboardStats,
  RecentProducts,
  RecentOrders,
  RecentSchoolLists,
  AuditLog,
} from './_components';
import {
  DashboardStatsSkeleton,
  RecentProductsSkeleton,
  RecentOrdersSkeleton,
  RecentSchoolListsSkeleton,
  AuditLogSkeleton,
} from '@components/skeletons';

export default async function AdminDashboardPage({ params }) {
  const { locale } = await params;

  // Verify auth (not cached)
  await requireAdmin(locale);

  // Static shell with streaming widgets
  return (
    <PageShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Stats cards - fast data */}
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats locale={locale} />
        </Suspense>

        {/* Grid of widgets - parallel streaming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<RecentProductsSkeleton />}>
            <RecentProducts locale={locale} />
          </Suspense>

          <Suspense fallback={<RecentOrdersSkeleton />}>
            <RecentOrders />
          </Suspense>

          <Suspense fallback={<RecentSchoolListsSkeleton />}>
            <RecentSchoolLists locale={locale} />
          </Suspense>

          <Suspense fallback={<AuditLogSkeleton />}>
            <AuditLog />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
```

**Create Widget Components**:

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/_components/DashboardStats.tsx`

```typescript
import { getDashboardStats } from '@backend/features/administration';
import { requireAdmin } from '@lib/session';
import { StatsCard } from '@components/stats/StatsCard';

export async function DashboardStats({ locale }: { locale: string }) {
  const session = await requireAdmin(locale);
  const stats = await getDashboardStats(session.adminId, locale);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total Products"
        value={stats.totalProducts}
        icon="package"
        trend={stats.productTrend}
      />
      <StatsCard
        title="Total Orders"
        value={stats.totalOrders}
        icon="shopping-cart"
        trend={stats.orderTrend}
      />
      <StatsCard
        title="Revenue"
        value={`${stats.revenue} EGP`}
        icon="dollar-sign"
        trend={stats.revenueTrend}
      />
      <StatsCard
        title="School Lists"
        value={stats.totalSchoolLists}
        icon="list"
      />
    </div>
  );
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/_components/RecentProducts.tsx`

```typescript
import { getProducts } from '@backend/features/catalog';
import { ProductRow } from '@components/products/ProductRow';

export async function RecentProducts({ locale }: { locale: string }) {
  // Fetch only 5 most recent products
  const products = await getProducts(locale, { limit: 5, sortBy: 'createdAt' });

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
      <div className="space-y-2">
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/_components/RecentOrders.tsx`

```typescript
import { getRecentOrders } from '@backend/features/order';
import { OrderRow } from '@components/orders/OrderRow';

export async function RecentOrders() {
  const orders = await getRecentOrders(5);

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
      <div className="space-y-2">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
```

**Export components**:

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/_components/index.ts`

```typescript
export { DashboardStats } from "./DashboardStats";
export { RecentProducts } from "./RecentProducts";
export { RecentOrders } from "./RecentOrders";
export { RecentSchoolLists } from "./RecentSchoolLists";
export { AuditLog } from "./AuditLog";
```

### 2.4 Create Skeleton Components

**File**: `packages/dashboard/src/components/skeletons/DashboardStatsSkeleton.tsx`

```typescript
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>/data/dashboard/queries';
import { requireAdmin } from '@lib/session';
import { StatsCard } from '@components/stats/StatsCard';

export async function DashboardStats({ locale }: { locale: string }) {
  const session = await requireAdmin(locale);
  const stats = await getDashboardStats(session.adminId, locale);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total Products"
        value={stats.totalProducts}
        icon="package"
        trend={stats.productTrend}
      />
      <StatsCard
        title="Total Orders"
        value={stats.totalOrders}
        icon="shopping-cart"
        trend={stats.orderTrend}
      />
      <StatsCard
        title="Revenue"
        value={`${stats.revenue} EGP`}
        icon="dollar-sign"
        trend={stats.revenueTrend}
      />
      <StatsCard
        title="School Lists"
        value={stats.totalSchoolLists}
        icon="list"
      />
    </div>
  );
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/_components/RecentProducts.tsx`

```typescript
import { getProducts } from '@data/products/queries';
import { ProductRow } from '@components/products/ProductRow';

export async function RecentProducts({ locale }: { locale: string }) {
  // Uses cached query from dashboard data layer
  const products = await getProducts(locale, { limit: 5, sortBy: 'createdAt' });

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
      <div className="space-y-2">
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/_components/RecentOrders.tsx`

```typescript
import { getOrders } from '@data/orders/queries';
import { OrderRow } from '@components/orders/OrderRow';

export async function RecentOrders() {
  // Uses cached query from dashboard data layer
  const orders = await getOrders({ limit: 5, sortBy: 'createdAt' }
    <PageShell>
      <ProductFilters categories={categories} brands={brands} filters={filters} />
      <ProductGrid products={productList} />
    </PageShell>
  );
}
```

**After**:

```typescript
import { Suspense } from 'react';
import { ProductFilters, ProductResults } from './_components';
import { ProductListSkeleton } from '@components/skeletons';

export default function ProductsPage() {
  // Static shell (cached)
  return (
    <PageShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Products</h1>

        {/* Filters cached (categories/brands stable) */}
        <Suspense fallback={<div>Loading filters...</div>}>
          <ProductFilters />
        </Suspense>

        {/* Results dynamic (based on search params) */}
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductResults />
        </Suspense>
      </div>
    </PageShell>
  );
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/_components/ProductFilters.tsx`

```typescript
import { getCategories, getBrands } from '@backend/features/catalog';
import { FilterUI } from './FilterUI';

export async function ProductFilters() {
  // Fetch stable data (categories, brands)
  const [categories, brands] = await Promise.all([
    getCategories('en'),
    getBrands('en'),
  ]);

  return <FilterUI categories={categories} brands={brands} />;
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/_components/ProductResults.tsx`

```typescript
import { getProducts } from '@backend/features/catalog';
import { ProductGrid } from '@components/products/ProductGrid';

type SearchParams = {
  category?: string;
  brand?: string;
  search?: string;
};

export async function ProductResults({ searchParams }: { searchParams: SearchParams }) {
  const filters = {
    categoryId: searchParams.category,
    brandId: searchParams.brand,
    search: searchParams.search,
  };

  const products = await getProducts('en', filters);

  return <ProductGrid products={products} />;
}
```

### 2.6 Migrate Product Detail Page

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/[id]/page.tsx`

\*\*Af3.4 Migrate Product List Page

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/page.tsx`

**After** (using dashboard data layer):

```typescript
import { Suspense } from 'react';
import { ProductFilters, ProductResults } from './_components';
import { ProductListSkeleton } from '@components/skeletons';

export default function ProductsPage() {
  // Static shell (cached)
  return (
    <PageShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Products</h1>

        {/* Filters cached (categories/brands stable) */}
        <Suspense fallback={<div>Loading filters...</div>}>
          <ProductFilters />
        </Suspense>

        {/* Results dynamic (based on search params) */}
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductResults />
        </Suspense>
      </div>
    </PageShell>
  );
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/_components/ProductFilters.tsx`

```typescript
import { getCategories, getBrands } from '@data/categories/queries';
import { FilterUI } from './FilterUI';

export async function ProductFilters() {
  // Uses cached queries from dashboard data layer
  const [categories, brands] = await Promise.all([
    getCategories('en'),
    getBrands('en'),
  ]);

  return <FilterUI categories={categories} brands={brands} />;
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/_components/ProductResults.tsx`

```typescript
import { getProducts } from '@data/products/queries';
import { ProductGrid } from '@components/products/ProductGrid';

type SearchParams = {
  category?: string;
  brand?: string;
  search?: string;
};

export async function ProductResults({ searchParams }: { searchParams: SearchParams }) {
  const filters = {
    categoryId: searchParams.category,
    brandId: searchParams.brand,
    search: searchParams.search,
  };

  // Uses cached query from dashboard data layer
  const products = await getProducts('en', filters);

  return <ProductGrid products={products} />;
}
```

### 3.5 Migrate Product Detail Page

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/[id]/page.tsx`

**After**:

```typescript
import { getProductById } from '@data/products/queries';
import { ProductForm } from '../../_components/ProductForm';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  // Uses cached query from dashboard data layer
  const product = await getProductById(id, 'en');

  if (!product) {
    notFound();
  }

  return (
    <PageShell>
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </PageShell>
  );
}
```

### 3.6 Update Form Server Actions

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/actions.ts`

```typescript
"use server"
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '@data/products/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { CreateProductInput, UpdateProductInput } from '@backend/features/catalog';

export async function createProductAction(input: CreateProductInput) {
  // Dashboard action calls dashboard data layer (which calls backend)
  // Cache invalidation happens in data layer action
  const result = await createProduct(input);

  // Revalidate path for UI refresh
  revalidatePath('/admin/products');

  redirect(`/admin/products/${result.product.id}`);
}

export async function updateProductAction(id: string, input: UpdateProductInput) {
  await updateProduct(id, input);

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);

  return { success: true };
}
4: Remaining Pages Migration (Days 5-6)
4.1 Categories Page

Similar pattern to products:
- Static shell with Suspense
- Import from `@data/categories/queries` and `@data/categories/actions`
- Server Actions for create/update/delete

### 4.2 Brands Page

Same pattern as categories, using `@data/brands/*`

### 4.3 School Lists Page

Lower priority, same pattern using `@data/school-lists/*`

### 4t { Suspense } from 'react';
import { OrderList } from './_components/OrderList';
import { OrderListSkeleton } from '@components/skeletons';

export default function OrdersPage() {
  return (
    <PageShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orders</h1>

        <Suspense fallback={<OrderListSkeleton />}>
          <OrderList />
        </Suspense>
      </div>
    </PageShell>
  );
}
```

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/orders/_components/OrderList.tsx`

```typescript
import { getOrders } from '@data/orders/queries';
import { OrderRow } from '@components/orders/OrderRow';

export async function OrderList() {
  // Uses cached query from dashboard data layer
  const orders = await getOrders();

  return (
    <div className="border rounded-lg">
      <div className="divide-y">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
```

### 3.8 Prefetch Links

5
Add prefetching to dashboard navigation:

````typescript
<Link href="/admin/products" prefetch={true}>
  Pr5.1 Cache Tuning

Review cache hit rates and adjust lifetimes in dashboard data layer:

```typescript
// Example: Adjust cache lifetime in queries based on data
// packages/dashboard/src/data/products/queries.ts
cacheLife('products'); // Uses profile from next.config.ts

// If hit rate > 90%, consider longer TTL
// If stale data issues, consider shorter TTL
````

### 5.2 Prefetch Links

Add prefetching to dashboard navigation:

```typescript
<Link href="/admin/products" prefetch={true}>
  Products
</Link>
```

### 5.3 Bundle Analysis

````bash
pnpm --filter @dashboard build --analyze
**Architecture for Storefront**:
1. Create `packages/storefront/src/data/*` (queries/actions)
2. Import from same backend service factories
3. Add Suspense boundaries for product pages
4. Use "use cache" for public product listings

**Priority**: **HIGH** (Immediate implementation required for monorepo consistency)

---

## Phase 7th transitions (CSS or View Transitions)
- Test on slow 3G network (Chrome DevTools)

---

## P7.1 E2E Tests

**Test Scenarios**:
1. **Cache Invalidation**: Create product → Verify product list updated
2. **Read-Your-Writes**: Update order status → Verify order detail reflects change
3. **PPR**: Verify static shell renders < 100ms
4. **Navigation**: Prefetch links → Verify instant navigation

**File**: `packages/dashboard/cypress/e2e/cache-invalidation.cy.ts`

```typescript
describe('Cache Invalidation', () => {
  it('should update product list after creating product', () => {
    cy.login('admin@findeg.com');
    cy.visit('/admin/products');

    // Verify initial count
    cy.get('[data-testid="product-row"]').should('have.length', 10);

    // Create new product (calls dashboard action → backend service)
    cy.get('[data-testid="create-product-btn"]').click();
    cy.get('[name="title"]').type('Test Product');
    cy.get('[name="price"]').type('100');
    cy.get('[type="submit"]').click();

    // Verify product appears in list (cache invalidated)
    cy.visit('/admin/products');
    cy.get('[data-testid="product-row"]').should('have.length', 11);
    cy.contains('Test Product').should('be.visible');
  });
});
````

### 7 < 2.0s

- Bundle size < 200KB (initial)

**Tools**:

- Lighthouse CI
- WebPageTest
- Vercel Analytics

### 6.3 Documentation

**Update Files**:

- `specs/006-nextjs16-cache-components/quickstart.md` ✅ (already created)
- `docs/architecture/BACKEND_MIGRATION_PATTERNS.md` (add "use cache" pattern)
- `p7.3 Documentation

**Update Files**:

- `specs/006-nextjs16-cache-components/quickstart.md` ✅ (already created)
- `docs/architecture/BACKEND_MIGRATION_PATTERNS.md` (add data layer pattern)
- `packages/dashboard/README.md` (update data fetching guide)
- Add ADR (Architecture Decision Record) for "Why data layer in apps, not backend"

**Create Video Walkthrough**:

- Record 5-10min video showing:
  1. How to create cacheable query in dashboard data layer
  2. How to call backend service from query
  3. How to use updateTag() in dashboard action
  4. How to add Suspense boundary
  5. How to debug cache with NEXT_PRIVATE_DEBUG_CACHE=1

### 7che invalidation APIs (updateTag vs revalidateTag) (20min)

4. Architecture overview: Why data layer in apps? (15min)
5. "use cache" directive in dashboard queries (30min)
6. "use server" actions calling backend services (20min)
7. PPR architecture with Suspense (30min)
8. Cache invalidation APIs (updateTag vs revalidateTag) (20min)
9. Debugging cache behavior (10min)
10. Q&A (25

## Success Metrics

### Build Success (P0 BLOCKING)

- [ ] Dashboard builds without errors
- [ ] Backend builds without errors
- [ ] Storefront builds without errors
- [ ] No Turbopack errors for Node.js modules
- [ ] Bundle analysis shows no postgres/drizzle in client

### Performance (P1)

- [ ] Dashboard home FCP < 1.0s
- [ ] Product list LCP < 1.5s
- [ ] Navigation between pages < 200ms (prefetched)
- [ ] Cache hit rate > 80% for product data

### Code Quality (P1)

- [ ] All pages use direct backend imports (no getServices)
- [ ] All queries have "use cache"
- [ ] All actions have "use server"
- [ ] All Suspense boundaries have skeletons
- [ ] updateTag() used for admin actions

### Documentation (P2)

- [ ] Quickstart guide complete
- [ ] Migration patterns documented
- [ ] Video walkthrough recorded
- [ ] Team trained on new patterns

---

## Rollback Plan

If critical issues discovered during migration:

### Immediate Rollback

```bash
git revert <migration-commit>
pnpm install
pnpm build
```

### Partial Rollback

Keep backend changes, revert dashboard:

```bash
cd packages/dashboard
git checkout main -- src/
pnpm install
```

### Webpack Fallback

If Turbopack issues persist:

```bash
next build --webpack
```

---

## Risk Mitigation

### Risk 1: Cache Invalidation Bugs

**Mitigation**: Extensive E2E tests for read-your-writes scenarios

### Risk 2: Performance Regression

**Mitigation**: Lighthouse CI in PR checks, compare before/after metrics

### Risk 3: Team Unfamiliarity

**Mitigation**: Comprehensive documentation, video walkthrough, paired programming

### Risk 4: Turbopack Bugs

**Mitigation**: Webpack fallback flag, report issues to Next.js team

---

## Post-Implementation

### Week 1 After Deployment

- Monitor cache hit rates
- Track build times
- Gather user feedback on perceived performance
- Identify pages for further optimization

### Week 2-4

- Optimize cache lifetimes based on data
- Add more granular cache tags
- Implement advanced PPR patterns
- Complete storefront migration

### Long-Term

- Adopt View Transitions for smoother navigation
- Implement Activity components for tab state persistence
- Explore advanced caching strategies (stale-while-revalidate patterns)

---

**Plan Status**: Ready for Execution  
**Estimated Completion**: 8-10 days  
**Team Capacity Required**: 1 senior engineer full-time  
**Dependencies**: Backend exports (Phase 1) must complete before dashboard migration (Phase 2)
