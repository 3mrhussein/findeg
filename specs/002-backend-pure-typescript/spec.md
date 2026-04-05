# Feature Specification: Backend Pure TypeScript Refactoring

**Feature Branch**: `002-backend-pure-typescript`  
**Created**: April 5, 2026  
**Status**: ✅ Backend Package Complete | ⚠️ App-Layer Validation Pending  
**Backend Completion**: April 5, 2026  
**App Validation**: Deferred to separate testing phase  
**Input**: Refactor @findeg/backend package to remove all Next.js framework dependencies and ensure pure TypeScript business logic. Currently, 21 Next.js imports exist across backend files, violating Constitution Principle VIII which mandates backend packages must be framework-agnostic.

**Backend Package Completion Summary**:
- ✅ All 21 Next.js framework dependencies eliminated from backend
- ✅ 188/188 backend unit tests passing in pure Node.js (13.15 seconds)
- ✅ Zero framework dependencies in backend package.json
- ✅ Backend package builds successfully in isolation
- ✅ Backend-scoped success criteria met (SC-001, SC-002, SC-003, SC-005, SC-006)
- ✅ Admin pages updated to use centralized Server Actions
- ✅ Security audit complete (session + error handling verified)
- ✅ Migration patterns validated (all 5 patterns working)
- ✅ 159/173 tasks complete (92%)
- ✅ Backend package production-ready for consumption by dashboard/storefront
- ⚠️ 14 E2E validation tasks deferred (app-level integration testing - see SC-004 status)
- 📅 Backend Package Completed: April 5, 2026

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Refactoring maintains 4-layer structure (domain/application/infrastructure/presentation); infrastructure layer abstracts framework concerns via interfaces
- **II. Server-Components First**: N/A - backend package contains no UI components
- **III. Bilingual & RTL-First**: N/A - backend package contains no user-facing text
- **IV. Feature-Oriented Core Kernel**: Refactoring preserves feature boundaries; each feature remains self-contained in `src/features/[feature]/`
- **V. Type-Safe & Testable**: All backend services become testable without Next.js runtime; interface-based dependency injection enables mocking
- **VI. DRY Principle**: Cache invalidation logic unified in app-layer; no duplication between dashboard and storefront
- **VII. SOLID Design**: Single Responsibility verified (backend = business logic, app-layer = framework integration); Dependency Inversion applied (backend depends on abstractions, not Next.js concretions)
- **VIII. Backend Packages - Pure TypeScript Libraries**: PRIMARY FOCUS - eliminates all 21 Next.js imports from @findeg/backend

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Backend Developer Writes Pure TypeScript Services (Priority: P1)

Backend developers write business logic services without requiring Next.js runtime or framework knowledge. Services are pure TypeScript functions that accept data and return results or throw domain errors.

**Why this priority**: Core architectural requirement - all other stories depend on this foundation. Without framework-agnostic backend, the package cannot be reused, tested independently, or migrated to other frameworks.

**Independent Test**: Developer can import any backend service into a pure Node.js or Vitest test file, call it with mock data, and receive results without initializing Next.js runtime or encountering framework-specific errors.

**Acceptance Scenarios**:

1. **Given** a backend service function in `features/order/application/actions`, **When** developer imports it into a Vitest test file, **Then** the function executes successfully without Next.js dependencies
2. **Given** an order creation service, **When** the service completes successfully, **Then** it returns order data object (not side effects like cache invalidation)
3. **Given** an authentication service, **When** invalid credentials are provided, **Then** service throws a domain error (not Next.js redirect)

---

### User Story 2 - App-Layer Developer Orchestrates Framework Integration (Priority: P1)

Dashboard and storefront developers call backend services from Server Actions, then handle framework-specific concerns (cache invalidation, redirects, cookie management) in the app layer.

**Why this priority**: Equally critical - defines the integration contract between backend and apps. Without proper app-layer orchestration, functionality would break even if backend is pure.

**Independent Test**: Developer can create a Server Action in dashboard/storefront, call a backend service, receive result, and handle caching/redirects using Next.js APIs - all backend tests continue passing unchanged.

**Acceptance Scenarios**:

1. **Given** an order creation Server Action in dashboard, **When** action calls backend order service, **Then** action receives order data, calls `revalidatePath`, and returns success to client
2. **Given** a profile update Server Action, **When** backend service throws "NotAuthenticatedError", **Then** action catches error and calls Next.js `redirect('/login')`
3. **Given** a dashboard query function, **When** it needs user session, **Then** it extracts session from `cookies()`, passes to backend service as parameter

---

### User Story 3 - Developer Runs Backend Tests in Pure Node Environment (Priority: P2)

Developers run comprehensive unit tests for backend services using Vitest without any Next.js build step or runtime initialization. Tests execute quickly in CI/CD pipelines.

**Why this priority**: Enables fast feedback loops and reliable automated testing. Not P1 because feature works without, but critical for maintainability and developer productivity.

**Independent Test**: Developer runs `pnpm --filter @findeg/backend test` command, and all tests execute in pure Node.js environment in under 30 seconds, with no Next.js runtime errors.

**Acceptance Scenarios**:

1. **Given** backend test suite, **When** developer runs `pnpm test` in backend package, **Then** all tests pass without requiring Next.js, React, or app-layer code
2. **Given** an order service test, **When** test mocks session interface, **Then** service accepts mock and executes business logic without framework dependencies
3. **Given** CI/CD pipeline, **When** backend tests run, **Then** they complete in isolated environment (no dashboard/storefront build required)

---

### User Story 4 - Developer Migrates Existing Next.js-Dependent Code (Priority: P3)

Developers systematically migrate the 21 identified Next.js imports to the new architecture pattern, ensuring no functionality regression in dashboard or storefront.

**Why this priority**: Implementation detail - describes HOW existing code transforms, not critical user value. Can be done incrementally after P1/P2 patterns established.

**Independent Test**: Developer picks one file from the violation list (e.g., `order.ts` with cache revalidation), applies migration pattern, runs tests, and confirms order creation still works end-to-end.

**Acceptance Scenarios**:

1. **Given** `features/order/application/actions/order.ts` using `revalidatePath`, **When** developer extracts cache logic to app-layer action, **Then** order creation continues working, backend test passes, cache still invalidates
2. **Given** `features/identity/application/queries/dashboard.ts` using `redirect`, **When** developer converts to throw domain error, **Then** app-layer catches error and redirects, backend becomes testable
3. **Given** `CookieSessionProvider.ts` using `cookies()`, **When** developer adds session parameter to interface, **Then** app-layer passes session from `cookies()`, backend service receives session object

---

### Edge Cases

- What happens when app-layer forgets to handle a specific domain error type thrown by backend? (System should fail gracefully with clear error message, not crash)
- How does system handle cache revalidation failures in app-layer? (Backend operation succeeds, cache staleness logged but not blocking)
- What if backend service receives null/undefined for required session parameter? (Backend throws validation error at entry point, app-layer receives clear error)
- How does migration handle concurrent updates to files during refactoring? (Clear migration sequence defined, tests prevent regressions)

## Requirements _(mandatory)_

### Functional Requirements

#### Backend Service Purity

- **FR-001**: Backend services in `packages/backend/src` MUST NOT import from `next/cache`, `next/navigation`, `next/headers`, or any other Next.js-specific modules
- **FR-002**: Backend services MUST accept all required runtime data (session, cookies, headers) as explicit function parameters, not by reading global context
- **FR-003**: Backend services MUST return data objects or throw domain-specific errors, not perform side effects (cache invalidation, redirects, cookie setting)
- **FR-004**: Backend services MUST be executable in pure Node.js environment without Next.js runtime initialization

#### Cache Management Pattern

- **FR-005**: App-layer Server Actions in dashboard/storefront MUST call backend service first, then perform cache invalidation using `revalidatePath` or `revalidateTag` based on operation success
- **FR-006**: Backend services that currently call `revalidatePath` MUST be refactored to return operation results; app-layer determines which paths/tags to revalidate
- **FR-007**: Cache invalidation configuration MUST be centralized and reusable across dashboard and storefront (no duplication)

#### Error Handling & Redirects

- **FR-008**: Backend services MUST throw typed domain errors (e.g., `NotAuthenticatedError`, `NotFoundError`, `ValidationError`) using error catalog pattern
- **FR-009**: App-layer query functions and Server Actions MUST catch domain errors and translate to appropriate Next.js responses (`redirect()`, `notFound()`, error state)
- **FR-010**: Domain error classes MUST include sufficient context (error code, message, metadata) for app-layer to make routing decisions without backend logic duplication

#### Session & Request Context

- **FR-011**: Backend services requiring authentication MUST accept session/user data as typed parameters (e.g., `userId: string`, `session: Session`)
- **FR-012**: App-layer functions MUST extract session data from Next.js APIs (`cookies()`, `headers()`) and pass to backend services
- **FR-013**: Session extraction logic MUST be abstracted into reusable helpers to avoid duplication across dashboard and storefront

#### Dependency Injection

- **FR-014**: Backend infrastructure layer MUST define service interfaces for dependencies (e.g., `ISessionProvider`, `ICacheNotifier`)
- **FR-015**: Backend application layer MUST depend on interfaces, not concrete implementations
- **FR-016**: App-layer MUST provide concrete implementations of backend interfaces (e.g., `NextJsSessionProvider` that wraps `cookies()`)

#### Testing Requirements

- **FR-017**: All backend services MUST have unit tests that run in Vitest without Next.js runtime
- **FR-018**: Backend tests MUST use mock implementations of service interfaces (no real database, no Next.js APIs)
- **FR-019**: App-layer integration tests MUST verify complete flows including backend service calls and framework integration

#### Migration Execution

- **FR-020**: All 21 identified Next.js imports MUST be eliminated from backend package (21 violations across 15 files in 6 feature areas):
  - 14 files using `revalidatePath` (10 files), `revalidateTag` (6 files), `cacheTag`, `cacheLife` (3 files) from `next/cache`
  - 5 files using `redirect` (4 files), `notFound` (1 file), `useRouter`, `usePathname` (1 file) from `next/navigation`
  - 2 files using `cookies` from `next/headers`
- **FR-021**: Migration MUST maintain backward compatibility - all existing dashboard/storefront functionality continues working
- **FR-022**: Migration MUST follow atomic commits - each file migration includes backend changes, app-layer changes, and test updates

### Key Entities _(architecture concepts)_

- **Backend Service**: Pure TypeScript function/class in application layer that executes business logic, accepts explicit parameters, returns data or throws domain errors
- **Domain Error**: Typed error class (e.g., `NotAuthenticatedError`, `ResourceNotFoundError`) thrown by backend to signal exceptional conditions
- **Service Interface**: TypeScript interface defining dependencies backend needs (e.g., `ISessionProvider`, `ICacheNotifier`)
- **App-Layer Action**: Next.js Server Action in dashboard/storefront that orchestrates backend service call + framework integration (caching, redirects)
- **Session Provider**: Abstraction for accessing user session data; app-layer implements via `cookies()`, backend consumes via interface

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero Next.js imports exist in `packages/backend/src` directory (verified by automated linting/import analysis)
- **SC-002**: All backend service unit tests execute successfully in pure Node.js environment without Next.js runtime (100% test suite passes in Vitest)
- **SC-003**: Backend package test execution completes in under 30 seconds (demonstrates isolation from heavy framework dependencies)
- **SC-004**: All existing dashboard and storefront functionality continues working without regression (100% of critical user flows pass in Cypress E2E tests) — _See Appendix A for explicit critical flow definitions and validation status_
- **SC-005**: Backend services can be imported and tested in isolation with zero framework setup code (demonstrated by sample test requiring <5 lines of setup) — _Example provided in quickstart.md or below:_
  ```typescript
  // Pure Node.js test - zero Next.js dependencies
  import { login } from '@findeg/backend/features/identity';
  const result = await login({ email: 'test@example.com', password: 'pass123' });
  expect(result.success).toBe(true);
  expect(result.data?.user.email).toBe('test@example.com');
  ```
- **SC-006**: App-layer cache invalidation logic is DRY - no duplicated `revalidatePath` calls between dashboard and storefront for the same operations (verified by code review)

## Assumptions

- **Assumption 1**: Current Next.js imports are limited to the 21 identified locations in cache management, routing, and request context - no hidden dependencies exist
- **Assumption 2**: Dashboard and storefront currently share no backend-calling logic - each app has its own Server Actions (migration will introduce shared patterns)
- **Assumption 3**: Existing backend services do not rely on Next.js runtime for core business logic - only for integration concerns (caching, redirects, session access)
- **Assumption 4**: Team is familiar with dependency injection patterns and interface-based design - minimal training required
- **Assumption 5**: Current test coverage for affected backend services exists and will catch regressions during migration
- **Assumption 6**: Migration can be done incrementally per feature area (order, identity, etc.) without requiring a full rewrite of the backend package
- **Assumption 7**: Performance impact of additional abstraction layers (interfaces, app-layer orchestration) is negligible compared to current implementation

---

## Appendix A: Critical User Flows (SC-004 Definition)

**Purpose**: This appendix defines the "critical user flows" referenced in Success Criterion SC-004 to provide explicit acceptance criteria for end-to-end validation.

**SC-004 Full Text**: "All existing dashboard and storefront functionality continues working without regression (100% of critical user flows pass in Cypress E2E tests)"

### Critical User Flows for Production Readiness

The following flows MUST pass 100% E2E tests before the feature can be considered fully production-ready:

#### 1. Authentication Flow (Identity Feature)
- **Scenario**: User login → Dashboard access → User logout
- **Entry Point**: `/login` page
- **Success Criteria**: User authenticates with valid credentials, accesses protected dashboard route, session persists, logout clears session
- **Cypress Test**: `cypress/e2e/auth/login-logout.cy.ts`
- **Backend Services**: `AuthService.login()`, `AuthService.logout()`, session management

#### 2. Order Creation Flow (Order Feature)
- **Scenario**: Add item to cart → Checkout → Payment → Order confirmation
- **Entry Point**: Storefront product page
- **Success Criteria**: Item added to cart, cart persists, checkout succeeds, order created in database, confirmation displayed
- **Cypress Test**: `cypress/e2e/shop/order-creation.cy.ts`
- **Backend Services**: Cart management, order creation, payment integration

#### 3. Product Management Flow (Administration Feature)
- **Scenario**: Admin creates product → Updates product → Deletes product
- **Entry Point**: `/admin/products` page
- **Success Criteria**: Product created with all fields, update persists, deletion removes from database, cache invalidates correctly
- **Cypress Test**: `cypress/e2e/admin/product-crud.cy.ts`
- **Backend Services**: Product CRUD actions, cache invalidation

#### 4. Product Browse Flow (Catalog Feature)
- **Scenario**: Shop page load → Category filter → Product detail view
- **Entry Point**: `/shop` page
- **Success Criteria**: Products load efficiently, filters apply correctly, detail page displays accurate data, cache hit rate optimal
- **Cypress Test**: `cypress/e2e/shop/product-browse.cy.ts`
- **Backend Services**: Product queries, category queries, cache configuration

#### 5. Profile Update Flow (Identity Feature)
- **Scenario**: User updates profile information → Verifies changes persist
- **Entry Point**: `/account` page
- **Success Criteria**: Profile updates save to database, changes reflected immediately, cache invalidation works, session updates
- **Cypress Test**: `cypress/e2e/account/profile-update.cy.ts`
- **Backend Services**: Profile update actions, cache invalidation

#### 6. Error Handling Flow (Core Feature)
- **Scenario**: Invalid credentials → Domain error thrown → Redirect to login
- **Entry Point**: Any authenticated route
- **Success Criteria**: Domain errors propagate correctly, app-layer translates to redirects, user sees appropriate error messages
- **Cypress Test**: `cypress/e2e/errors/domain-error-handling.cy.ts`
- **Backend Services**: All services throwing `NotAuthenticatedError`, `ValidationError`, etc.

### Validation Status

**Current Status**: ⚠️ Deferred (App-Layer Validation Pending)

**Backend Scope**: All backend services refactored and unit-tested (188/188 tests passing)  
**App-Layer Scope**: Server Actions created, pages updated (T054-T096 complete)  
**E2E Validation**: Deferred to separate testing phase (T012, T065-T067, T076-T077, T102-T104)

**Rationale for Deferral**: Backend package refactoring is production-ready and isolated from framework dependencies. Full-stack E2E testing requires resolving pre-existing UI dependency issues in `@findeg/ui` package (unrelated to this feature). E2E validation will be executed once app-layer build issues are resolved.

**Completion Criteria**: All 6 critical flows listed above must pass their respective Cypress E2E tests with 100% success rate before updating SC-004 status to "MET".
