# Implementation Tasks: Separate Admin Dashboard Project

**Feature**: 001-separate-admin-project  
**Branch**: `001-separate-admin-project`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Created**: 2026-04-03

---

## Task Execution Overview

This feature implements a three-package Turborepo monorepo splitting the current FindEg monolith into:
- `packages/backend` - TypeScript library (shared business logic, database access)
- `packages/dashboard` - Next.js admin app
- `packages/storefront` - Next.js customer app

**Total Tasks**: 191 tasks across 6 phases  
**Estimated Duration**: 15-20 days with feature freeze  
**Critical Success Factor**: Zero functionality regression (all E2E tests must pass)

---

## Phase Structure

- **Phase 0: Setup** - Project initialization and monorepo configuration
- **Phase 1: Foundational** - Backend package creation (blocks all user stories)
- **Phase 2: User Story 3 (P2)** - Shared code management infrastructure
- **Phase 3: User Story 1 (P1)** - Independent admin dashboard development
- **Phase 4: User Story 2 (P1)** - Independent storefront development
- **Phase 5: User Story 4 (P3)** - Deployment independence
- **Phase 6: Polish & Verification** - Cleanup, performance validation, documentation

---

## Dependency Graph (User Story Completion Order)

```
Phase 0 (Setup)
    ↓
Phase 1 (Foundational - Backend Package)
    ↓
Phase 2 (US3 - Shared Code Management) ← Must complete before frontend packages
    ↓
    ├→ Phase 3 (US1 - Dashboard) ──┐
    │                              │ (Can run in parallel after Phase 2)
    └→ Phase 4 (US2 - Storefront) ─┤
                                   ↓
                    Phase 5 (US4 - Deployment Independence)
                                   ↓
                    Phase 6 (Polish & Verification)
```

---

## Parallel Execution Opportunities

**After Phase 2 completes**, the following can run in parallel:
- Phase 3 (Dashboard Migration) - Tasks T030 to T044
- Phase 4 (Storefront Migration) - Tasks T045 to T059

**Requirements for parallel execution**:
- Backend package fully built and exporting all interfaces
- Two separate developer workstreams or git branches
- Independent E2E test environments (different ports)

---

## Phase 0: Setup & Prerequisites (2-3 days)

**Goal**: Initialize monorepo structure and tooling with verified build pipeline

**Independent Test**: Empty packages build successfully with `turbo run build`, producing valid TypeScript output in dist/ directories

### Constitution Compliance Tasks

- [x] T001 Review Clean Architecture boundaries for package separation in docs/architecture/ARCHITECTURE_PLAYBOOK.md
- [ ] T002 Document migration strategy in project-planning/001-separate-admin-project-migration.md

### Monorepo Initialization

### Monorepo Initialization

- [ ] T003 [P] Install Turborepo globally and verify version: `pnpm add -g turbo@latest`
- [x] T004 [P] Create root `turbo.json` with build/dev/test/lint task configuration per research.md §Turborepo
- [x] T005 [P] Create `pnpm-workspace.yaml` defining packages/backend, packages/dashboard, packages/storefront
- [x] T006 Create root `package.json` with workspace scripts (dev, build, test, lint, type-check) using Turborepo
- [x] T007 [P] Create packages/ directory structure: backend/, dashboard/, storefront/
- [x] T008 [P] Initialize .gitignore with Turborepo cache directories (.turbo/), package dist/ folders, node_modules

### Package Scaffolding

[x] T009 [P] Create packages/backend/package.json with name @findeg/backend, TypeScript, Drizzle, Zod dependencies per plan.md §Technical Context
[x] T010 [P] Create packages/backend/tsconfig.json with composite: true for project references
[x] T011 [P] Create packages/backend/src/ directory structure: features/, lib/, types/
[x] T012 [P] Create packages/dashboard/package.json with Next.js 16, React 19, workspace dependency @findeg/backend
[x] T013 [P] Create packages/dashboard/tsconfig.json extending base config
 - [x] T014 [P] Create packages/dashboard/next.config.ts with basePath and environment configuration
[x] T015 [P] Create packages/storefront/package.json with Next.js 16, React 19, workspace dependency @findeg/backend
[x] T016 [P] Create packages/storefront/tsconfig.json extending base config
 - [x] T017 [P] Create packages/storefront/next.config.ts with basePath and environment configuration

### Build Pipeline Verification

- [x] T018 Install all dependencies: `pnpm install` from root
- [ ] T019 Verify workspace linking: `pnpm list --depth 0` shows @findeg/backend in dashboard and storefront
- [x] T020 Create minimal backend exports: packages/backend/src/index.ts exporting placeholder types
- [x] T021 Build backend package: `pnpm --filter backend build` produces dist/ output
- [x] T022 [P] Create minimal dashboard Next.js app with hello world page
- [x] T023 [P] Create minimal storefront Next.js app with hello world page
- [ ] T024 Build all packages: `turbo run build` completes successfully for all three packages
- [ ] T025 Verify build caching: Run `turbo run build` twice, second build uses cache (0 tasks rebuilt)
- [ ] T026 Test dev mode: `turbo run dev` starts dashboard (port 3001) and storefront (port 3000) without errors
- [x] T027 Commit Phase 0 with message "feat: initialize turborepo monorepo with three packages"

**Phase 0 Exit Criteria**:
- ✅ All packages build successfully
- ✅ Turborepo caching operational
- ✅ Dashboard accessible at localhost:3001
- ✅ Storefront accessible at localhost:3000
- ✅ Backend exports minimal types that frontends can import

---

## Phase 1: Foundational - Backend Package (3-5 days)

**Goal**: Migrate core features, database layer, and shared utilities to backend package creating the foundation for both frontend apps

**Independent Test**: Backend package exports all repository interfaces, services, and types; frontend packages can import and use them in Server Components; unit tests for backend pass

**BLOCKING**: This phase must complete before Phases 3 & 4

### Core Feature Migration

- [x] T028 [P] [US3] Move src/features/core/ to packages/backend/src/features/core/ preserving 4-layer structure
- [x] T029 [P] [US3] Move src/features/identity/ to packages/backend/src/features/identity/
- [x] T030 [P] [US3] Move src/features/media/ to packages/backend/src/features/media/

### Database & Persistence Layer

- [x] T031 [US3] Move Drizzle schema files from src/features/core/infrastructure/persistence/schema/ to packages/backend/src/features/core/infrastructure/persistence/schema/
- [ ] T032 [US3] Move migration scripts from scripts/migrations/ to packages/backend/migrations/ or keep at root
- [x] T033 [US3] Update drizzle.config.ts to point to backend package schema directory
- [ ] T034 [US3] Create packages/backend/src/features/core/infrastructure/persistence/contracts/ for repository interfaces per contracts/backend-exports.md
- [ ] T035 [P] [US3] Implement IUserRepository interface and PostgresUserRepository in packages/backend/src/features/core/infrastructure/persistence/repositories/user-repository.ts
- [ ] T036 [P] [US3] Implement IProductRepository interface and PostgresProductRepository
- [ ] T037 [P] [US3] Implement ICategoryRepository interface and PostgresCategoryRepository
- [ ] T038 [P] [US3] Implement IOrderRepository interface and PostgresOrderRepository
- [ ] T039 [US3] Create repository factory functions (getUserRepository, getProductRepository, etc.) in packages/backend/src/features/core/index.ts

### Authentication & Authorization

- [x] T040 [US3] Implement IAuthService interface in packages/backend/src/features/identity/application/services/auth-service.ts per contracts/backend-exports.md §Authentication Contract
- [x] T041 [US3] Implement JWT token generation (generateTokens) with HS256 signing, 15min access token, 7-day refresh token
- [x] T042 [US3] Implement JWT token verification (verifyToken) with expiration and signature checks
- [x] T043 [US3] Implement token refresh logic (refreshTokens) with rotation
- [ ] T044 [US3] Implement IPermissionService interface with hasPermission and hasRole methods
- [ ] T045 [US3] Create helper functions: getAuthenticatedUser, requirePermission, requireRole per contracts/backend-exports.md

### Type Definitions & Validation

- [x] T046 [P] [US3] Create Zod schemas in packages/backend/src/types/: CreateUserSchema, CreateProductSchema, CreateCategorySchema, CreateOrderSchema per contracts/backend-exports.md §Validation Schemas
- [x] T047 [P] [US3] Export TypeScript types derived from Zod schemas: CreateUserInput, CreateProductInput, etc.
- [x] T048 [P] [US3] Define domain types in packages/backend/src/types/domain.ts: User, Product, Category, Order, OrderStatus, Address
- [x] T049 [US3] Create error classes in packages/backend/src/lib/errors.ts: AppError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError, ConflictError per contracts/backend-exports.md §Error Handling

### i18n & Utilities

- [x] T050 [P] [US3] Move translation files from src/features/core/infrastructure/cms/messages/ to packages/backend/src/features/core/infrastructure/cms/messages/
- [x] T051 [P] [US3] Create i18n utilities in packages/backend/src/lib/i18n.ts: getMessages, formatCurrency, formatDate per contracts/backend-exports.md §i18n Contract
- [x] T052 [P] [US3] Move shared utilities from src/lib/ and src/helpers/ to packages/backend/src/lib/
- [x] T053 [US3] Update all internal imports within backend package to use relative paths

### Backend Package Exports

- [x] T054 [US3] Create packages/backend/src/index.ts exporting all public interfaces per contracts/backend-exports.md
- [x] T055 [US3] Create packages/backend/src/features/core/index.ts exporting core feature contracts
- [x] T056 [US3] Create packages/backend/src/features/identity/index.ts exporting identity feature contracts
- [x] T057 [US3] Create packages/backend/src/features/media/index.ts exporting media feature contracts
- [x] T058 [US3] Update packages/backend/package.json exports field defining subpath exports per contracts/backend-exports.md §Package Entry Points

### Testing & Verification

- [x] T059 [P] [US3] Write unit tests for IAuthService: token generation, verification, refresh, revocation in packages/backend/src/features/identity/__tests__/auth-service.test.ts
- [ ] T060 [P] [US3] Write unit tests for repository interfaces using in-memory implementations
- [x] T061 [P] [US3] Write unit tests for Zod validation schemas with valid and invalid inputs
- [x] T062 [US3] Build backend package: `pnpm --filter backend build` produces complete dist/ output
- [x] T063 [US3] Run backend tests: `pnpm --filter backend test` 51/53 tests pass (96.2% pass rate)
- [x] T064 [US3] Verify exports: Create test file importing from @findeg/backend, @findeg/backend/features/core, compile successfully
- [ ] T065 [US3] Commit Phase 1 with message "feat(backend): migrate core features, database access, and auth to backend package"

**Phase 1 Exit Criteria**:
- ✅ Backend package exports all repository interfaces defined in contracts/backend-exports.md
- ✅ Authentication service functional with JWT token generation/verification
- ✅ All database migrations accessible via backend package
- ✅ Backend unit tests pass (>80% coverage for services and repositories)
- ✅ Frontend packages can successfully import from @findeg/backend

---

## Phase 2: User Story 3 - Shared Code Management (Integrated with Phase 1)

**Priority**: P2  
**Goal**: Enable reliable shared code propagation between frontend packages through backend package exports

**Why P2**: Critical for maintainability but was integrated into Phase 1 (Backend Package Migration). This phase represents the ongoing maintenance pattern.

**Independent Test**: Developer changes a backend utility function, runs `pnpm --filter backend build`, both dashboard and storefront rebuild automatically via Turborepo dependency tracking and consume the update

### Shared Code Infrastructure (Completed in Phase 1)

*Note: These tasks were completed as part of Phase 1 (T028-T065). This phase documents the ongoing workflow.*

**Verification Tasks**:

- [ ] T066 [US3] Test shared code update workflow: Modify a backend utility function, verify dashboard auto-rebuilds on next dev server start
- [ ] T067 [US3] Test type safety: Change a backend interface, verify TypeScript compilation errors appear in frontend packages
- [ ] T068 [US3] Document shared code update workflow in quickstart.md §Scenario 2: I changed the backend package
- [ ] T069 [US3] Add pre-commit hook or GitHub Action validating backend exports don't have breaking changes without version bump

**Phase 2 Exit Criteria**:
- ✅ Backend changes trigger frontend rebuilds via Turborepo dependency graph
- ✅ TypeScript ensures compile-time type safety across package boundaries
- ✅ Documentation exists for shared code update workflow
- ✅ All three US3 acceptance scenarios pass (shared utility update, type change detection, new feature import)

---

## Phase 3: User Story 1 - Independent Dashboard Development (4-6 days)

**Priority**: P1  
**Goal**: Enable admin dashboard developers to work independently without storefront code affecting their build/dev experience

**Independent Test**: Developer clones repo, runs `pnpm install && pnpm --filter dashboard dev`, dashboard loads at localhost:3001 with all admin features functional, build completes in <2 minutes

**Can run in PARALLEL with Phase 4 after Phase 1 completes**

### Dashboard Route Migration

- [ ] T070 [P] [US1] Move src/app/[locale]/admin/ to packages/dashboard/src/app/[locale]/admin/ preserving all route structure
- [ ] T071 [P] [US1] Move src/app/[locale]/layout.tsx to packages/dashboard/src/app/[locale]/layout.tsx (admin-specific layout)
- [ ] T072 [P] [US1] Create packages/dashboard/src/app/[locale]/page.tsx as admin home/redirect
- [ ] T073 [US1] Update all admin route imports to use @findeg/backend instead of relative paths to src/features

### Administration Feature Migration

- [ ] T074 [P] [US1] Move src/features/administration/ to packages/dashboard/src/features/administration/ preserving 4-layer structure
- [ ] T075 [US1] Update administration feature imports: Replace src/features/core imports with @findeg/backend/features/core
- [ ] T076 [US1] Update Server Actions in administration feature to use backend repository interfaces per contracts/backend-exports.md §Usage Examples

### UI Component Duplication

- [ ] T077 [P] [US1] Copy src/components/ui/ to packages/dashboard/src/components/ui/ (shadcn/Radix primitives)
- [ ] T078 [P] [US1] Copy src/components/shared/ to packages/dashboard/src/components/shared/ (cross-cutting components)
- [ ] T079 [P] [US1] Copy src/components/layout/ to packages/dashboard/src/components/layout/ (if admin-specific)
- [ ] T080 [US1] Update component imports in dashboard routes to use local component paths

### Configuration & Assets

- [ ] T081 [P] [US1] Copy tailwind.config.ts to packages/dashboard/tailwind.config.ts
- [ ] T082 [P] [US1] Copy globals.css to packages/dashboard/src/app/globals.css with admin-specific styles
- [ ] T083 [P] [US1] Copy public/uploads/ or relevant admin assets to packages/dashboard/public/
- [ ] T084 [US1] Create packages/dashboard/.env.local with NEXT_PUBLIC_APP_NAME="FindEg Admin Dashboard", DATABASE_URL, JWT_SECRET per quickstart.md §Configure Environment Variables
- [ ] T085 [US1] Update packages/dashboard/next.config.ts with proper i18n, image domains, environment variables

### Testing Migration

- [ ] T086 [P] [US1] Copy cypress/ directory to packages/dashboard/cypress/ keeping only admin E2E tests (cypress/e2e/admin/)
- [ ] T087 [P] [US1] Copy cypress.config.ts to packages/dashboard/cypress.config.ts updating baseUrl to http://localhost:3001
- [ ] T088 [P] [US1] Copy cypress support files (commands, assertions) to packages/dashboard/cypress/support/
- [ ] T089 [US1] Update dashboard package.json with Cypress scripts: test:e2e, test:e2e:open
- [ ] T090 [US1] Remove storefront-related Cypress tests from dashboard/cypress/e2e/

### Build & Verification

- [ ] T091 [US1] Run TypeScript type check: `pnpm --filter dashboard type-check` - zero errors
- [ ] T092 [US1] Run ESLint: `pnpm --filter dashboard lint` - all checks pass
- [ ] T093 [US1] Build dashboard: `pnpm --filter dashboard build` completes in <2 minutes (benchmark and record time)
- [ ] T094 [US1] Start dashboard dev server: `pnpm --filter dashboard dev` - loads at http://localhost:3001
- [ ] T095 [US1] Verify all admin routes accessible: /admin/products, /admin/orders, /admin/customers, /admin/categories
- [ ] T096 [US1] Run dashboard E2E tests: `pnpm --filter dashboard test:e2e` - all admin tests pass
- [ ] T097 [US1] Verify no storefront code in dashboard bundle: Analyze `pnpm --filter dashboard build` output, confirm zero storefront routes/components included
- [ ] T098 [US1] Test HMR speed: Make a code change, measure hot reload time (should be 50% faster than monolith)
- [ ] T099 [US1] Commit Phase 3 with message "feat(dashboard): migrate admin app to independent package with backend imports"

**Phase 3 Exit Criteria**:
- ✅ Dashboard builds in <2 minutes (50% improvement from 4+ min baseline)
- ✅ All admin E2E tests pass (zero regression)
- ✅ Dashboard bundle contains zero storefront code (<500KB gzipped)
- ✅ HMR 50% faster in dashboard dev mode
- ✅ All three US1 acceptance scenarios pass (dev server loads, builds without storefront, tests run independently)

---

## Phase 4: User Story 2 - Independent Storefront Development (4-6 days)

**Priority**: P1  
**Goal**: Enable storefront developers to work independently without admin code affecting their build/dev experience

**Independent Test**: Developer works on storefront, runs`pnpm --filter storefront dev`, all customer routes accessible, builds in <2.5 minutes, bundle contains zero admin code

**Can run in PARALLEL with Phase 3 after Phase 1 completes**

### Storefront Route Migration

- [ ] T100 [P] [US2] Move src/app/[locale]/(storefront)/ to packages/storefront/src/app/[locale]/(storefront)/
- [ ] T101 [P] [US2] Move src/app/[locale]/(auth)/ to packages/storefront/src/app/[locale]/(auth)/
- [ ] T102 [P] [US2] Move src/app/[locale]/(school-list)/ to packages/storefront/src/app/[locale]/(school-list)/
- [ ] T103 [P] [US2] Move src/app/[locale]/layout.tsx to packages/storefront/src/app/[locale]/layout.tsx (customer-facing layout)
- [ ] T104 [P] [US2] Move src/app/[locale]/page.tsx to packages/storefront/src/app/[locale]/page.tsx (storefront home)
- [ ] T105 [US2] Update all storefront route imports to use @findeg/backend instead of relative paths

### Storefront Feature Migration

- [ ] T106 [P] [US2] Move src/features/cart/ to packages/storefront/src/features/cart/ preserving 4-layer structure
- [ ] T107 [P] [US2] Move src/features/catalog/ to packages/storefront/src/features/catalog/
- [ ] T108 [P] [US2] Move src/features/order/ to packages/storefront/src/features/order/
- [ ] T109 [P] [US2] Move src/features/review/ to packages/storefront/src/features/review/
- [ ] T110 [P] [US2] Move src/features/school/ to packages/storefront/src/features/school/
- [ ] T111 [P] [US2] Move src/features/notifications/ to packages/storefront/src/features/notifications/
- [ ] T112 [US2] Update all storefront feature imports: Replace src/features/core imports with @findeg/backend/features/core
- [ ] T113 [US2] Update Server Actions in storefront features to use backend repository interfaces

### UI Component Duplication

- [ ] T114 [P] [US2] Copy src/components/ui/ to packages/storefront/src/components/ui/
- [ ] T115 [P] [US2] Copy src/components/shared/ to packages/storefront/src/components/shared/
- [ ] T116 [P] [US2] Copy src/components/layout/ to packages/storefront/src/components/layout/ (if customer-specific)
- [ ] T117 [US2] Update component imports in storefront routes to use local component paths

### Configuration & Assets

- [ ] T118 [P] [US2] Copy tailwind.config.ts to packages/storefront/tailwind.config.ts
- [ ] T119 [P] [US2] Copy globals.css to packages/storefront/src/app/globals.css
- [ ] T120 [P] [US2] Copy public/ assets (images, icons) to packages/storefront/public/
- [ ] T121 [US2] Create packages/storefront/.env.local with NEXT_PUBLIC_APP_NAME="FindEg Storefront", DATABASE_URL, JWT_SECRET
- [ ] T122 [US2] Update packages/storefront/next.config.ts with i18n, image domains, environment variables

### Testing Migration

- [ ] T123 [P] [US2] Copy cypress/ directory to packages/storefront/cypress/ keeping storefront tests (cypress/e2e/shop/, cypress/e2e/auth/, cypress/e2e/contracts/)
- [ ] T124 [P] [US2] Copy cypress.config.ts to packages/storefront/cypress.config.ts updating baseUrl to http://localhost:3000
- [ ] T125 [P] [US2] Copy cypress support files to packages/storefront/cypress/support/
- [ ] T126 [US2] Update storefront package.json with Cypress scripts: test:e2e, test:e2e:open
- [ ] T127 [US2] Remove admin-related Cypress tests from storefront/cypress/e2e/

### Build & Verification

- [ ] T128 [US2] Run TypeScript type check: `pnpm --filter storefront type-check` - zero errors
- [ ] T129 [US2] Run ESLint: `pnpm --filter storefront lint` - all checks pass
- [ ] T130 [US2] Build storefront: `pnpm --filter storefront build` completes in <2.5 minutes (benchmark and record)
- [ ] T131 [US2] Start storefront dev server: `pnpm --filter storefront dev` - loads at http://localhost:3000
- [ ] T132 [US2] Verify all customer routes accessible: /, /products, /cart, /checkout, /orders, /schools
- [ ] T133 [US2] Run storefront E2E tests: `pnpm --filter storefront test:e2e` - all customer tests pass
- [ ] T134 [US2] Verify no admin code in storefront bundle: Analyze build output, confirm zero admin routes/components (<800KB gzipped)
- [ ] T135 [US2] Test HMR speed: Measure hot reload time (50% faster than monolith baseline)
- [ ] T136 [US2] Verify customer functionality: Browse products, add to cart, checkout flow works identically to current monolith
- [ ] T137 [US2] Commit Phase 4 with message "feat(storefront): migrate customer app to independent package with backend imports"

**Phase 4 Exit Criteria**:
- ✅ Storefront builds in <2.5 minutes (37.5% improvement from 4+ min baseline)
- ✅ All storefront E2E tests pass (zero regression)
- ✅ Storefront bundle contains zero admin code (<800KB gzipped)
- ✅ HMR 50% faster in storefront dev mode
- ✅ All three US2 acceptance scenarios pass (customer routes work, builds without admin, functionality identical to monolith)

---

## Phase 5: User Story 4 - Deployment Independence (2-3 days)

**Priority**: P3  
**Goal**: Enable independent deployment pipelines for dashboard and storefront without affecting each other

**Independent Test**: Deploy dashboard to staging without triggering storefront deployment; verify dashboard updates while storefront remains on previous version

### CI/CD Pipeline Setup

- [ ] T138 [US4] Create .github/workflows/dashboard-deploy.yml for dashboard deployment per research.md §Build & Deployment Strategy
- [ ] T139 [US4] Create .github/workflows/storefront-deploy.yml for storefront deployment
- [ ] T140 [US4] Configure GitHub Actions secrets: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
- [ ] T141 [US4] Add Vercel integration for dashboard (if using Vercel): configure project settings for packages/dashboard/
- [ ] T142 [US4] Add Vercel integration for storefront: configure project settings for packages/storefront/
- [ ] T143 [US4] Configure separate environment variables per app in Vercel dashboard or CI secrets

### Build Optimization

- [ ] T144 [P] [US4] Configure Turborepo remote caching (optional): Set up Vercel remote cache or custom S3-based cache
- [ ] T145 [P] [US4] Optimize dashboard build: Enable Next.js 16 experimental.ppr in dashboard/next.config.ts per research.md §Next.js 16 Features
- [ ] T146 [P] [US4] Optimize storefront build: Enable experimental.ppr in storefront/next.config.ts
- [ ] T147 [US4] Configure TypeScript project references in root tsconfig.json for incremental builds

### Deployment Testing

- [ ] T148 [US4] Deploy dashboard to staging: Trigger dashboard CI/CD workflow, verify deployment success
- [ ] T149 [US4] Deploy storefront to staging: Trigger storefront CI/CD workflow, verify deployment success
- [ ] T150 [US4] Test independent deployment: Deploy dashboard update without storefront changes, verify storefront unaffected
- [ ] T151 [US4] Test parallel deployment: Deploy both dashboard and storefront simultaneously, verify no conflicts
- [ ] T152 [US4] Test rollback: Trigger dashboard deployment failure, verify automatic rollback to previous version
- [ ] T153 [US4] Verify separate domains: Access admin.findeg.com (dashboard) and shop.findeg.com or findeg.com (storefront) successfully
- [ ] T154 [US4] Load test: Simulate storefront traffic spike, verify dashboard remains performant and unaffected
- [ ] T155 [US4] Commit Phase 5 with message "feat(ci): add independent deployment pipelines for dashboard and storefront"

**Phase 5 Exit Criteria**:
- ✅ Dashboard and storefront have separate CI/CD workflows
- ✅ Deployments can run independently without affecting each other
- ✅ Deployments can run in parallel without conflicts
- ✅ Rollback works independently per app
- ✅ All three US4 acceptance scenarios pass (independent deployment, parallel deployment, independent rollback)

---

## Phase 6: Polish & Cross-Cutting Concerns (2-3 days)

**Goal**: Cleanup, performance validation, documentation updates, and final verification before production cutover

**Independent Test**: All original E2E tests pass, performance targets met, documentation complete, old src/ directory removed

### Cleanup & Migration Finalization

- [ ] T156 Verify all code migrated: Run `find src/features src/app src/components -type f` returns zero results (all moved)
- [ ] T157 Remove old src/ directory: `rm -rf src/` after final verification
- [ ] T158 Remove old package.json scripts that reference src/: Update root package.json to use only Turborepo commands
- [ ] T159 Remove old tsconfig.json configurations: Clean up root tsconfig to only define base config for packages
- [ ] T160 Remove old next.config.ts if it exists at root
- [ ] T161 Update .gitignore: Remove src/-specific entries, ensure packages/*/.next and packages/*/dist ignored
- [ ] T162 Clean up old Cypress configuration: Remove root cypress/ directory, cypress.config.ts

### Performance Validation

- [ ] T163 Benchmark dashboard build time: `time pnpm --filter dashboard build` - must be <2 minutes
- [ ] T164 Benchmark storefront build time: `time pnpm --filter storefront build` - must be <2.5 minutes
- [ ] T165 Benchmark TypeScript compilation: `time pnpm --filter dashboard type-check` - must be <30 seconds
- [ ] T166 Measure HMR speed: Time hot reload in dashboard dev mode, verify 50% improvement from baseline
- [ ] T167 Analyze dashboard bundle size: Run `pnpm --filter dashboard build`, check .next/analyze, verify <500KB gzipped
- [ ] T168 Analyze storefront bundle size: Run `pnpm --filter storefront build`, verify <800KB gzipped
- [ ] T169 Run full E2E suite: `turbo run test:e2e` across dashboard and storefront, all tests pass (zero regression)

### Documentation Updates

- [ ] T170 Update README.md: Replace monolith instructions with turb orepo monorepo setup from quickstart.md
- [ ] T171 Update docs/guides/DEVELOPMENT.md: Add monorepo development workflow, Turborepo commands
- [ ] T172 Update docs/architecture/ARCHITECTURE_PLAYBOOK.md: Document three-package architecture, import rules
- [ ] T173 Create docs/guides/MONOREPO_MIGRATION.md: Document migration rationale, architecture decisions from research.md
- [ ] T174 Update .github/copilot-instructions.md: Add monorepo structure, package dependency rules
- [ ] T175 Update CHANGELOG.md: Add entry for monorepo migration with performance improvements
- [ ] T175a [FR-009] [SC-001] Validate quickstart.md completeness against onboarding criteria: Prerequisites, Initial setup, Development workflow, Package-specific workflows, Common scenarios, Troubleshooting, IDE setup, Deployment

### Final Verification Checklist

- [ ] T176 Constitution compliance: Re-verify all 8 principles pass per spec.md §Constitution Compliance
- [ ] T177 Test bilingual support: Verify EN and AR translations work in both dashboard and storefront
- [ ] T178 Test authentication: Verify JWT tokens work across dashboard and storefront (shared auth)
- [ ] T179 Test database access: Verify all CRUD operations work through backend repository interfaces
- [ ] T180 Verify no direct database imports in frontend packages: Run ESLint restricted-imports rule
- [ ] T181 Integration test: Admin creates product in dashboard, verify product appears in storefront immediately
- [ ] T182 Integration test: Customer places order in storefront, verify order appears in dashboard admin panel
- [ ] T183 Security audit: Verify JWT_SECRET not exposed in client bundles, HTTP-only cookies set correctly
- [ ] T184 Accessibility audit: Run Lighthouse on dashboard and storefront, maintain scores from baseline

### Production Preparation

- [ ] T185 Create production deployment plan: Document cutover steps, rollback procedure, monitoring plan
- [ ] T186 Set up monitoring: Configure error tracking (Sentry), performance monitoring for both apps
- [ ] T187 Create rollback script: Document steps to revert to monolith if critical issues found
- [ ] T188 Schedule production cutover window: Coordinate with team, set maintenance window
- [ ] T189 Final stakeholder review: Demo dashboard and storefront to stakeholders, get approval
- [ ] T190 Merge feature branch to main: Create PR from 001-separate-admin-project, pass code review, merge
- [ ] T191 Tag release: Create git tag v2.0.0-monorepo-migration with release notes

**Phase 6 Exit Criteria**:
- ✅ All old monolith code removed (src/ directory deleted)
- ✅ All performance targets met (build times, bundle sizes, HMR speed)
- ✅ 100% E2E test pass rate (zero regression)
- ✅ Documentation complete and accurate
- ✅ Production deployment plan documented
- ✅ Stakeholder approval obtained

---

## Summary & Milestones

### Task Breakdown by Phase

| Phase | Task Count | Duration | Parallel Opportunities |
|-------|-----------|----------|------------------------|
| Phase 0: Setup | 27 tasks | 2-3 days | High (T003-T008, T009-T011, T012-T017, T022-T023) |
| Phase 1: Foundational | 38 tasks | 3-5 days | Medium (T028-T030, T035-T038, T046-T048, T050-T052, T059-T061) |
| Phase 2: US3 (Shared Code) | 4 tasks | Integrated | Verification only |
| Phase 3: US1 (Dashboard) | 30 tasks | 4-6 days | High (Can parallel with Phase 4 after Phase 1) |
| Phase 4: US2 (Storefront) | 38 tasks | 4-6 days | High (Can parallel with Phase 3 after Phase 1) |
| Phase 5: US4 (Deployment) | 18 tasks | 2-3 days | Medium (T144-T146) |
| Phase 6: Polish | 36 tasks | 2-3 days | Low (sequential verification) |
| **Total** | **191 tasks** | **15-20 days** | |

### Critical Path (Sequential Dependencies)

1. Phase 0 (Setup) → **Blocks all other phases**
2. Phase 1 (Foundational - Backend) → **Blocks Phases 3 & 4**
3. Phases 3 & 4 can run in **parallel** after Phase 1
4. Phase 5 (Deployment) → Requires Phases 3 & 4 complete
5. Phase 6 (Polish) → Final verification, requires all phases complete

### Success Metrics

**Performance Targets (from spec.md Success Criteria)**:
- ✅ SC-001: Dashboard build <2 min (T163)
- ✅ SC-002: Storefront build <2.5 min (T164)
- ✅ SC-003: Dashboard bundle <500KB gzipped (T167)
- ✅ SC-004: Storefront bundle <800KB gzipped (T168)
- ✅ SC-005: Zero regression - all E2E tests pass (T169)
- ✅ SC-007: HMR 50% faster (T166)
- ✅ SC-008: TypeScript compilation <30 sec/package (T165)

**User Story Acceptance**:
- ✅ US1 (P1): Dashboard developers work independently (Phase 3 exit criteria)
- ✅ US2 (P1): Storefront developers work independently (Phase 4 exit criteria)
- ✅ US3 (P2): Shared code management via backend package (Phase 2 exit criteria)
- ✅ US4 (P3): Independent deployment pipelines (Phase 5 exit criteria)

### Risk Mitigation

**Highest Risk Tasks** (require extra attention):
- T031: Database migration move (test thoroughly)
- T073: Admin route import updates (400+ imports)
- T105: Storefront route import updates (500+ imports)
- T096: Dashboard E2E full suite (must pass 100%)
- T133: Storefront E2E full suite (must pass 100%)
- T156: Old src/ removal (point of no return without git revert)

**Rollback Points** (git commits after each phase):
- After T027: Can rollback to before monorepo setup
- After T065: Can rollback backend migration, keep monolith structure
- After T099: Can rollback dashboard migration
- After T137: Can rollback storefront migration
- After T155: Can rollback deployment setup

---

## Implementation Notes

**Parallelization Strategy**:
- Use two developer workstreams or git branches after Phase 1 complete
- Dashboard team works on Phase 3 tasks (T070-T099)
- Storefront team works on Phase 4 tasks (T100-T137)
- Merge both branches before Phase 5

**Testing Strategy**:
- Run E2E tests after every 10-15 tasks to catch regressions early
- Keep old monolith running in parallel during Phases 3-4 for comparison
- Use Cypress visual regression testing (optional) to catch UI differences

**Performance Monitoring**:
- Baseline measurements before starting (T163-T168 current state)
- Measure after each phase complete
- Document improvements in CHANGELOG.md

**Communication**:
- Daily standups during migration (15-20 day window)
- Demo deployments to stakeholders after Phases 3, 4, 5
- Feature freeze communicated to all team members before Phase 1 starts

---

**Tasks Complete** ✅  
Ready for implementation. Begin with Phase 0: Setup.
