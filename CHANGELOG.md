# Changelog

## Unreleased

- Correct Partner Reward payment after cancellation and preserve exact EGP values
  through refunds, reversals, adjustments and settlements. New ledger values are
  append-only; unvalued historical entries remain explicit rather than being
  backfilled with current rates.

- Consolidate #64 compatibility guidance at backend, database, and environment
  entry points; correct the legacy database barrel's browser-import claim and
  mark the remaining infrastructure analysis as historical evidence. Retain
  frontend references, migration history, and production release configuration.

- Preserve the original Storefront and Dashboard pages, themes, assets, translations,
  and tests as migration references outside the active workspace (#64). Restore their
  premature deletion and record a page-by-page migration map: target development
  gates do not establish full feature or visual parity. Keep the unified runtime as
  the supported development path and obsolete database setup paths removed.
  Production certification and controlled release remain with #89.

- Add production readiness gates and operational procedures (#63): required lint,
  dependency security and documentation checks, bilingual operator journeys,
  protected revision-specific certification, release/recovery guidance, connection
  budgets and delivered-only outbox cleanup. Production certification remains
  blocked until a notification provider is validated.

- Complete versioned JSON contracts for released web capabilities (#62), including
  School Supply List management, structured rejections and checkout retry semantics.
  Validate HTTP receipts against OpenAPI and enforce transitive browser/server
  boundaries. Reward/report module foundations are not yet wired into the released
  runtime and are not exposed as HTTP operations.

- Shop unlisted School Supply Lists through separate resumable List Selections (#60),
  with required/optional choices, specification-matching alternatives, advisory
  completeness and repeatable List Offers. Accept dedicated Cash-on-Delivery Orders
  with immutable item attribution, retry protection and atomic reservations/outbox.
  Archived links remain viewable; Arabic/English browser journeys cover incomplete
  checkout. Partner Points accounting remains with #61.

- Add bilingual ordinary Cart and Guest Cash-on-Delivery checkout (#58), with
  exact EGP prices, authoritative reconfirmation, atomic stock reservations and
  replay-safe acceptance. Guest Order Access consumes an opaque-reference/code
  pair once; notification delivery remains with #59. Cover cookie recovery,
  competing buyers, concurrent retries, rollback and bilingual browser journeys.

- Restore the 37 native Matt Pocock skills and setup templates; retire the custom per-ticket PR, session-isolation, and automatic delivery workflow. Preserve upstream skill files from repository formatting.

- Manage and shop bilingual Product Variants and inventory through the Back
  Office and Storefront (#55). Inventory adjustments preserve catalog ownership,
  fail closed on insufficient stock under contested concurrency, and reflect
  real-time availability across Arabic and English storefront browsing.

- Add scoped Partner Memberships, verified-email single-use invitations, additive
  Partner Roles, and request-specific bilingual Workspace selection (#56).
  Access changes preserve valid authentication; provider delivery and School
  Supply List operations remain with their feature tickets.

- Restore target PostgreSQL Current Sessions, request-specific Active Portal grants,
  fixed additive staff roles, and authorization refresh without sign-out (#54).
  Legacy role grants remain excluded; Partner Membership integration belongs to #56.
  Correct migration snapshot 0001 to reflect its existing Users column before
  adding session tables and invalidation triggers in migration 0002.

- Establish explicit module ownership for the retained PostgreSQL records, one
  compiled schema assembly, and transaction contracts that roll back structured
  business rejections as well as exceptions. Target module imports and cycles are
  now checked; legacy mappings remain replacement evidence, not certified commerce.

> Manually maintained. Do not overwrite this file with the draft changelog generator.

- #52 introduces the target unified web portal shells and compiled web/worker/migration runtime, one release image with independent process restarts, and HTTP/process/real-PostgreSQL migration gates. Authenticated entry remains closed pending #54; worker delivery readiness remains unavailable pending #59. Legacy frontends are retained only as migration evidence.

- #68 imports the repository skills from `99d5e7c`, adapts their delivery and setup instructions to the current workflow, and makes them available in worktrees created from merged `develop`. Unrelated work on the source branch is excluded.

- #51 establishes the target-architecture and delivery-gate foundation. It deliberately rebuilds only the safe documentation, guardrail, and workflow subset after #65 was closed without merge; #65's Current Session, database/configuration, and legacy-frontend changes are not included.

Auto-generated from git commit history.

Latest commit date: 2026-04-05
Range: HEAD

## [2026-04-05] Backend Pure TypeScript Refactoring

### Architecture Changes

- **BREAKING**: Refactored `@backend` to be a pure TypeScript library with zero framework dependencies
- Eliminated all 21 Next.js imports from backend package (`next/cache`, `next/navigation`, `next/headers`)
- Removed `next`, `react`, `react-dom`, and `@ui` from backend package.json dependencies
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
