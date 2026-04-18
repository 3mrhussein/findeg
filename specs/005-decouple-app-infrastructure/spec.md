# Feature Specification: Decouple App Infrastructure Dependencies

**Feature Branch**: `005-decouple-app-infrastructure`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "Make sure that apps do not depend on infrastructure implementations, they should depend on domain abstractions & services"

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Feature enforces 4-layer structure; **eliminates** cross-layer infrastructure imports from apps
- **II. Server-Components First**: All new UI uses Server Components by default; Client Components justified for interactivity only
- **III. Bilingual & RTL-First**: Not applicable - this is an architectural refactoring
- **IV. Feature-Oriented Core Kernel**: Ensures apps depend only on backend's application and presentation layers, not infrastructure
- **V. Type-Safe & Testable**: Zod schemas at boundaries; TypeScript strict mode; tests verify no infrastructure bleeding
- **VI. DRY Principle**: Eliminates duplicated infrastructure code across apps; single source of truth in backend
- **VII. SOLID Design**: **Enforces Dependency Inversion** - high-level modules (apps) don't depend on low-level modules (infrastructure)

---

## Clarifications

### Session 2026-04-06

**Q1: How should infrastructure boundary violations be detected and reported?**
→ A: TypeScript compiler errors only (via package.json exports restrictions) - fails during `tsc` compilation. This provides earliest feedback at IDE/compile time and leverages TypeScript's native type checking without additional tooling.

**Q2: Backend caching architecture - where should "use cache" directives live?**
→ A: Backend MUST export pure TypeScript functions (e.g., `getCategories(locale)`) with NO Next.js dependencies. Apps (dashboard, storefront) create data layer at `src/data/{feature}/{queries|actions}.ts` that wraps backend calls with "use cache"/"use server" directives and cache tags. Example:
  - Backend exports: `export async function getCategories(locale: string): Promise<Category[]>`
  - App wraps: `"use cache"; cacheTag('categories'); return await backend.getCategories(locale);`

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Can Build Apps Without Infrastructure Leakage (Priority: P1)

Developers need to build the monorepo apps (dashboard, storefront) for production without database/infrastructure code being bundled into client-side JavaScript, which currently blocks e2e test execution.

**Why this priority**: This is blocking critical test pipeline functionality. The build currently fails because infrastructure code (postgres, drizzle-orm, fs, tls, net) is being pulled into client bundles through incorrect dependency chains.

**Independent Test**: Can be fully tested by running `npm run build` from the monorepo root and verifying:
1. Both dashboard and storefront build successfully
2. No Node.js-only modules (postgres, fs, tls, net) appear in client bundle errors
3. Build output shows clean separation between server and client code

**Acceptance Scenarios**:

1. **Given** a developer runs `npm run build`, **When** the build process completes, **Then** both dashboard and storefront apps build without module resolution errors
2. **Given** a developer runs `npm run test:e2e`, **When** the e2e test suite executes, **Then** the build phase completes successfully and e2e tests run against production builds
3. **Given** infrastructure code in backend, **When** apps import from backend, **Then** only application-layer exports (use cases, actions, hooks) are accessible, not infrastructure implementations

---

### User Story 2 - Apps Consume Backend Through Well-Defined Interfaces (Priority: P2)

Apps (dashboard, storefront) must consume backend functionality through application layer interfaces (use cases, Server Actions, presentation hooks) rather than directly accessing infrastructure layer implementations (repositories, database clients).

**Why this priority**: This enforces Clean Architecture boundaries and enables independent evolution of infrastructure without breaking apps. Critical for maintainability and preventing architectural erosion.

**Independent Test**: Can be tested by:
1. Examining import statements in app code - none should reference `*/infrastructure/*` paths
2. Running TypeScript compilation - infrastructure modules should not be resolvable from app contexts
3. Checking bundle analysis - no infrastructure dependencies in app bundles

**Acceptance Scenarios**:

1. **Given** an app component needs data, **When** the developer imports functionality, **Then** they can only import from `@backend/features/[feature]` (which exposes application layer) not from infrastructure paths
2. **Given** a backend feature's infrastructure changes, **When** apps are rebuilt, **Then** no changes are required in app code (interfaces remain stable)
3. **Given** a developer tries to import infrastructure code from an app, **When** TypeScript compiles, **Then** a clear error message indicates the violation

---

### User Story 3 - Infrastructure Implementations Can Change Independently (Priority: P3)

Backend infrastructure implementations (database choice, ORM, storage providers) can be swapped or refactored without requiring changes to app code, as long as application layer contracts remain stable.

**Why this priority**: This validates proper dependency inversion and ensures long-term maintainability. Lower priority as it's more about future-proofing than immediate functionality.

**Independent Test**: Can be tested by:
1. Changing a repository implementation in backend/infrastructure
2. Verifying apps still build and function without modification
3. Confirming app imports only reference abstract interfaces

**Acceptance Scenarios**:

1. **Given** a repository implementation changes from Drizzle to Prisma, **When** backend is rebuilt with new implementation, **Then** apps continue to function without code changes
2. **Given** database client configuration changes, **When** infrastructure layer is updated, **Then** application layer interface remains unchanged and apps are unaffected

---

### Edge Cases

- What happens when a developer accidentally tries to import infrastructure code from an app? → TypeScript compiler will fail during `tsc` compilation with module resolution error due to package.json exports restrictions preventing access to infrastructure paths
- How does the system handle monorepo path resolution across package boundaries? → TypeScript path aliases must respect layer boundaries; apps can only resolve paths to backend's exported application/presentation layers
- What if duplicated infrastructure code exists in both app and backend? → Must be consolidated into backend, apps reference through application layer; backend exports pure functions, apps wrap with cache directives

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Apps (dashboard, storefront) MUST NOT directly import from backend infrastructure layer  (`*/infrastructure/*` paths)
- **FR-002**: Apps MUST only consume backend functionality through exported application layer interfaces (use cases, Server Actions, hooks from presentation layer)
- **FR-003**: Backend infrastructure code MUST NOT be accessible from apps via package.json exports field restrictions
- **FR-004**: Storefront MUST NOT contain its own infrastructure implementations for features already implemented in backend
- **FR-005**: TypeScript path resolution MUST enforce layer boundaries -infrastructure modules must not be resolvable from app contexts
- **FR-006**: TypeScript compilation MUST fail with module resolution errors when apps attempt to import infrastructure code (enforced via package.json exports field)
- **FR-007**: All data access from apps MUST go through backend application layer (use cases) or presentation layer (hooks, actions)
- **FR-008**: Apps MUST configure serverExternalPackages in Next.js config to prevent Node.js-only packages from client bundling; backend MUST remain framework-agnostic with no React/Next.js dependencies (no "use cache", no imports from 'next/cache')
- **FR-009**: Apps MUST depend on domain abstractions (interfaces, types) from backend/domain and backend/application layers only
- **FR-010**: Infrastructure dependencies (postgres, drizzle-orm, fs, etc.) MUST be listed in `serverExternalPackages` in Next.js config
- **FR-011**: Backend application layer MUST export pure TypeScript functions; apps MUST create separate data layer (src/data/*) that wraps backend calls with Next.js cache directives

### Key Entities

- **Backend Package**: Contains domain, application, infrastructure, and presentation layers; only exposes application and presentation through package exports
- **App Packages**: Dashboard and storefront apps; consume backend through well-defined interfaces
- **Infrastructure Layer**: Database repositories, storage providers, external service clients; isolated in backend package
- **Application Layer**: Use cases, domain logic, repository interfaces; expose to apps through backend package exports
- **Presentation Layer**: React hooks, Server Actions, view models; provide app-friendly interfaces to application layer

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of app imports from backend must reference application or presentation layers only (0 direct infrastructure imports)
- **SC-002**: Production builds of BOTH dashboard AND storefront combined complete successfully in under 3 minutes without module resolution errors
- **SC-003**: E2e test pipeline (`npm run test:e2e`) completes successfully without build failures
- **SC-004**: No Node.js-only modules (fs, net, tls, postgres, drizzle-orm) appear in client bundle analysis for dashboard or storefront
- **SC-005**: TypeScript compilation with strict mode passes without errors for all packages
- **SC-006**: Zero instances of infrastructure code duplication between apps and backend

## Assumptions

- The backend package already has a proper Clean Architecture structure with distinct layers (domain, application, infrastructure, presentation)
- Existing functionality in apps that directly accesses infrastructure can be migrated to use backend application layer without behavioral changes
- The build tooling (Next.js, Turbopack) supports proper server/client code splitting via package.json exports and serverExternalPackages
- Backend package remains framework-agnostic (no Next.js or React dependencies)
- Apps are willing to accept the constraint of accessing data only through backend's application layer (this may require creating new use cases if they don't exist)
- TypeScript path resolution configuration (`tsconfig.json` paths) can be adjusted to enforce layer boundaries without breaking existing valid imports
- The monorepo uses pnpm workspaces with proper package boundaries already defined
- Node.js version supports ES modules and the `exports` field in package.json (assumed based on Next.js 16 requirement)
