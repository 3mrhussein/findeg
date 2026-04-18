# Research: Decouple App Infrastructure Dependencies

**Phase 0 Output** | **Date**: 2026-04-05 | **Plan**: [plan.md](./plan.md)

This document consolidates research findings on enforcing Clean Architecture boundaries between Next.js apps and backend infrastructure code, preventing client-side bundling of server-only dependencies.

---

## 1. Next.js 16 Server/Client Boundary Enforcement

### Decision: Use Multi-Layered Boundary Enforcement (Apps Layer Only)

**Rationale**: Backend must remain a framework-agnostic pure TypeScript library (Constitution Principle VIII). Boundary enforcement happens exclusively at the apps layer (dashboard/storefront) through package.json exports, TypeScript path resolution, and serverExternalPackages configuration.

### Mechanisms

#### 1.1 Package.json Exports Field (Primary Enforcement)

**What it does**: Controls which files can be imported from backend package. Acts as an allowlist for module resolution.

```json
// packages/backend/package.json
{
  "exports": {
    "./features/catalog/application": "./src/features/catalog/application/index.ts",
    "./features/catalog/domain": "./src/features/catalog/domain/index.ts",
    "./features/catalog/presentation": "./src/features/catalog/presentation/index.ts"
    // Note: No export for "./features/catalog/infrastructure/*"
  }
}
```

**Effect**:
```typescript
// ✅ Allowed (exported from package)
import { type IProductRepository } from '@backend/features/catalog/application';
import { useProducts } from '@backend/features/catalog/presentation';

// ❌ Blocked by TypeScript (no export definition)
import { DrizzleProductRepository } from '@backend/features/catalog/infrastructure/DrizzleProductRepository';
// Error: Package subpath './features/catalog/infrastructure/DrizzleProductRepository' is not defined by "exports"
```

**Best practices**:
- Only export application and presentation layers per feature
- Feature index files should re-export ONLY application interfaces and presentation hooks
- Never export `infrastructure/*` paths
- Backend remains framework-agnostic (no React, no Next.js dependencies)

**Current status in FindEg**:
- ✅ Backend package.json has exports field
- ⚠️  Need to verify each feature's `index.ts` doesn't export infrastructure implementations

---

#### 1.2 serverExternalPackages (Runtime Optimization)

**What it does**: Tells Next.js to treat certain packages as external to the client bundle (they won't be bundled, will be loaded via Node.js `require()` at runtime on the server).

```typescript
// packages/dashboard/next.config.ts
const nextConfig: NextConfig = {
  serverExternalPackages: [
    'postgres',
    'drizzle-orm',
    'bcryptjs',
    'jose',
    'jsonwebtoken',
    'sharp',
    'nodemailer',
  ],
};
```

**When it helps**:
- Prevents webpack from trying to bundle Node.js-specific packages
- Reduces bundle size for server-side code
- Improves build performance

**Limitations**:
- Does NOT prevent client code from importing these packages (only optimizes server bundles)
- Primary enforcement still comes from package.json exports

**Current status in FindEg**:
- ✅ Already configured in both `packages/dashboard/next.config.ts` and `packages/storefront/next.config.ts`
- ✅ Includes all critical server-only dependencies

---

#### 1.3 TypeScript Path Aliases (Module Resolution Control)

**What it does**: Controls how `@features/*` resolves in app code.

**Current problem**:
```json
// packages/dashboard/tsconfig.json
{
  "paths": {
    "@features/*": [
      "./src/features/*",        // ← Dashboard features
      "../backend/src/features/*" // ← Backend features (ALL layers including infrastructure)
    ]
  }
}
```

This allows:
```typescript
// Apps can currently bypass package.json exports:
import { DrizzleProductRepository } from '@features/catalog/infrastructure/DrizzleProductRepository';
```

**Solution: Remove backend path resolution from @features/***

Apps should ONLY import from backend via the package name (which respects exports field):
```json
// packages/dashboard/tsconfig.json
{
  "paths": {
    "@features/*": ["./src/features/*"], // Only dashboard features
    "@backend/*": ["../backend/src/*"]
  }
}
```

Then rely on package.json exports to enforce boundaries.

**Recommendation**: **Remove backend from `@features/*` path** because:
- Clearer separation (backend is a separate package, should be imported as such)
- Aligns with package.json exports enforcement
- Easier to audit (all backend imports go through `@backend`)
- Backend remains framework-agnostic

---

#### 1.4 Optional: server-only Package (Apps Layer Only)

**❗ IMPORTANT**: The `server-only` package is a React/Next.js specific package and must NOT be used in backend code. Backend must remain framework-agnostic.

**Where to use server-only**: Only in app-level Server Actions or server utilities (dashboard/storefront), never in backend package.

```typescript
// ✅ CORRECT: App-level Server Action
// packages/dashboard/src/features/catalog/actions.ts
import 'server-only';
import { getProducts } from '@backend/features/catalog/presentation';

export async function fetchProductsAction() {
  return await getProducts();
}

// ❌ WRONG: Backend infrastructure file
// packages/backend/src/features/catalog/infrastructure/DrizzleProductRepository.ts
import 'server-only'; // ← VIOLATES PRINCIPLE VIII: Backend must be framework-agnostic
```

**Why backend can't use server-only**:
- Backend is a pure TypeScript library, not a Next.js app
- Adding server-only would require installing React/Next.js in backend
- Violates Constitution Principle VIII (Backend Packages Must Be Pure TypeScript Libraries)
- Backend might be consumed by non-Next.js environments (APIs, CLIs, other frameworks)

**Alternative enforcement**: Package.json exports + TypeScript path resolution are sufficient and framework-agnostic.

---

## 2. Alternatives Considered

### Alternative A: ESLint Rule Only

**Approach**: Keep current path resolution, add ESLint rule to forbid infrastructure imports.

```javascript
// eslint.config.js
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: ['**/infrastructure/*', '@features/*/infrastructure/*']
      }
    ]
  }
}
```

**Rejected because**:
- Softer enforcement (can be disabled with eslint-disable comments)
- Doesn't prevent TypeScript from resolving the paths
- Adds configuration overhead vs leveraging package.json exports

---

### Alternative B: Separate Infrastructure Package

**Approach**: Split backend into `@backend` (domain + application + presentation) and `@backend-infrastructure` (infrastructure implementations).

**Rejected because**:
- Overcomplicates for current scale (3 packages → 4 packages)
- Infrastructure implementations often need domain types (would require circular dependency)
- Doesn't prevent apps from importing `@backend-infrastructure` directly

---

### Alternative C: Monorepo Workspace Protocol

**Approach**: Use pnpm workspace protocol to control which packages can depend on which.

```json
// packages/dashboard/package.json
{
  "dependencies": {
    "@backend": "workspace:*"
  },
  "pnpm": {
    "overrides": {
      "@backend>postgres": "never" // Block transitive dependency
    }
  }
}
```

**Rejected because**:
- Doesn't prevent apps from importing backend code
- Only controls dependency installation, not module resolution
- Overly complex for this use case

---

## 3. Duplicated Infrastructure Code in Storefront

### Finding: DrizzleNotificationRepository Duplicated

**Evidence**:
```bash
# Found in both packages
packages/backend/src/features/notifications/infrastructure/DrizzleNotificationRepository.ts
packages/storefront/src/features/notifications/infrastructure/DrizzleNotificationRepository.ts
```

**Root cause**: Storefront was copying backend features instead of importing from `@backend`.

**Decision**: Remove ALL feature infrastructure code from storefront, import from backend package instead.

**Migration strategy**:
1. Identify all duplicated infrastructure in `packages/storefront/src/features/`
2. For each feature, verify backend exports the required application/presentation layer APIs
3. Update storefront imports to use `@backend/features/[feature]`
4. Delete `packages/storefront/src/features/*/infrastructure/` directories
5. Delete `packages/storefront/src/features/*/domain/` directories (should use backend domain types)
6. Keep ONLY storefront-specific presentation code (components, Server Actions) in `packages/storefront/src/features/`

---

## 4. Implementation Sequence

### Sequence Decision: Fix Boundaries First, Then Clean Up

**Rationale**: Establish enforcement mechanisms before removing duplicated code, so cleanup can't reintroduce violations.

**Phase breakdown**:

1. **Phase 1a: Backend Package Exports**
   - Update `packages/backend/package.json` exports field to expose only application and presentation layers
   - Verify no infrastructure paths are exposed
   - Run `npm run build` to verify apps can still build

2. **Phase 1b: App Path Resolution**
   - Update `packages/dashboard/tsconfig.json` and `packages/storefront/tsconfig.json` to remove backend from `@features/*` path
   - Update all app imports from `@features/[backend-feature]` to `@backend/features/[feature]`
   - Run `npm run type-check` to verify all imports resolve

3. **Phase 1c: Remove Duplicated Infrastructure**
   - Delete `packages/storefront/src/features/notifications/infrastructure/`
   - Delete any other duplicated domain/infrastructure directories in storefront
   - Update storefront code to import from `@backend` instead
   - Run `npm run build` to verify apps still build successfully

4. **Phase 2: Documentation & Enforcement**
   - Update `docs/architecture/ARCHITECTURE_PLAYBOOK.md` with import rules
   - Update `docs/architecture/clean-architecture.md` with boundary patterns
   - Add ESLint rule as secondary enforcement (optional)
   - Update `README.md` or onboarding docs with developer guidance

---

## 5. Testing Strategy

### Build-Time Validation

**Test 1: Infrastructure code cannot be imported by client**
```typescript
// packages/dashboard/src/components/TestClientComponent.tsx
'use client';
import { DrizzleProductRepository } from '@backend/features/catalog/infrastructure/DrizzleProductRepository';
// Expected: Build error "Module not found" or "server-only" error
```

**Test 2: Apps can only import via package exports**
```typescript
// packages/dashboard/src/app/products/page.tsx
import { useProducts } from '@backend/features/catalog'; // ✅ Should work
import { DrizzleProductRepository } from '@backend/features/catalog/infrastructure/DrizzleProductRepository'; // ❌ Should fail
```

**Test 3: serverExternalPackages configuration is correct**
```bash
npm run build
# Check build output for:
# - No "postgres" or "drizzle-orm" in client bundle
# - Build completes without "Can't resolve 'net'" errors
```

### Runtime Validation

**Test 4: E2E tests pass with production build**
```bash
npm run build
npm run test:e2e
# Expected: All e2e tests pass against production build
```

---

## 6. Maintenance & Governance

### Ongoing Enforcement

**Developer guardrails**:
1. Pre-commit hook: `npm run type-check && npm run lint`
2. CI/CD gate: `npm run build` must succeed
3. Code review checklist: "No infrastructure imports in apps"

**Documentation updates**:
- `docs/architecture/ARCHITECTURE_PLAYBOOK.md`: Add "Import Rules" section
- `docs/guides/CODING_STANDARDS.md`: Add "Package Boundary Violations" section
- `.github/copilot-instructions.md`: Add "Never import */infrastructure/* from apps" rule

**Automated detection**:
```javascript
// eslint.config.js (secondary enforcement)
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/infrastructure/*', '@features/*/infrastructure/*'],
            message: 'Direct infrastructure imports are prohibited. Import from @backend/features/[feature] instead.'
          }
        ]
      }
    ]
  }
}
```

---

## References

- [Next.js 16 Documentation: server-only](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment)
- [TypeScript Handbook: Package Exports](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-exports)
- [Clean Architecture Boundaries (FindEg Constitution)](../../.specify/memory/constitution.md)
- [FindEg Architecture Playbook](../../docs/architecture/ARCHITECTURE_PLAYBOOK.md)

---

## Summary Table

| Mechanism | Enforcement Level | Failure Mode | Recommended |
|-----------|------------------|--------------|-------------|
| `server-only` package | Build-time | Build error if client imports | ✅ Yes |
| `serverExternalPackages` | Runtime optimization | Bundle bloat if missing | ✅ Yes (already configured) |
| package.json `exports` | TypeScript resolution | Import error if path not exported | ✅ Yes (verify feature indexes) |
| TypeScript path aliases | Developer experience | Can bypass exports if misconfigured | ✅ Yes (remove backend from `@features/*`) |
| ESLint rule | Lint-time warning | Can be disabled | ⚠️  Optional (secondary enforcement) |

**Final decision**: Implement all build-time mechanisms (server-only, exports, path aliases) + optional ESLint rule for defense-in-depth.
