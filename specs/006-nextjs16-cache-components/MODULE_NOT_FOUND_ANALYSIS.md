# Module-Not-Found Build Error Analysis

**Date**: 2026-04-06  
**Issue**: Dashboard production build fails with "Module not found" errors for `@/features/...` imports  
**Status**: Root cause identified, awaiting decision on solution approach

---

## Root Cause

Backend service classes use `@/` path aliases (configured in `packages/backend/tsconfig.json`) which work fine when:
- Building backend standalone: ✅ TypeScript resolves paths correctly
- Using backend in dev mode: ✅ Apps access via tsconfig paths
- Type-checking: ✅ TypeScript knows how to resolve `@/`

But FAIL when:
- Building dashboard for production: ❌ Next.js Turbopack tries to parse backend source
- Next.js encounters `@/features/...`: ❌ Resolves relative to `dashboard/src/` instead of `backend/src/`
- Module resolution fails: ❌ Can't find files in wrong directory

---

## Technical Details

### Import Chain That Fails

```
dashboard/src/app/.../categories/page.tsx
  → dashboard/src/data/categories/actions.ts
    → @backend/features/administration (createAdministrationServices)
      → backend/src/features/administration/application/services/factory.ts
        → backend/src/features/administration/application/services/AdminProductService.ts
          → Contains: import { Sku } from "@/features/catalog/domain/value-objects/Sku"
            ❌ Next.js resolves @/ as dashboard/src/ → dashboard/src/features/catalog... (doesn't exist!)
```

### Why serverExternalPackages Doesn't Help

`serverExternalPackages: ["@backend"]` tells Next.js:
- ✅ Don't bundle backend code in Next.js server bundle
- ✅ Load backend from node_modules at runtime
- ❌ BUT still parses imports to understand module graph for tree-shaking and SSR/client boundary detection

### Why workspace:* Makes It Worse

```json
// packages/dashboard/package.json
{
  "dependencies": {
    "@backend": "workspace:*" 
    // ↑ pnpm links directly to source, not dist/
  }
}
```

During build, Next.js sees source files with `@/` imports and tries to resolve them using dashboard's tsconfig, not backend's.

---

## Scope of Impact

### Administration Services (Currently Failing)

```bash
$ grep -r "@/features" packages/backend/src/features/administration/application/services/*.ts | wc -l
54  # 54 lines with @/ imports
```

**Files Affected** (12 total):
1. AdminProductService.ts (14 @/ imports)
2. AdminCategoryService.ts
3. AdminBrandService.ts
4. AdminTagService.ts
5. AdminCollectionService.ts
6. AdminInventoryService.ts
7. AdminOrderService.ts
8. AdminDashboardService.ts
9. AuditLogService.ts
10. ProductImportService.ts
11. EmailService.ts (stub)
12. factory.ts (✅ already uses relative imports)

### Catalog Services (Potentially At Risk)

```bash
$ grep -r "@/features" packages/backend/src/features/catalog/application/services/*.ts
16 matches  # Also uses @/ imports
```

**Why hasn't this failed yet?**  
Because catalog factory is only used in queries.ts (read-only), and Next.js may be more lenient with queries vs server actions. Or it *is* failing but the error output is truncated.

### Other Features

- Order services: Likely affected
- Cart services: Likely affected
- Identity services: Likely affected

**Total Estimate**: 100-200 lines across 30-50 files

---

## Solution Options

### Option A: Refactor Backend to Relative Imports (RECOMMENDED)

**What**: Replace all `@/features/...` imports with relative paths in backend

**Example**:
```typescript
// Before (AdminProductService.ts)
import { Sku } from "@/features/catalog/domain/value-objects/Sku";
import { db } from "@/features/core/infrastructure/persistence";

// After
import { Sku } from "../../../catalog/domain/value-objects/Sku";
import { db } from "../../../core/infrastructure/persistence/database.config";
```

**Pros**:
- ✅ Fixes production builds permanently
- ✅ No runtime overhead
- ✅ Standard TypeScript pattern (relative imports in libraries)
- ✅ Aligns with spec 005 (backend exports have no @/ imports)

**Cons**:
- ❌ 2-3 hours of refactoring (100-200 imports across 30-50 files)
- ❌ Slightly less readable paths (long relative paths)
- ❌ Risk of missing some imports (need thorough testing)

**Effort**: 2-3 hours (automated with script + manual verification)

---

### Option B: Pre-Compile Backend for Apps

**What**: Build backend dist/ and have apps import compiled JavaScript instead of source

**How**:
```json
// packages/dashboard/package.json
{
  "dependencies": {
    "@backend": "workspace:*",
  },
  "scripts": {
    "predev": "pnpm --filter @backend build",
    "prebuild": "pnpm -- filter @backend build"
  }
}
```

**Pros**:
- ✅ Backend can keep `@/` imports
- ✅ Compiled dist/ has no path aliases (transpiled to relative)
- ✅ Clear separation: source vs published API

**Cons**:
- ❌ Slower dev experience (must rebuild backend after changes)
- ❌ Debugging harder (source maps needed)
- ❌ Two-step watch process (backend watch + app watch)
- ❌ Doesn't work well with monorepo dev workflow

**Effort**: 1 hour (configure build scripts), but degrades DX significantly

---

### Option C: Turbopack Configuration (EXPERIMENTAL)

**What**: Try to configure Next.js to respect backend's tsconfig paths

**Attempts**:
```typescript
// packages/dashboard/next.config.ts
experimental: {
  turbopack: {
    resolveAlias: {
      '@/features': '../backend/src/features', // Might not work
    },
  },
},
```

**Pros**:
- ✅ If it works, zero refactoring needed
- ✅ Backend keeps clean @/ imports

**Cons**:
- ❌ Experimental Turbopack feature (may not exist)
- ❌ Unclear if Next.js supports per-package alias configuration
- ❌ Might break other parts of build
- ❌ Not documented as a solution

**Effort**: 30 min (try and test), **low confidence of success**

---

### Option D: Temporary Workaround (DEFER ISSUE)

**What**: Keep category restoration working, stub out production builds for now

**How**:
- Accept that `pnpm build` fails
- Continue restoration work using `pnpm dev` (which works)
- Fix build issue in a separate focused session

**Pros**:
- ✅ Unblocks category restoration progress
- ✅ Dev workflow continues working
- ✅ Can batch fix with other build issues

**Cons**:
- ❌ Can't deploy dashboard
- ❌ Can't run E2E tests
- ❌ Builds up technical debt

**Effort**: 0 hours (just document it)

---

## Recommendation

**Choose Option A: Refactor Backend to Relative Imports**

**Reasoning**:
1. **Permanent fix** — Aligns with spec 005 ("backend exports must not use @/ imports")
2. **Standard practice** — NPM packages use relative imports, not aliases
3. **2-3 hours** — Manageable scope (can automate most of it)
4. **Unblocks deployment** — Production builds will work

**Alternative**: If timeline is tight, choose Option D (defer) and continue restoration, address this in a separate session focused solely on build config.

---

## Implementation Plan (Option A)

### Phase 1: Automated Refactoring (1 hour)

1. **Create conversion script** (packages/backend/scripts/convert-imports.js):
   ```javascript
   // Find all @/features imports
   // Calculate relative path from current file to target
   // Replace import statement
   // Write file
   ```

2. **Run script on administration services**:
   ```bash
   node packages/backend/scripts/convert-imports.js \
     packages/backend/src/features/administration/application/services/**/*.ts
   ```

3. **Verify TypeScript compiles**:
   ```bash
   pnpm --filter @backend run build
   ```

### Phase 2: Manual Verification (30 min)

1. Check that factory.ts still exports correctly
2. Test catalog factory imports (categories queries)
3. Test admin factory imports (categories actions)
4. Run type-check on dashboard

### Phase 3: Expand to Other Features (1 hour)

1. Convert catalog services
2. Convert order services
3. Convert cart services
4. Convert identity services (if needed)

### Phase 4: Build Verification (15 min)

1. Build backend: `pnpm --filter @backend build`
2. Build dashboard: `pnpm --filter @dashboard build`
3. Confirm zero module-not-found errors
4. Update CATEGORY_RESTORATION_COMPLETE.md with build success ✅

---

## Decision Required

**Question**: Which option should we pursue?

- **A** → Refactor backend imports (2-3h, permanent fix)
- **B** → Pre-compile backend (1h, degrades DX)
- **C** → Try Turbopack config (30min, low success chance)
- **D** → Defer issue, continue restoration (0h, can't deploy)

**Current Blocker**: Cannot proceed with full implementation verification until build works.
