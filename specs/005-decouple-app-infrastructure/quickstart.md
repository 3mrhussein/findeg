# Quickstart: Clean Architecture Import Rules

**Phase 1 Output** | **Date**: 2026-04-05 | **Plan**: [plan.md](../plan.md)

This quickstart guide helps developers understand and follow the architectural boundary rules when working with the FindEg.com monorepo.

---

## TL;DR (The Golden Rules)

1. **Apps NEVER import from `*/infrastructure/*` paths**
2. **Use `@backend/features/[feature]` for all backend imports**
3. **Backend package.json exports controls what's accessible (only application + presentation layers)**
4. **When in doubt, check if the export exists in `features/[feature]/index.ts`**

---

## Quick Reference Table

| You want to... | Import from | Example |
|----------------|-------------|---------|
| Fetch data in Server Component | `@backend/features/[feature]` | `import { useProducts } from '@backend/features/catalog'` |
| Execute mutation in Server Action | `@backend/features/[feature]` | `import { createProduct } from '@backend/features/catalog'` |
| Use domain types in props | `@backend/features/[feature]` | `import type { Product } from '@backend/features/catalog'` |
| Build custom use case in app | `@backend/features/[feature]` | `import { CreateProductUseCase } from '@backend/features/catalog'` |
| ~~Access database directly~~ | ❌ **NOT ALLOWED** | Use a use case or create one in backend |
| ~~Import a repository~~ | ❌ **NOT ALLOWED** | Use the service container or accept interface in constructor |

---

## For App Developers (Dashboard/Storefront)

### ✅ DO: Import Presentation Layer

```typescript
// packages/dashboard/src/app/products/page.tsx

// ✅ Import hooks, actions, types from backend feature
import { useProducts, createProduct } from '@backend/features/catalog';
import type { Product } from '@backend/features/catalog';

export default async function ProductsPage() {
  const products = await useProducts({ status: 'active' });
  
  return (
    <div>
      {products.map((p: Product) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

**Why**: Presentation layer (hooks, actions, view models) is designed for app consumption.

---

### ❌ DON'T: Import Infrastructure Directly

```typescript
// packages/dashboard/src/app/products/page.tsx

// ❌ FORBIDDEN: Direct repository import
import { DrizzleProductRepository } from '@backend/features/catalog/infrastructure/DrizzleProductRepository';

// ❌ FORBIDDEN: Direct database client import
import { db } from '@backend/features/core/infrastructure/persistence/db';

// ❌ Result: Build error
// Error: Package subpath './features/catalog/infrastructure/...' is not defined by "exports"
```

**Why**: Infrastructure is an internal implementation detail that can change. Apps depend on abstractions.

---

### Creating Custom Server Actions

**Pattern: Use exported use cases**

```typescript
// packages/dashboard/src/app/products/actions.ts
'use server';

import { CreateProductUseCase } from '@backend/features/catalog';
import type { IProductRepository } from '@backend/features/catalog';
import { container } from '@backend/features/core';
import { revalidatePath } from 'next/cache';

export async function createProductWithNotification(formData: FormData) {
  // Get repository from service container (backend manages lifecycle)
  const repo = container.get<IProductRepository>('IProductRepository');
  
  // Use the use case
  const useCase = new CreateProductUseCase(repo);
  const result = await useCase.execute({
    name: formData.get('name') as string,
    // ... other fields
  });
  
  if (result.success) {
    // App-specific logic (Next.js cache invalidation)
    revalidatePath('/products');
    
    // App-specific notification
    await sendNotification('Product created');
  }
  
  return result;
}
```

**Key**: Import use case **class** and repository **interface**, use service container for instances.

---

### Handling Types

```typescript
// packages/dashboard/src/components/ProductCard.tsx

// ✅ Import domain types for props
import type { Product } from '@backend/features/catalog';

interface ProductCardProps {
  product: Product; // Use backend domain type
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  );
}
```

**Tip**: Use `type` imports for interfaces and types to avoid runtime dependencies.

---

## For Backend Developers (Package Maintainers)

### ❌ DON'T: Add server-only to Backend

```typescript
// packages/backend/src/features/catalog/infrastructure/DrizzleProductRepository.ts

// ❌ WRONG - Backend must be framework-agnostic
import 'server-only'; // Violates Constitution Principle VIII

import { db } from '@/features/core/infrastructure/persistence/db';
import type { IProductRepository } from '../application/contracts/IProductRepository';

export class DrizzleProductRepository implements IProductRepository {
  // Implementation
}
```

**Why NOT**: Backend is a pure TypeScript library and must remain framework-agnostic. Adding `server-only` would require installing React/Next.js packages in backend, violating architectural principles.

**Correct approach**: Infrastructure is protected by package.json exports - it's simply not exposed to apps at all.

---

### ✅ DO: Export Through Feature Index

```typescript
// packages/backend/src/features/catalog/index.ts

// ✅ Export presentation layer
export * from './presentation/hooks/useProducts';
export * from './presentation/actions/productActions';

// ✅ Export application layer
export { CreateProductUseCase } from './application/use-cases/CreateProductUseCase';
export type { IProductRepository } from './application/contracts/IProductRepository';

// ✅ Export domain types
export type { Product } from './domain/entities/Product';

// ❌ DO NOT export infrastructure
// NOT: export { DrizzleProductRepository } from './infrastructure/DrizzleProductRepository';
```

**Why**: The feature index is the firewall between internal and external code.

---

### Adding a New Hook for Apps

**Step 1: Create in presentation layer**

```typescript
// packages/backend/src/features/catalog/presentation/hooks/useProductById.ts
// NOTE: No 'server-only' - backend must be framework-agnostic

import { container } from '@/features/core/infrastructure/di/ServiceContainer';
import type { IProductRepository } from '../../application/contracts/IProductRepository';

export async function useProductById(id: string) {
  const repo = container.get<IProductRepository>('IProductRepository');
  return repo.findById(id);
}
```

**Step 2: Export in feature index**

```typescript
// packages/backend/src/features/catalog/index.ts
export { useProductById } from './presentation/hooks/useProductById';
```

**Step 3: Apps can now import**

```typescript
// packages/dashboard/src/app/products/[id]/page.tsx
import { useProductById } from '@backend/features/catalog';

export default async function ProductDetailPage({ params }) {
  const product = await useProductById(params.id);
  // ...
}
```

---

### Adding a New Server Action

**Step 1: Create in presentation layer**

```typescript
// packages/backend/src/features/catalog/presentation/actions/productActions.ts
'use server';

import { container } from '@/features/core/infrastructure/di/ServiceContainer';
import type { IProductRepository } from '../../application/contracts/IProductRepository';
import { UpdateProductUseCase } from '../../application/use-cases/UpdateProductUseCase';

export async function updateProduct(id: string, data: UpdateProductInput) {
  const repo = container.get<IProductRepository>('IProductRepository');
  const useCase = new UpdateProductUseCase(repo);
  return useCase.execute(id, data);
}
```

**Step 2: Export in feature index**

```typescript
// packages/backend/src/features/catalog/index.ts
export { updateProduct } from './presentation/actions/productActions';
```

**Step 3: Apps can now import**

```typescript
// packages/dashboard/src/app/products/[id]/actions.ts
import { updateProduct } from '@backend/features/catalog';

export async function updateProductAction(id: string, formData: FormData) {
  return updateProduct(id, {
    name: formData.get('name') as string,
  });
}
```

---

## Common Mistakes & Fixes

### Mistake 1: Importing from @/features in Apps

```typescript
// ❌ WRONG (uses old path alias)
import { useProducts } from '@/features/catalog';

// ✅ CORRECT (uses package name)
import { useProducts } from '@backend/features/catalog';
```

**Why**: `@/features/*` path alias in apps now only resolves to app-specific features, not backend.

---

### Mistake 2: Trying to Instantiate Repositories

```typescript
// ❌ WRONG (direct instantiation)
import { DrizzleProductRepository } from '@backend/features/catalog';
const repo = new DrizzleProductRepository(); // Can't even import this

// ✅ CORRECT (use service container)
import { container } from '@backend/features/core';
import type { IProductRepository } from '@backend/features/catalog';

const repo = container.get<IProductRepository>('IProductRepository');
```

**Why**: Infrastructure implementations are internal to backend. Apps get instances via the service container.

---

### Mistake 3: Accessing Database Schema in Apps

```typescript
// ❌ WRONG (trying to query directly)
import { products } from '@backend/features/catalog/infrastructure/schema';
await db.select().from(products); // NOT ALLOWED

// ✅ CORRECT (use a hook or create a use case)
import { useProducts } from '@backend/features/catalog';
const productList = await useProducts();
```

**Why**: Apps should never touch the database. Data access goes through the application layer.

---

## Validation Checklist

Before submitting a PR, verify:

- [ ] No imports matching `**/infrastructure/*` in app code
- [ ] All backend imports use `@backend/features/[feature]` format
- [ ] Backend package.json exports only expose application and presentation layers
- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] `npm run build` succeeds (both dashboard and storefront)
- [ ] No "Module not found: Can't resolve 'postgres'" or similar errors

---

## Build Error Guide

### Error: "Package subpath is not defined by exports"

**Cause**: Trying to import a path that's not exported in backend's package.json.

**Fix**: Import from the feature barrel instead:
```typescript
// ❌ This path isn't exported
import { X } from '@backend/features/catalog/infrastructure/something';

// ✅ Import from feature barrel
import { X } from '@backend/features/catalog';
```

**If X isn't exported**: It's internal to backend. Either:
1. Ask backend team to expose it through presentation/application layer
2. Use a different API that's already exposed

---

### Error: "Module not found: Can't resolve 'postgres'" or "Can't resolve 'net/tls/fs'"

**Cause**: Server-only Node.js modules (postgres, drizzle-orm, fs, net, tls) are being bundled in client-side JavaScript.

**Root cause**: A Client Component is  importing Server Code that uses infrastructure.

**Fix**: Check the import chain:
1. Find which Client Component (`'use client'`) imports server code
2. Trace the import path to find where it touches infrastructure
3. Refactor to use Server Components or Server Actions

**Example problematic chain**:
```
ClientComponent.tsx ('use client')
  → imports Server Action from actions.ts
    → Server Action imports useCase
      → useCase imports repository
        → repository imports db (uses postgres)
```

**Solution**: Ensure Client Components never import code that transitively uses infrastructure. Use Server Actions as the boundary.

**Check**:
1. Is `serverExternalPackages` configured in `next.config.ts`? (should be ✅)
2. Is there a Client Component importing server code? (find and fix)
3. Are apps importing from `@backend/features/[feature]` (not infrastructure paths)? (verify)

---

## Getting Help

**Architecture questions**: Check [docs/architecture/ARCHITECTURE_PLAYBOOK.md](../../docs/architecture/ARCHITECTURE_PLAYBOOK.md)

**Export contract**: See [contracts/backend-exports.md](./contracts/backend-exports.md)

**Research details**: See [research.md](./research.md)

**Build issues**: Run diagnostics:
```bash
# Check TypeScript
npm run type-check

# Check build
npm run build

# Check for infrastructure imports
grep -r "infrastructure" packages/dashboard/src packages/storefront/src
```

---

## Summary

**The Three Laws**:
1. Apps import from `@backend/features/[feature]` (never direct infrastructure paths)
2. Backend package.json exports controls the public API (only application + presentation layers exposed)
3. When you need something not exported, ask backend team to expose it properly through the feature's presentation/application layer

**Benefits**:
- ✅ No database code in client bundles
- ✅ Infrastructure can change without breaking apps
- ✅ Clear separation of concerns (Clean Architecture enforced)
- ✅ Build fails fast if boundaries are violated (via TypeScript module resolution)
- ✅ Backend remains framework-agnostic (no React/Next.js dependencies)

**Next steps**: See [../plan.md](../plan.md) for implementation phases and [../tasks.md](../tasks.md) (once generated) for specific implementation tasks.
