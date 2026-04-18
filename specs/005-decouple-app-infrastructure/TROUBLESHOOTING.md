# Troubleshooting Guide: App Infrastructure Decoupling

If you encounter build-time errors relating to module resolution, bundling, or prerender limits during a `pnpm build` or `npm run type-check`, it is highly likely that an architectural boundary has been violated (e.g., frontend code attempting to bundle Node.js infrastructure modules).

## 1. Webpack / Turbopack Resolving Errors

### Error Signature

```
Module not found: Can't resolve 'net'
Module not found: Can't resolve 'tls'
Module not found: Can't resolve 'pg' or 'postgres'
```

### Explanation & Fix

This occurs because `@storefront` or `@dashboard` accidentally imported a backend file containing database drivers.

1. **Locate the Leak:** Run `grep -r "/infrastructure" packages/dashboard` and `packages/storefront` to check if a repository or raw schema from `@backend/*/infrastructure/*` was imported.
2. **Fix:** All queries and logic must be piped through `@backend/features/[feature]` which exclusively exports Application and Domain layer boundaries. You CANNOT use the DI container (ServiceContainer) or Repositories directly from Next.js paths.

## 2. Next.js "Uncached Data Accessed Outside of `<Suspense>`"

### Error Signature

```
Error: Route "/[locale]/school": Uncached data was accessed outside of <Suspense>.
This delays the entire page from rendering...
```

### Explanation & Fix

In Next.js 16 with `cacheComponents: true`, the framework aggressively static generator tries to parse paths during `pnpm build`.

1. Make sure no global layout (like `root/app/layout.tsx`) intercepts headers by calling `getLocale()` from `next-intl` unsupervised. Use `routing.defaultLocale` instead of dynamic requests in root `layout.tsx`.
2. Wrap any deep components retrieving `searchParams` with `<Suspense>`. Next.js requires boundaries to demarcate Static vs Server-streamed chunks.
3. Remove ANY instance of `export const dynamic = "force-dynamic"` from your page routes—it is completely incompatible with `cacheComponents`.

## 3. Empty Exports / Unresolved Imports (TSC Errors)

### Error Signature

```
Module '"@backend/features/core"' has no exported member 'ServiceContainer'.
```

### Explanation & Fix

This means the `@backend/package.json` correctly clamped access to internal infrastructure.
**Fix**: Call the application factory `create[Feature]Services()` instead of the raw DI container.

```typescript
// ✅ RIGHT
import { createCoreServices } from "@backend/features/core";
const { loggerService } = createCoreServices();

// ❌ WRONG
import { ServiceContainer } from "@backend/features/core/infrastructure/di/ServiceContainer";
```
