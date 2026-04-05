# Changelog

Auto-generated from git commit history.

Latest commit date: 2026-04-05
Range: HEAD

## [2026-04-05] Backend Pure TypeScript Refactoring

### Architecture Changes

- **BREAKING**: Refactored `@findeg/backend` to be a pure TypeScript library with zero framework dependencies
- Eliminated all 21 Next.js imports from backend package (`next/cache`, `next/navigation`, `next/headers`)
- Removed `next`, `react`, `react-dom`, and `@findeg/ui` from backend package.json dependencies
- Backend services now run in pure Node.js environment (Vitest, 188 tests, 13.15 seconds execution)

### New Patterns

- **ServiceResult Pattern**: Backend services return data + cache metadata; app-layer handles cache invalidation
- **Domain Errors**: 7 typed error classes (`NotAuthenticatedError`, `NotAuthorizedError`, `ResourceNotFoundError`, `ValidationError`, `ConflictError`, `BusinessRuleViolationError`, `DomainError` base)
- **Dependency Injection**: `ICookieStore` interface abstracts Next.js `cookies()` API
- **App-Layer Integration**: 54 Server Actions created in dashboard/storefront wrapping backend services

### Features

- Backend can now be imported and tested in any Node.js environment
- All backend tests run in pure Node.js without Next.js runtime
- Framework-agnostic session management via dependency injection
- Centralized error handling and cache invalidation in app-layer helpers

### Modified Files

- **Backend Core**: 7 domain error classes, `ServiceResult<T>` type, `ICookieStore` interface
- **Identity**: `auth.ts`, `profile.ts`, `dashboard.ts`, `my-account.ts` (4 files)
- **Order**: `order.ts` (1 file)
- **Catalog**: `product.ts`, `brand.ts`, `category.ts`, `shop-page.ts`, `storefront.ts`, `category-page.ts` (6 files)
- **Administration**: `admin-tag-actions.ts`, `admin-collection-actions.ts`, `admin-order-actions.ts`, `admin-product-actions.ts`, `inventory.ts` (5 files)
- **Core Session**: `CookieSessionProvider.ts` (1 file)
- **School**: Removed `useSchoolListLookup.ts` presentation hook from backend (moved to storefront)

### App-Layer Files Created

- **Dashboard**: `session.ts`, `cache.ts`, `errors.ts`, `auth-actions.ts`, `profile-actions.ts`, `order-actions.ts`, `catalog-actions.ts`, `admin-actions.ts` (8 files)
- **Storefront**: `session.ts`, `cache.ts`, `errors.ts`, `shop-queries.ts` (4 files)

### Testing

- 188/188 unit tests passing in pure Node.js (Vitest)
- Test execution: 13.15 seconds (56% faster than 30-second target)
- Zero Next.js runtime dependencies in tests
- Comprehensive test coverage: domain errors, service results, auth, profile, order, catalog

### Documentation

- Updated `/packages/backend/README.md` with Pure TypeScript architecture documentation
- Created `/docs/architecture/BACKEND_MIGRATION_PATTERNS.md` migration guide
- Updated Constitution compliance (Principle VIII: Backend Packages - Pure TypeScript Libraries)

### Constitution Compliance

- ✅ Principle I: Clean Architecture maintained (4-layer structure)
- ✅ Principle V: Type-Safe & Testable (strict TypeScript, 188 tests)
- ✅ Principle VI: DRY (centralized cache/error logic)
- ✅ Principle VII: SOLID (Single Responsibility, Dependency Inversion, Interface Segregation)
- ✅ **Principle VIII: Backend Packages - Pure TypeScript Libraries** (PRIMARY GOAL ACHIEVED)

### Migration Impact

- **No Breaking Changes for End Users**: All dashboard and storefront functionality unchanged
- **Breaking for Internal Imports**: Backend services now return `ServiceResult<T>` instead of void
- **Breaking for Tests**: Backend tests now require mock `ICookieStore` instead of Next.js `cookies()`

---

## Previous Updates

Latest commit date: 2026-02-19
Range: HEAD

## Added

- Implement checkout flow, add Cypress E2E tests for shop and admin, and refactor product and header components. (`93e07c2`, 2026-02-19)
- Implement variant pricing, refactor storefront components, and update core features and documentation. (`ae90438`, 2026-02-17)
- Implement comprehensive admin panel features for product, brand, order, and inventory management, and expand API endpoints for cart, checkout, authentication, and logging. (`f22f13a`, 2026-02-15)
- Refactor header into modular components and add product translation fetching for admin editing. (`81fa6f1`, 2026-02-14)

## Changed

- reorganize application into a feature-based architecture with bounded contexts. (`e489373`, 2026-02-15)

## Maintenance

- stop tracking .next directory (`c9d7293`, 2026-01-17)

## Other

- Refactor project structure by migrating presentation layer components to the app router, introducing new common and UI components, and updating application services and infrastructure. (`92df258`, 2026-02-14)
- fix next-intl setup and linting errors (`7b6e9ec`, 2026-01-20)
- i18n (`88f8a28`, 2026-01-19)
- finlizaing the clean archhetcture implementation (`99a30b0`, 2026-01-18)
- refactoring clean archecture (`1d88c81`, 2026-01-18)
- update readme (`67d6059`, 2026-01-18)
- implement clean archetcture (`920de55`, 2026-01-18)
- create a src directory (`8f1fc03`, 2026-01-18)
- refactoring (`4f88303`, 2026-01-17)
- fix project styles (`02656b5`, 2026-01-17)
- first step migration (`87922c1`, 2026-01-17)
- initial commit (`6f831bc`, 2026-01-17)
