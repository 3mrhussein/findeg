# Frontend Test Master Plan

Last updated: 2026-02-18  
Owner: Frontend team  
Status: In progress

## 1) Goals

1. Validate all public-shop and admin critical flows through deterministic automated tests.
2. Keep tests maintainable with a clean layered Cypress architecture (`selectors`, `actions`, `assertions`, `utils`, `specs`).
3. Reach release confidence for feature completeness before moving to next phase features.

## 2) Test Pyramid (Target)

1. Unit tests (future phase): hooks/utilities/domain mappers.
2. Integration tests (future phase): server actions/query-services/repositories contracts.
3. E2E tests (current phase focus): user-visible business flows.

## 3) Progress Legend

- `[x]` Completed
- `[~]` In progress
- `[ ]` Not started

## 4) E2E Coverage Backlog and Progress

### 4.1 Public Shop - Discovery & Listing

- `[x]` Shop category filter reflects DB-backed totals (`/shop?categories=...`)
- `[x]` Search results flow (`/search?q=...`) with URL-state assertions
- `[x]` Categories index to category page navigation (`/categories -> /categories/[slug]`)
- `[x]` Brand filter behavior in listing
- `[x]` Price range filter behavior in listing
- `[x]` Sort behavior (`featured`, `price-asc`, `price-desc`, `rating-desc`)
- `[x]` Pagination URL-state behavior (`page=`)
- `[x]` Empty listing state behavior for restrictive filters

### 4.2 Public Shop - Product Detail & Cart

- `[x]` Product detail route renders from DB (`/products/[slug]`)
- `[x]` Add-to-cart from product detail updates cart drawer
- `[x]` Add-to-cart from shop grid card
- `[x]` Cart quantity increment/decrement
- `[x]` Cart item removal
- `[x]` Cart persistence across route transitions

### 4.3 Checkout

- `[x]` Checkout empty-cart state
- `[x]` Checkout form validation (required/format)
- `[x]` Checkout success path (guest)
- `[x]` Checkout error path (API failure handling)

### 4.4 Auth & Account

- `[x]` Admin login route and dashboard access
- `[x]` Admin product creation reflects in storefront
- `[x]` Registration basic happy path
- `[x]` My-account protected route behavior
- `[x]` My-account order history/details rendering

### 4.5 Admin CRUD (Backoffice)

- `[x]` Admin create product with category assignment
- `[x]` Admin update product reflected in storefront
- `[x]` Admin delete product reflected in storefront
- `[x]` Admin categories CRUD smoke
- `[x]` Admin brands CRUD smoke
- `[x]` Admin inventory update reflected in storefront stock behavior

### 4.6 Localization & UX Contracts

- `[x]` EN/AR route parity for key pages
- `[ ]` Locale switch preserves flow state where expected
- `[ ]` Theme toggle smoke checks
- `[ ]` Core accessibility smoke (keyboard for header/cart/search)

## 5) Technical Workstream Tasks

### 5.1 Cypress Architecture (Current)

- `[x]` Base Cypress configuration (`cypress.config.ts`)
- `[x]` Layered directories and conventions
- `[x]` Reusable commands/actions/assertions/utils
- `[x]` Stable selector strategy hardening (`data-testid` rollout - current critical flows)
- `[x]` API/DB helper tasks for deterministic setup/cleanup (CSV-backed seed + post-run re-seed wrapper)
- `[~]` CI pipeline integration for e2e (`type-check:e2e` added in frontend-quality workflow)
- `[x]` Deterministic spec ordering in runner (`shop -> admin -> remaining`) for state-sensitive suites

### 5.2 Immediate Next Implementation Batch

- `[x]` Implement search flow spec
- `[x]` Implement category index navigation spec
- `[x]` Implement product-detail to cart drawer flow spec
- `[x]` Implement shop grid add-to-cart flow spec
- `[x]` Implement cart persistence across navigation spec

## 6) Definition of Done for This Test Initiative

1. All critical public-shop flows are covered by passing e2e tests.
2. Admin product/category operations have e2e smoke coverage.
3. Tests are deterministic and self-cleaning (no residual test data).
4. `npm run e2e:run` is CI-ready with artifacts and clear failure diagnostics.
5. Database is restored to seeded baseline after each e2e run (`scripts/run-e2e-and-post-seed.js`).
