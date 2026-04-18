## Description

<!-- Please include a summary of the change and which issue is fixed. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation

## Core Architectural Review Checklist 🏗️

_Please verify all architectural boundaries are respected before submitting._

- [ ] **Infrastructure Boundaries:** The apps (`@dashboard`, `@storefront`) **do not** contain any `infrastructure/` imports.
- [ ] **Duplication Check:** There are no duplicated repository implementations or schema definitions in the frontend apps.
- [ ] **Package Imports:** All imports from the backend use the structured `@backend/features/[feature]` pattern rather than deep folder traversal.
- [ ] **Next 16 Caching Compliance:** No `export const dynamic = "force-dynamic"` usage in `cacheComponents` routes. Dynamic accesses (`params`, `searchParams`, `cookies()`) are correctly wrapped in `<Suspense>` boundaries.
- [ ] **Pure TypeScript Backend:** The `@backend` package contains zero Next.js/React framework dependencies.

## Testing

- [ ] Unit Tests pass (`npm run test`)
- [ ] Build & Type-check pass (`npm run type-check && pnpm build`)
- [ ] E2E Tests pass
