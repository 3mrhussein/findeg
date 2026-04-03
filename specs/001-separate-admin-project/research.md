# Research & Technical Decisions: Separate Admin Dashboard Project

**Feature**: 001-separate-admin-project  
**Phase**: Phase 0 - Research  
**Date**: 2026-04-03

## Purpose

Document technical research, alternatives considered, and rationale for key architectural decisions in splitting the FindEg monolith into a three-package monorepo structure.

---

## 1. Monorepo Tooling Selection

### Decision: Turborepo + pnpm workspaces

**Rationale**:
- **Turborepo** provides intelligent build caching and task orchestration optimized for Next.js applications
- Zero-config defaults for Next.js projects reduce setup complexity
- Incremental builds cache intermediate artifacts, dramatically reducing rebuild times
- Task pipelines allow parallel execution of lint/test/build across packages
- Remote caching support for CI/CD (optional future enhancement)

**Alternatives Considered**:

| Tool | Pros | Cons | Why Rejected |
|------|------|------|--------------|
| **pnpm workspaces only** | Minimal tooling, simple dependency linking | No build orchestration, no caching, manual task coordination | Doesn't address build time reduction goals |
| **Nx** | Most powerful, generators, advanced features | Steeper learning curve, more complex config, overkill for 3 packages | Unnecessary complexity for this scale |
| **Lerna** | Mature, well-documented | Legacy tool, slower than modern alternatives, less Next.js optimization | Superseded by Turborepo for Next.js projects |

**Best Practices**:
- Use `turbo.json` to define task dependencies (e.g., `build` depends on `^build` in dependencies)
- Configure caching for expensive operations (TypeScript compilation, Next.js builds)
- Use `--filter` flag for package-specific operations during development
- Leverage Turborepo's `--cache-dir` for CI optimization

---

## 2. Code Sharing Strategy (Three-Package Architecture)

### Decision: Backend package as TypeScript library (no deployment)

**Rationale**:
- **Single Source of Truth**: All business logic, database access, and shared utilities live in one package
- **Simpler Deployment**: Only two deployable units (dashboard + storefront) instead of three separate services
- **Type Safety**: Direct TypeScript imports ensure compile-time type checking between packages
- **Zero Network Overhead**: Backend functions imported directly; no HTTP calls for shared logic
- **Developer Experience**: Monorepo workspace linking provides instant updates when backend changes

**Alternatives Considered**:

| Approach | Pros | Cons | Why Rejected |
|----------|------|------|--------------|
| **Three separate Next.js apps** | Backend can have API routes, separate scaling | Extra deployment complexity, backend would have unused Next.js features | Backend doesn't need UI rendering or deployment |
| **Backend as Node.js service** | True service separation, independent scaling | HTTP overhead between packages, API contract maintenance, deployment complexity | Overkill for shared library functionality |
| **Duplicate shared code** | No shared package needed, full independence | DRY violation, version drift, maintenance nightmare | Violates DRY principle and constitution |

**Implementation Notes**:
- Backend package exports repository interfaces, services, types, and utilities
- Dashboard and storefront import from `@findeg/backend` via pnpm workspace protocol
- Backend package has its own `tsconfig.json` with `composite: true` for project references
- Frontend packages use backend functions in API routes and Server Components

---

## 3. Database Ownership & Migration Strategy

### Decision: Backend package owns all database concerns

**Rationale**:
- **Single Responsibility**: Only backend package knows about database structure
- **Clean Architecture Compliance**: Dashboard and storefront are pure UI layers; backend is infrastructure layer
- **Migration Safety**: Single migration path prevents conflicts or duplicate migrations
- **Abstraction Layer**: Frontend packages depend on repository interfaces, not direct ORM access
- **Testability**: Backend package can be unit tested independently with mock database

**Alternatives Considered**:

| Approach | Pros | Cons | Why Rejected |
|----------|------|------|--------------|
| **Shared migrations in both packages** | Each package "owns" its tables | Migration conflicts, duplication, unclear ownership | Violates Single Responsibility |
| **Separate databases per package** | True data isolation | Data duplication, cross-cutting queries impossible, JOIN complexity | Overkill; shared entities need unified storage |

**Implementation Strategy**:
- All Drizzle schema files reside in `packages/backend/src/features/core/infrastructure/persistence/schema/`
- Migration scripts in `packages/backend/migrations/` (or root `/scripts/migrations/`)
- Frontend packages import repository interfaces: `import { IProductRepository } from '@findeg/backend/features/catalog'`
- Database connection pooling managed in backend package
- Migrations run via backend package scripts: `pnpm --filter @findeg/backend db:migrate`

---

## 4. Authentication & Session Management

### Decision: JWT tokens issued by backend's shared auth service

**Rationale**:
- **Stateless Design**: JWT tokens enable independent deployment of dashboard/storefront without shared session store
- **Cross-Domain Support**: Tokens work across different domains/subdomains (admin.findeg.com, shop.findeg.com)
- **Scalability**: No shared session store dependency (Redis); tokens are self-contained
- **Deployment Independence**: Frontend apps can be deployed to different hosts without session sync issues
- **Backend Abstraction**: Auth logic centralized in backend package; frontend apps just verify tokens

**Alternatives Considered**:

| Approach | Pros | Cons | Why Rejected |
|----------|------|------|--------------|
| **Separate auth per package** | Full independence | Users must log in twice, poor UX, duplicate auth logic | Terrible user experience |
| **Shared session store (Redis)** | Familiar pattern, server-side session control | Requires shared infrastructure, deployment coupling, same-domain requirement | Limits deployment flexibility |

**Implementation Notes**:
- Backend exports `generateJWT()`, `verifyJWT()`, `refreshToken()` functions
- Tokens stored in HTTP-only cookies (XSS protection) with SameSite and Secure flags
- Dashboard and storefront middleware verify tokens using backend's auth utilities
- Token payload contains user ID, roles, and permissions for authorization
- Refresh token rotation for security (short-lived access tokens, longer-lived refresh tokens)

**Security Considerations**:
- Access tokens expire in 15 minutes; refresh tokens in 7 days
- CSRF protection via double-submit cookie pattern for Server Actions
- Tokens signed with `HS256` or `RS256` (asymmetric recommended for production)
- Backend provides `@requireAuth` decorator for protecting Server Actions/API routes

---

## 5. UI Component Sharing Strategy

### Decision: Duplicate shadcn/ui components in both frontend packages

**Rationale**:
- **Independent Customization**: Dashboard and storefront can evolve their design systems independently
- **Deployment Flexibility**: No shared component library deployment needed
- **Simplicity**: Avoids complexity of versioning and distributing UI components
- **Initial State**: Both apps start with identical components; divergence is optional and as-needed

**Alternatives Considered**:

| Approach | Pros | Cons | Why Rejected |
|----------|------|------|--------------|
| **Backend exports all UI components** | Single source of truth, guaranteed consistency | Backend package includes React/UI dependencies (violates separation of concerns), limits customization | Backend should not contain UI code |
| **Separate UI package** | Clean separation, shared design system | Extra package overhead, versioning complexity for 2 consumers | Unnecessary for initial implementation |

**Implementation Strategy**:
- shadcn/ui components duplicated from `src/components/ui/` to `packages/dashboard/src/components/ui/` and `packages/storefront/src/components/ui/`
- Shared components initially duplicated; can be extracted to backend or separate package later if needed
- Tailwind CSS config duplicated or extended from shared base
- Design tokens (CSS variables) initially identical; divergence allowed per spec requirements

**Future Optimization** (if duplication becomes problematic):
- Extract to `packages/ui` shared package if both apps need synchronized components
- Use Turborepo's internal packages for shared UI library
- Version UI components separately if dashboard/storefront design systems diverge significantly

---

## 6. Test Migration Strategy

### Decision: Migrate tests to their respective packages with no coverage loss

**Test Classification**:

| Test Type | Current Location | Migrate To | Tooling |
|-----------|-----------------|------------|---------|
| **E2E - Admin** | `cypress/e2e/admin/` | `packages/dashboard/cypress/e2e/` | Cypress |
| **E2E - Storefront** | `cypress/e2e/shop/`, `cypress/e2e/auth/` | `packages/storefront/cypress/e2e/` | Cypress |
| **Unit - Backend Logic** | `src/features/*/tests/` | `packages/backend/src/features/*/tests/` | Vitest or Jest |
| **Integration - API Routes** | New | `packages/dashboard/tests/`, `packages/storefront/tests/` | Vitest with Next.js integration |

**Implementation Notes**:
- Cypress configuration duplicated per package with package-specific base URLs
- Shared Cypress support code (commands, assertions) duplicated initially
- Backend package gets unit tests for repository interfaces, services, and utilities
- Test fixtures and mock data migrated with their respective packages
- CI pipeline updated to run tests per package: `turbo run test --filter=dashboard storefront backend`

---

## 7. Build & Deployment Strategy

### Decision: Two independent Next.js deployments (dashboard, storefront)

**Rationale**:
- **Independent Releases**: Security patches or features can be deployed to one app without affecting the other
- **Separate Domains**: `admin.findeg.com` for dashboard, `shop.findeg.com` (or `findeg.com`) for storefront
- **Performance Isolation**: Storefront performance issues don't impact admin dashboard availability
- **Scaling Granularity**: Scale customer-facing storefront independently from admin dashboard

**Deployment Configuration**:

| Package | Deployment Target | Build Command | Environment |
|---------|------------------|---------------|-------------|
| **dashboard** | Vercel (or similar) | `turbo run build --filter=dashboard` | `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `DATABASE_URL` |
| **storefront** | Vercel (or similar) | `turbo run build --filter=storefront` | `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `DATABASE_URL` |
| **backend** | N/A (library only) | `turbo run build --filter=backend` | Bundled with frontend apps |

**CI/CD Pipeline** (GitHub Actions example):
```yaml
# Simplified workflow
jobs:
  build-dashboard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm turbo run build --filter=dashboard
      - run: pnpm turbo run test --filter=dashboard
      - uses: vercel/action@v1 # Deploy dashboard
  
  build-storefront:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm turbo run build --filter=storefront
      - run: pnpm turbo run test --filter=storefront
      - uses: vercel/action@v1 # Deploy storefront
```

**Environment Variable Management**:
- Shared variables (DATABASE_URL, JWT_SECRET) replicated to both deployments
- Package-specific variables (NEXT_PUBLIC_APP_NAME) differentiated per app
- Use Vercel environment variables or GitHub Secrets for sensitive values

---

## 8. Migration Execution Strategy

### Decision: One-time cutover migration with feature freeze

**Rationale**:
- **Simplicity**: Gradual migration would require maintaining both old and new structures simultaneously
- **Clean Break**: Avoids hybrid state complexity and long-running migration branches
- **Reduced Risk**: All changes tested together before cutover; easier rollback if issues arise

**Migration Phases**:

1. **Phase 1: Monorepo Setup** (2-3 days)
   - Create Turborepo configuration (`turbo.json`, `pnpm-workspace.yaml`)
   - Set up three package directories with initial `package.json` and `tsconfig.json`
   - Configure build pipeline and verify empty packages build successfully

2. **Phase 2: Backend Package Migration** (3-5 days)
   - Move `src/features/core/`, `src/features/identity/`, `src/features/media/` to `packages/backend/`
   - Move database schemas and migrations to backend package
   - Export repository interfaces, services, types from backend
   - Write unit tests for backend exports

3. **Phase 3: Dashboard Package Migration** (4-6 days)
   - Move `src/app/[locale]/admin/` routes to `packages/dashboard/`
   - Move `src/features/administration/` to dashboard package
   - Duplicate `src/components/ui/` and `src/components/shared/` to dashboard
   - Update imports to reference `@findeg/backend`
   - Migrate admin Cypress tests to dashboard package
   - Verify dashboard builds and E2E tests pass

4. **Phase 4: Storefront Package Migration** (4-6 days)
   - Move `src/app/[locale]/(storefront)/`, `(auth)/`, `(school-list)/` to `packages/storefront/`
   - Move `src/features/cart/`, `catalog/`, `order/`, `review/`, `school/`, `notifications/` to storefront
   - Duplicate UI components to storefront
   - Update imports to reference `@findeg/backend`
   - Migrate storefront Cypress tests to storefront package
   - Verify storefront builds and E2E tests pass

5. **Phase 5: Cleanup & Deployment** (2-3 days)
   - Remove old `src/` directory after confirming all code migrated
   - Update root package.json scripts to use Turborepo commands
   - Update CI/CD pipeline for multi-package builds
   - Deploy dashboard to staging, verify functionality
   - Deploy storefront to staging, verify functionality
   - Production cutover after final QA approval

**Rollback Plan**:
- Git commit after each phase for incremental rollback capability
- Keep old structure in git history with clear commit messages
- Feature branch `001-separate-admin-project` merges only after full migration complete

---

## 9. Performance Optimization Research

### Next.js 16 Features for Build Time Reduction

**Partial Prerendering (PPR)**:
- Enable PPR for dashboard and storefront to render static shell with dynamic content
- Reduces Time to First Byte (TTFB) for authenticated routes
- Configure via `experimental.ppr` in `next.config.ts`

**React 19 Server Components**:
- Maximize Server Component usage to reduce client bundle size
- Use `async` Server Components for data fetching (no loading states needed)
- Leverage Suspense boundaries for progressive rendering

**Turborepo Caching**:
- Configure `.turbo/cache/` for local build artifact caching
- Remote caching via Vercel or custom cloud storage (future enhancement)
- Cache keys based on file content hashes (automatic)

**Code Splitting**:
- Next.js automatically splits by route; no manual intervention needed
- Use `dynamic()` for heavy client components (charts, editors)
- Implement route groups to avoid layout re-renders during navigation

**Bundle Analysis**:
- Run `@next/bundle-analyzer` per package to identify large dependencies
- Target: dashboard bundle <500KB gzipped, storefront <800KB gzipped
- Consider lazy loading for admin-heavy features (analytics dashboards, bulk editors)

**TypeScript Compilation**:
- Use TypeScript project references (`tsconfig.references`) between packages
- Enable `incremental: true` in `tsconfig.json` for faster rebuilds
- Configure Turborepo to cache `tsbuildinfo` files

---

## 10. Risk Mitigation Strategies

### Risk: Breaking Changes During Migration

**Mitigation**:
- Snapshots tests before migration (E2E test results, screenshots, bundle sizes)
- Parallel development frozen during migration (feature freeze)
- Comprehensive E2E test suite must pass 100% before merging
- Staged rollout: dashboard first (lower user impact), then storefront

### Risk: Shared Database Migration Conflicts

**Mitigation**:
- Backend package is single source of truth for migrations
- No migrations run during package split (schema freeze)
- Database backup before production cutover
- Blue-green deployment with rollback capability

### Risk: Authentication Issues Across Packages

**Mitigation**:
- Test cross-domain authentication in staging environment
- Verify JWT token expiration, refresh, and revocation flows
- Load test auth endpoints before production cutover
- Monitor auth error rates post-deployment

### Risk: Build Time Reduction Not Achieved

**Mitigation**:
- Benchmark current build times before starting: `time npm run build`
- Measure package build times during migration: `turbo run build --filter=dashboard --summarize`
- Profile build bottlenecks with Next.js build analyzer
- Iterate on Turborepo caching configuration if targets not met

---

## Summary of Decisions

| Decision Point | Choice | Key Benefit |
|---------------|--------|-------------|
| **Monorepo Tool** | Turborepo + pnpmworkspaces | Intelligent caching, Next.js optimization |
| **Package Architecture** | 3 packages: dashboard, storefront, backend (library) | Independent deployment, shared logic |
| **Database Ownership** | Backend package owns all schema/migrations | Single source of truth, Clean Architecture |
| **Authentication** | JWT tokens from backend auth service | Stateless, cross-domain support |
| **UI Components** | Duplicated in both frontend packages | Independent customization |
| **Migration Strategy** | One-time cutover with feature freeze | Simplicity, clean break |

**Research Complete** ✅  
All technical unknowns resolved. Proceeding to Phase 1: Design (data-model.md, contracts/, quickstart.md).
