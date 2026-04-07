# Backend Export Contract

**Phase 1 Output** | **Date**: 2026-04-05 | **Plan**: [../plan.md](../plan.md)

This contract defines what apps (`@dashboard`, `@storefront`) can import from the `@backend` package, establishing the interface between the backend library and consuming applications.

---

## Contract Overview

The `@backend` package is a **pure TypeScript library** that provides domain logic, use cases, and presentation utilities for FindEg.com features. Apps consume backend functionality through **explicit exports** defined in `package.json`.

### Contractual Boundaries

**Apps MAY import**:
- ✅ Presentation layer: React hooks, Server Actions, view models
- ✅ Application layer: Use case classes, service interfaces, repository interfaces
- ✅ Domain layer: Entity types, value object types, domain errors

**Apps MUST NOT import**:
- ❌ Infrastructure layer: Repository implementations, database clients, external adapters
- ❌ Internal utilities: Private helper functions, internal configuration
- ❌ Database schemas: Drizzle schema definitions, SQL types

---

## Package Exports Specification

### Current Export Structure

```json
{
  "name": "@backend",
  "version": "0.1.0",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./features/core": {
      "types": "./dist/features/core/index.d.ts",
      "default": "./dist/features/core/index.js"
    },
    "./features/identity": {
      "types": "./dist/features/identity/index.d.ts",
      "default": "./dist/features/identity/index.js"
    },
    "./features/catalog": {
      "types": "./dist/features/catalog/index.d.ts",
      "default": "./dist/features/catalog/index.js"
    },
    "./features/cart": {
      "types": "./dist/features/cart/index.d.ts",
      "default": "./dist/features/cart/index.js"
    },
    "./features/order": {
      "types": "./dist/features/order/index.d.ts",
      "default": "./dist/features/order/index.js"
    },
    "./features/review": {
      "types": "./dist/features/review/index.d.ts",
      "default": "./dist/features/review/index.js"
    },
    "./features/media": {
      "types": "./dist/features/media/index.d.ts",
      "default": "./dist/features/media/index.js"
    },
    "./features/school": {
      "types": "./dist/features/school/index.d.ts",
      "default": "./dist/features/school/index.js"
    },
    "./features/notifications": {
      "types": "./dist/features/notifications/index.d.ts",
      "default": "./dist/features/notifications/index.js"
    },
    "./features/administration": {
      "types": "./dist/features/administration/index.d.ts",
      "default": "./dist/features/administration/index.js"
    }
  }
}
```

**Interpretation**: Apps can ONLY import from the paths listed in `exports`. Any attempt to import a non-exported path will fail at TypeScript resolution.

---

## Per-Feature Export Contract

Each feature follows a standard export pattern through its barrel file (`index.ts`).

### Template: Feature Export Pattern

```typescript
// packages/backend/src/features/[feature]/index.ts

// ========================================
// PRESENTATION LAYER EXPORTS (for app UI)
// ========================================

// React Hooks (data fetching, caching)
export * from './presentation/hooks/use[Feature]';
export * from './presentation/hooks/use[Feature]List';

// Server Actions (mutations, form handlers)
export * from './presentation/actions/[feature]Actions';

// View Models (UI-friendly data shapes)
export type { [Feature]ViewModel } from './presentation/mappers/[Feature]ViewModel';

// ========================================
// APPLICATION LAYER EXPORTS (for app logic)
// ========================================

// Use Cases (for custom Server Actions in apps)
export { Create[Feature]UseCase } from './application/use-cases/Create[Feature]UseCase';
export { Update[Feature]UseCase } from './application/use-cases/Update[Feature]UseCase';
export { Delete[Feature]UseCase } from './application/use-cases/Delete[Feature]UseCase';

// Service Interfaces (for dependency injection if needed)
export type { I[Feature]Service } from './application/contracts/I[Feature]Service';

// Repository Interfaces (types only, never implementations)
export type { I[Feature]Repository } from './application/contracts/I[Feature]Repository';

// ========================================
// DOMAIN LAYER EXPORTS (for type safety)
// ========================================

// Entity Types (for function signatures, props)
export type { [Feature] } from './domain/entities/[Feature]';
export type { [Related Entity] } from './domain/entities/[RelatedEntity]';

// Value Object Types
export type { [Feature]Status } from './domain/value-objects/[Feature]Status';

// Domain Errors (for error handling)
export { [Feature]NotFoundError } from './domain/errors/[Feature]NotFoundError';

// ========================================
// NOT EXPORTED (internal to backend)
// ========================================

// ❌ Infrastructure implementations
// NOT: import { Drizzle[Feature]Repository } from './infrastructure/Drizzle[Feature]Repository';

// ❌ Database schemas
// NOT: import { [feature]Table } from './infrastructure/persistence/schema';

// ❌ Internal utilities
// NOT: import { map[Feature]RowToDomain } from './infrastructure/mappers/[feature]Mapper';
```

---

## Import Patterns for Apps

### Pattern 1: Data Fetching (Server Components)

```typescript
// packages/dashboard/src/app/products/page.tsx
import { useProducts } from '@backend/features/catalog';
import type { Product } from '@backend/features/catalog';

export default async function ProductsPage() {
  // Direct use case invocation in Server Component
  const products = await useProducts({ status: 'active' });
  
  return (
    <div>
      {products.map((product: Product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

**Contract**: `useProducts` is a presentation layer hook exported from catalog feature.

---

### Pattern 2: Mutations (Server Actions)

```typescript
// packages/dashboard/src/app/products/actions.ts
'use server';

import { createProduct, updateProduct } from '@backend/features/catalog';
import { revalidatePath } from 'next/cache';

export async function createProductAction(formData: FormData) {
  const result = await createProduct({
    name: formData.get('name') as string,
    // ... other fields
  });
  
  if (result.success) {
    revalidatePath('/products');
  }
  
  return result;
}
```

**Contract**: `createProduct` is a Server Action exported from catalog presentation layer.

---

### Pattern 3: Custom Use Cases (App-Specific Logic)

```typescript
// packages/storefront/src/server/actions/customProductActions.ts
'use server';

import { CreateProductUseCase } from '@backend/features/catalog';
import type { IProductRepository } from '@backend/features/catalog';
import { container } from '@backend/features/core'; // Service container

export async function createProductWithCustomLogic(data: unknown) {
  // Get repository from container (not directly instantiated)
  const repository = container.get<IProductRepository>('IProductRepository');
  
  // Instantiate use case with repository
  const useCase = new CreateProductUseCase(repository);
  
  // Execute custom logic
  if (await hasPermission()) {
    return useCase.execute(data);
  }
  
  throw new Error('Unauthorized');
}
```

**Contract**: Apps can import use case **classes** and repository **interfaces**, but NEVER repository **implementations**.

---

## Validation Rules

### Rule 1: No Infrastructure Imports

**Violation example**:
```typescript
// ❌ FORBIDDEN
import { DrizzleProductRepository } from '@backend/features/catalog/infrastructure/DrizzleProductRepository';
```

**Error**:
```
Package subpath './features/catalog/infrastructure/DrizzleProductRepository' is not defined by "exports" in packages/backend/package.json
```

**Fix**: Use the repository through the service container or accept it as a dependency in a use case.

---

### Rule 2: No Schema Imports

**Violation example**:
```typescript
// ❌ FORBIDDEN
import { products } from '@backend/features/catalog/infrastructure/persistence/schema';
```

**Error**:
```
Package subpath './features/catalog/infrastructure/persistence/schema' is not defined by "exports"
```

**Fix**: Database schemas are internal. Use domain entity types instead.

---

### Rule 3: Type-Only Repository Access

**Correct usage**:
```typescript
// ✅ ALLOWED (type import only)
import type { IProductRepository } from '@backend/features/catalog';

function processProducts(repo: IProductRepository) {
  // Use the interface, never instantiate the implementation
}
```

**Violation**:
```typescript
// ❌ FORBIDDEN (importing implementation class)
import { DrizzleProductRepository } from '@backend/features/catalog';

const repo = new DrizzleProductRepository(); // Can't be instantiated in apps
```

---

## Contract Guarantees

### What Backend Guarantees

1. **Stable Interfaces**: Application layer interfaces (use cases, repository interfaces) won't break without major version bump
2. **Type Safety**: All exported types are TypeScript strict-mode compliant
3. **Infrastructure Protection**: Infrastructure code is not exposed via package.json exports - apps cannot access it
4. **Single Source of Truth**: Domain logic exists only in backend, never duplicated in apps
5. **Framework Agnostic**: Backend remains pure TypeScript library with no React/Next.js dependencies

### What Apps Must Guarantee

1. **No Infrastructure Bypass**: Apps will not attempt to import infrastructure code via path aliases or workarounds
2. **Interface-Only Dependencies**: Apps will depend on repository/service **interfaces**, not implementations
3. **Presentation Layer Usage**: Apps will prefer exported hooks and actions over direct use case invocation when possible
4. **Type Imports**: Apps will use `type` imports for interfaces to avoid runtime dependencies

---

## Breaking Changes Policy

### Non-Breaking Changes (Patch/Minor)

- ✅ Adding new exports to a feature
- ✅ Adding new methods to a Service (with defaults)
- ✅ Adding new optional fields to domain entities
- ✅ Changing infrastructure implementations (internal)

### Breaking Changes (Major)

- ❌ Removing exports from a feature
- ❌ Changing method signatures of exported use cases
- ❌ Removing required fields from domain entities
- ❌ Renaming exported hooks or actions

**Migration strategy for breaking changes**:
1. Deprecate old export with JSDoc `@deprecated` tag
2. Add new export with new signature
3. Update apps to use new export
4. Remove deprecated export in next major version

---

## Contract Enforcement

### Build-Time Enforcement

- **package.json exports**: Primary enforcement - only application and presentation layers accessible
- **TypeScript**: Verifies all imports resolve through package.json exports
- **ESLint**: (Optional) Warns on infrastructure import patterns

### Runtime Enforcement

- **serverExternalPackages**: Prevents database code from bundling in client
- **pnpm workspace**: Ensures apps only install backend as dependency, not transitive infrastructure deps

### Review-Time Enforcement

- **Code review checklist**: "No infrastructure imports in apps"
- **CI/CD gate**: `npm run build` must succeed
- **Architecture docs**: Updated ARCHITECTURE_PLAYBOOK.md with import rules

---

## Summary

**The Contract in One Sentence**: Apps import presentation and application layers from `@backend/features/[feature]`; infrastructure is internal and inaccessible.

**Enforcement Mechanisms**:
1. package.json `exports` field (primary whitelist enforcement)
2. TypeScript module resolution (catches bypass attempts)
3. serverExternalPackages config (prevents Node.js package bundling)
4. Documentation and code review (developer guidance)

**Benefits**:
- ✅ Clean Architecture boundaries enforced at build time
- ✅ Infrastructure can change without breaking apps
- ✅ No database code in client bundles
- ✅ Clear separation between backend library and app code
- ✅ Backend remains framework-agnostic (no React/Next.js dependencies)
