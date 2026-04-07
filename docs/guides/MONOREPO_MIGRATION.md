# FindEg Monorepo Migration Strategy

**Feature**: 001-separate-admin-project  
**Date**: April 2026  
**Status**: In Progress  
**Branch**: `001-separate-admin-project`

## Executive Summary

This document outlines the strategy for migrating the FindEg.com monolithic Next.js application into a three-package Turborepo monorepo. The migration splits the codebase into:

1. **`packages/backend`** - TypeScript library (shared business logic, database access, utilities)
2. **`packages/dashboard`** - Next.js admin application
3. **`packages/storefront`** - Next.js customer-facing application

**Goals**: Reduce build times by 50%, enable independent development workflows, improve developer experience, and prepare for independent deployment pipelines—all with zero functionality regression.

## Motivation

### Current Pain Points

- **Long build times**: Full application rebuild takes 4+ minutes
- **Cognitive overload**: Developers must navigate admin and storefront code simultaneously
- **Tight coupling**: Admin code changes trigger unnecessary storefront rebuilds
- **Slow HMR**: Hot module replacement slowed by irrelevant code in watch mode
- **Bundle bloat**: Admin routes included in customer bundle and vice versa
- **Limited scalability**: Cannot scale admin and storefront independently

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Dashboard build time | 4+ min | <2 min | 50%+ faster |
| Storefront build time | 4+ min | <2.5 min | 37.5%+ faster |
| TypeScript compilation | 2-3 min | <30 sec/pkg | 75%+ faster |
| HMR speed | ~5-10 sec | ~2-5 sec | 50% faster |
| Dashboard bundle | ~1.2 MB | <500 KB | 58% smaller |
| Storefront bundle | ~1.5 MB | <800 KB | 47% smaller |

## Architecture Overview

### Three-Package Structure

```
findeg.stationary/
├── packages/
│   ├── backend/          # TypeScript library (no deployment)
│   │   ├── src/
│   │   │   ├── features/     # Core, identity, media features
│   │   │   ├── lib/          # Utilities, helpers
│   │   │   └── types/        # Shared TypeScript types
│   │   └── package.json      # @backend
│   │
│   ├── dashboard/        # Admin Next.js app (deploys to admin.findeg.com)
│   │   ├── src/
│   │   │   ├── app/[locale]/admin/  # Admin routes only
│   │   │   ├── features/administration/
│   │   │   └── components/   # Duplicated UI components
│   │   └── package.json      # Depends on @backend
│   │
│   └── storefront/       # Customer Next.js app (deploys to findeg.com)
│       ├── src/
│       │   ├── app/[locale]/(storefront)/  # Customer routes
│       │   ├── features/     # Cart, catalog, order, review, school
│       │   └── components/   # Duplicated UI components
│       └── package.json      # Depends on @backend
├── turbo.json            # Turborepo task orchestration
└── pnpm-workspace.yaml   # Workspace package linking
```

### Key Architectural Decisions

#### 1. Backend as TypeScript Library (Not a Service)

**Decision**: Backend package is a library imported directly by frontend packages, not a deployed service.

**Rationale**:
- Simplifies deployment (2 apps vs 3 services)
- Zero network overhead (direct function calls, not HTTP)
- Type safety across package boundaries
- Instant updates when backend changes (via Turborepo rebuild)
- No API contract maintenance burden

**Alternative Rejected**: Microservices architecture—unnecessary complexity for shared library functionality.

#### 2. Database Ownership: Backend Package Only

**Decision**: All database schema, migrations, and ORM configuration reside in `packages/backend`.

**Rationale**:
- Single Responsibility Principle at package level
- Clean Architecture compliance (backend = infrastructure, frontends = UI)
- Prevents migration conflicts
- Frontend packages import repository interfaces, not ORM directly

**Implementation**:
- Drizzle schema: `packages/backend/src/features/core/infrastructure/persistence/schema/`
- Migrations: `packages/backend/scripts/migrations/` (or root `scripts/migrations/`)
- Frontend access: `import { IProductRepository } from '@backend/features/catalog'`

#### 3. Authentication Strategy: Shared JWT Service

**Decision**: Backend package exports JWT token generation/verification; frontend apps consume these utilities.

**Rationale**:
- Stateless design enables independent deployment
- Works across different domains (`admin.findeg.com`, `shop.findeg.com`)
- No shared session store (Redis) required
- Centralized auth logic (DRY principle)

**Security Model**:
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry with rotation
- HTTP-only cookies for XSS protection
- CSRF protection via double-submit cookie pattern

#### 4. UI Component Strategy: Duplication for Independence

**Decision**: shadcn/ui components duplicated in both frontend packages initially.

**Rationale**:
- Dashboard and storefront can customize independently
- No shared UI library versioning complexity
- Simpler initial implementation
- Divergence allowed as design systems evolve

**Future Option**: Extract to `packages/ui` if design systems converge and duplication becomes burdensome.

#### 5. Test Migration: Per-Package Ownership

**Test Distribution**:
- Admin E2E tests → `packages/dashboard/cypress/`
- Storefront E2E tests → `packages/storefront/cypress/`
- Backend unit tests → `packages/backend/src/features/*/tests/`
- Integration tests → Per-package `tests/` directories

**Coverage Target**: Zero regression—100% of existing tests must pass post-migration.

## Migration Phases

### Phase 0: Setup (2-3 days)

**Objective**: Initialize monorepo infrastructure with verified build pipeline.

**Key Tasks**:
1. Install Turborepo globally
2. Create `turbo.json` with build/dev/lint/test task configuration
3. Create `pnpm-workspace.yaml` defining three packages
4. Scaffold package directories and `package.json` files
5. Configure TypeScript project references (`composite: true`)
6. Verify build caching and HMR in dev mode

**Exit Criteria**:
- ✅ `turbo run build` completes successfully for all packages
- ✅ Dashboard accessible at `localhost:3001`
- ✅ Storefront accessible at `localhost:3000`
- ✅ Turborepo caching operational (second build uses cache)

### Phase 1: Foundational - Backend Package (3-5 days)

**Objective**: Migrate core features, database layer, and shared utilities to backend package.

**Key Tasks**:
1. Move `src/features/core/`, `src/features/identity/`, `src/features/media/` to `packages/backend/`
2. Move Drizzle schema files and update `drizzle.config.ts`
3. Implement repository interfaces (`IUserRepository`, `IProductRepository`, etc.)
4. Implement authentication service (`IAuthService`) with JWT utilities
5. Create Zod validation schemas and TypeScript types
6. Migrate translation files (`messages/en.json`, `messages/ar.json`)
7. Write unit tests for backend services and repositories

**Exit Criteria**:
- ✅ Backend package exports all repository interfaces
- ✅ Authentication service functional (JWT token generation/verification)
- ✅ Backend unit tests pass (>80% coverage)
- ✅ Frontend packages can successfully import from `@backend`

**Blocker**: This phase must complete before Phases 3 & 4 (frontend migrations).

### Phase 2: User Story 3 - Shared Code Management

**Objective**: Verify shared code propagation through backend package.

**Key Tasks** (integrated with Phase 1):
1. Test shared code update workflow (modify backend → frontend rebuilds)
2. Test type safety (backend interface change → frontend compile error)
3. Document shared code workflow in `quickstart.md`
4. Add pre-commit hook validating backend exports

**Exit Criteria**:
- ✅ Backend changes trigger frontend rebuilds via Turborepo dependency graph
- ✅ TypeScript enforces compile-time type safety across packages
- ✅ Documentation complete for shared code update workflow

### Phase 3: User Story 1 - Dashboard Migration (4-6 days)

**Objective**: Migrate admin dashboard to independent package.

**Key Tasks**:
1. Move `src/app/[locale]/admin/` to `packages/dashboard/src/app/[locale]/admin/`
2. Move `src/features/administration/` to `packages/dashboard/`
3. Update all imports to use `@backend` instead of relative paths
4. Duplicate `src/components/ui/` and `src/components/shared/` to dashboard
5. Copy Tailwind config, globals.css, admin-specific assets
6. Migrate admin E2E tests to `packages/dashboard/cypress/`
7. Configure dashboard-specific environment variables

**Exit Criteria**:
- ✅ Dashboard builds in <2 minutes
- ✅ All admin E2E tests pass (zero regression)
- ✅ Dashboard bundle <500KB gzipped (no storefront code)
- ✅ HMR 50% faster than baseline

**Can Run in Parallel with Phase 4** after Phase 1 completes.

### Phase 4: User Story 2 - Storefront Migration (4-6 days)

**Objective**: Migrate customer-facing storefront to independent package.

**Key Tasks**:
1. Move `src/app/[locale]/(storefront)/`, `(auth)/`, `(school-list)/` to `packages/storefront/`
2. Move `src/features/cart/`, `catalog/`, `order/`, `review/`, `school/`, `notifications/` to storefront
3. Update imports to use `@backend`
4. Duplicate UI components to storefront
5. Copy Tailwind config, globals.css, storefront assets
6. Migrate storefront E2E tests to `packages/storefront/cypress/`
7. Configure storefront environment variables

**Exit Criteria**:
- ✅ Storefront builds in <2.5 minutes
- ✅ All storefront E2E tests pass (zero regression)
- ✅ Storefront bundle <800KB gzipped (no admin code)
- ✅ HMR 50% faster than baseline

**Can Run in Parallel with Phase 3** after Phase 1 completes.

### Phase 5: User Story 4 - Deployment Independence (2-3 days)

**Objective**: Enable independent deployment pipelines for dashboard and storefront.

**Key Tasks**:
1. Create `.github/workflows/dashboard-deploy.yml`
2. Create `.github/workflows/storefront-deploy.yml`
3. Configure separate Vercel projects (or hosting platform)
4. Set up environment variables per app (GitHub secrets, Vercel dashboard)
5. Test independent and parallel deployments
6. Configure rollback procedures
7. Set up monitoring (error tracking, performance)

**Exit Criteria**:
- ✅ Dashboard and storefront have separate CI/CD workflows
- ✅ Deployments can run independently without affecting each other
- ✅ Deployments can run in parallel without conflicts
- ✅ Rollback works independently per app

### Phase 6: Polish & Verification (2-3 days)

**Objective**: Final cleanup, performance validation, and documentation updates.

**Key Tasks**:
1. Remove old `src/` directory after final verification
2. Update root `package.json`, `tsconfig.json`, `.gitignore`
3. Remove old Cypress configuration
4. Benchmark build times and bundle sizes
5. Run full E2E test suite (100% pass rate required)
6. Update `README.md`, `docs/guides/DEVELOPMENT.md`, architecture docs
7. Verify bilingual support, authentication, database access
8. Create production deployment plan and rollback script

**Exit Criteria**:
- ✅ All old monolith code removed
- ✅ All performance targets met
- ✅ 100% E2E test pass rate
- ✅ Documentation complete and accurate
- ✅ Production deployment plan documented

## Risk Mitigation

### Rollback Strategy

**Git Commits After Each Phase**: Enables clean rollback to any phase.

- After Phase 0 (T027): Rollback to pre-monorepo setup
- After Phase 1 (T065): Rollback backend migration
- After Phase 3 (T099): Rollback dashboard migration
- After Phase 4 (T137): Rollback storefront migration
- After Phase 5 (T155): Rollback deployment setup

**Parallel Monolith**: Keep old monolith running during migration for comparison and emergency fallback.

### High-Risk Tasks

| Task | Risk | Mitigation |
|------|------|------------|
| T031: Database migration | Schema conflicts | Thorough testing in dev environment before production |
| T073: Admin route imports | 400+ imports to update | Automated refactoring with test verification |
| T105: Storefront route imports | 500+ imports to update | Automated refactoring with test verification |
| T096: Dashboard E2E suite | Regression risk | Run tests after every 10-15 tasks |
| T133: Storefront E2E suite | Regression risk | Run tests incrementally during migration |
| T156: Old src/ removal | Point of no return | Full E2E test pass before deletion |

### Testing Strategy

- **Incremental E2E Testing**: Run tests after every 10-15 tasks
- **Visual Regression Testing**: Optional Cypress visual tests for UI consistency
- **Comparison Testing**: Run old monolith and new packages side-by-side
- **Performance Baselines**: Measure before migration for comparison

## Communication Plan

### Stakeholders

- **Development Team**: Daily standups, demo deployments after each phase
- **Product/Design**: Demos after Phases 3, 4, 5 to verify zero UX changes
- **DevOps/Operations**: Coordinate deployment pipeline setup in Phase 5
- **QA/Testing**: Early involvement for E2E test migration planning

### Feature Freeze

**Duration**: 15-20 days during migration  
**Scope**: No new features or major refactors during migration window  
**Emergency Protocol**: Critical bug fixes allowed with immediate test verification

## Success Metrics

### Performance Targets

- ✅ Dashboard build time: <2 minutes (50% improvement)
- ✅ Storefront build time: <2.5 minutes (37.5% improvement)
- ✅ TypeScript compilation: <30 seconds per package (75% improvement)
- ✅ HMR speed: 50% faster (2-5 seconds)
- ✅ Dashboard bundle: <500KB gzipped (58% reduction)
- ✅ Storefront bundle: <800KB gzipped (47% reduction)

### Quality Gates

- ✅ Zero functionality regression (all E2E tests pass)
- ✅ Zero security regressions (auth flow unchanged)
- ✅ Zero accessibility regressions (Lighthouse scores maintained)
- ✅ Zero i18n regressions (EN + AR translations work)
- ✅ Clean Architecture compliance maintained
- ✅ Type safety preserved (strict TypeScript mode)

### Developer Experience

- ✅ Independent development workflows (dashboard/storefront teams can work in parallel)
- ✅ Faster feedback loops (build/test/lint per package)
- ✅ Reduced cognitive load (smaller codebase per package)
- ✅ Clear dependency contracts (backend exports well-documented)

## Timeline

**Total Estimated Duration**: 15-20 days with feature freeze

| Phase | Duration | Can Parallelize |
|-------|----------|-----------------|
| Phase 0: Setup | 2-3 days | High |
| Phase 1: Backend | 3-5 days | Medium |
| Phase 2: US3 Verification | Integrated | N/A |
| Phase 3: Dashboard | 4-6 days | ✅ After Phase 1 |
| Phase 4: Storefront | 4-6 days | ✅ After Phase 1 |
| Phase 5: Deployment | 2-3 days | Medium |
| Phase 6: Polish | 2-3 days | Low |

**Critical Path**: Phase 0 → Phase 1 → (Phase 3 || Phase 4) → Phase 5 → Phase 6

**Parallel Execution Opportunity**: Phases 3 and 4 can run simultaneously on separate branches/workstreams after Phase 1 completes.

## Next Steps

1. **Finalize migration timeline** with team (schedule feature freeze window)
2. **Assign workstreams** (Dashboard team vs Storefront team for parallel Phase 3/4 execution)
3. **Baseline measurements** (current build times, bundle sizes, test execution times)
4. **Begin Phase 0** (initialize Turborepo infrastructure)

## References

- **Spec**: [specs/001-separate-admin-project/spec.md](../../specs/001-separate-admin-project/spec.md)
- **Plan**: [specs/001-separate-admin-project/plan.md](../../specs/001-separate-admin-project/plan.md)
- **Research**: [specs/001-separate-admin-project/research.md](../../specs/001-separate-admin-project/research.md)
- **Tasks**: [specs/001-separate-admin-project/tasks.md](../../specs/001-separate-admin-project/tasks.md)
- **Quickstart**: [specs/001-separate-admin-project/quickstart.md](../../specs/001-separate-admin-project/quickstart.md)

---

**Maintained by**: FindEg Development Team  
**Last Updated**: April 2026
