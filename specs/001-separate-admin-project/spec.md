# Feature Specification: Separate Admin Dashboard Project

**Feature Branch**: `001-separate-admin-project`  
**Created**: April 3, 2026  
**Status**: Draft  
**Input**: User description: "Codebase splitting, I want to split the admin dashboard into a separate project that uses same technology as this one, because the codebase are becoming bigger and bigger, so i want to split storefront & admin dashboard into separate projects"

## Clarifications

### Session 2026-04-03

- Q: Which monorepo tool should be used to manage workspace dependencies and build orchestration? → A: Turborepo + pnpm workspaces
- Q: Where should database schema files and migration scripts live, and which package runs the migrations? → A: Backend package owns all database concerns (schema, migrations, Drizzle ORM config) and provides abstracted shared business logic; dashboard/storefront access DB only through backend's exported repository interfaces
- Q: How should authentication and session sharing work between dashboard and storefront packages? → A: Shared auth service in backend with JWT tokens; backend exports auth APIs and issues JWT tokens, dashboard/storefront verify tokens via backend utilities
- Q: How should the three packages be deployed? → A: Two Next.js apps + backend as library only; backend is a TypeScript package with no deployment imported by dashboard/storefront for SSR/API routes
- Q: Where should shared UI components live in the monorepo structure? → A: Duplicate in both frontend packages; each frontend app has its own copy of components/ui and components/shared allowing per-app customization

**Additional Technical Requirements**:

- All UI components MUST be shadcn-based (shadcn/ui with Radix UI primitives)
- Implementation MUST follow latest React and Next.js 16 best practices as documented in Technical Constraints section below

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Both separated projects maintain 4-layer structure (domain/application/infrastructure/presentation); no cross-feature infrastructure imports
- **II. Server-Components First**: Existing UI patterns (Server Components by default) preserved in both projects
- **III. Bilingual & RTL-First**: All UI text in BOTH `en.json` and `ar.json` maintained; logical Tailwind classes preserved
- **IV. Feature-Oriented Core Kernel**: Shared core features extracted to common package; features remain self-contained
- **V. Type-Safe & Testable**: Zod schemas at boundaries preserved; TypeScript strict mode maintained; existing tests migrated
- **VI. DRY Principle**: Shared code extracted once to avoid duplication across projects
- **VII. SOLID Design**: Separation improves Single Responsibility at project level; existing SOLID principles maintained

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Independent Codebase Development (Priority: P1)

As a developer working on the admin dashboard, I want to work in a separate codebase so that I can develop, build, and test admin features without loading the entire storefront code, reducing cognitive overhead and improving build times.

**Why this priority**: This is the core value proposition - enabling independent development and reducing build complexity. Without this, the split serves no purpose.

**Independent Test**: Developer can clone only the admin project, install dependencies, run dev server, and access all admin functionality without any storefront code present. Build completes in under 2 minutes (vs current 4+ minutes).

**Acceptance Scenarios**:

1. **Given** a developer clones the admin project repository, **When** they run `npm install && npm run dev`, **Then** the admin dashboard loads successfully at localhost with all features functional
2. **Given** a developer makes changes to admin code, **When** they run `npm run build`, **Then** the build completes without any storefront-related code being processed
3. **Given** a developer runs tests in the admin project, **When** they execute `npm test`, **Then** only admin-related tests execute without storefront test suites

---

### User Story 2 - Independent Storefront Development (Priority: P1)

As a developer working on the storefront, I want the storefront codebase separated from admin code so that I can develop customer-facing features without admin-related complexity affecting my build times or mental model.

**Why this priority**: Equal priority to Story 1 - storefront developers need the same benefits. Both separations must happen for the split to be viable.

**Independent Test**: Developer can work with storefront project independently, with all e-commerce features functional and no admin code in the bundle.

**Acceptance Scenarios**:

1. **Given** a developer works on the storefront project, **When** they run the development server, **Then** all customer-facing routes (products, cart, checkout) are accessible without admin routes
2. **Given** a developer builds the storefront project, **When** the build completes, **Then** the bundle contains zero admin-related code or routes
3. **Given** a customer visits the storefront, **When** they navigate the site, **Then** all functionality (browse, search, cart, checkout) works identically to the current monolith

---

### User Story 3 - Shared Code Management (Priority: P2)

As a developer maintaining shared code (core features, UI components, utilities), I want changes to shared code to be propagated to both projects reliably so that I don't have to manually sync changes or deal with version drift.

**Why this priority**: Critical for long-term maintainability, but can be implemented after the initial split. The projects can temporarily duplicate shared code during migration.

**Independent Test**: Developer makes a change to the backend/core package (containing all common APIs and backend business logic), and both storefront and dashboard projects can consume the update immediately through monorepo workspace linking.

**Acceptance Scenarios**:

1. **Given** a developer updates a shared utility function, **When** the change is committed, **Then** both admin and storefront projects can access the updated version through their dependency management system
2. **Given** a shared type definition changes, **When** projects rebuild, **Then** TypeScript compilation catches any breaking changes in both projects
3. **Given** a new shared feature is added to core, **When** projects update their dependencies, **Then** both can import and use the new feature

---

### User Story 4 - Deployment Independence (Priority: P3)

As a DevOps engineer, I want separate deployment pipelines for admin and storefront so that I can deploy security patches to the admin dashboard without triggering a full storefront deployment, reducing deployment risk and time.

**Why this priority**: Important for operational efficiency but not blocking the initial split. Projects can initially share deployment pipeline.

**Independent Test**: Deployment pipeline can build and deploy admin project independently without affecting storefront availability.

**Acceptance Scenarios**:

1. **Given** a critical admin security fix is ready, **When** the admin project is deployed, **Then** storefront remains unaffected and doesn't require redeployment
2. **Given** both projects need deployment, **When** deployments run, **Then** they can execute in parallel without conflicts
3. **Given** an admin deployment fails, **When** rollback occurs, **Then** storefront remains on current version and operational

---

### Edge Cases

- What happens when shared backend code has breaking changes? How are both frontend apps notified and updated?
- What happens to existing feature branches when the split occurs? Migration path for in-progress work?
- What happens to shared test fixtures, mock data, and Cypress tests - do they get duplicated or shared?
- How are Tailwind configuration and design tokens synchronized between dashboard and storefront if UI components diverge over time?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST extract admin dashboard routes (`src/app/[locale]/admin/**`) into a standalone Next.js 16 project with identical functionality
- **FR-002**: System MUST extract storefront routes (`src/app/[locale]/(storefront)/**`, `(auth)`, `(school-list)`) into a standalone Next.js 16 project with identical functionality
- **FR-003**: System MUST identify and extract shared features (`core`, UI components, utilities, types) into a third package called `backend` containing all common APIs and backend business logic, using a monorepo workspace structure
- **FR-004**: Both projects MUST maintain the existing Clean Architecture structure (domain/application/infrastructure/presentation layers)
- **FR-005**: Both projects MUST use the same technology stack: Next.js 16 App Router, TypeScript, Tailwind CSS, Drizzle ORM, next-intl for i18n
- **FR-006**: System MUST migrate all existing tests (unit, integration, E2E) to their respective projects with no test coverage loss
- **FR-007**: System MUST preserve all existing functionality - zero regression in admin or storefront features
- **FR-008**: Both projects MUST maintain bilingual support (English/Arabic) with RTL support
- **FR-009**: System MUST provide clear migration documentation for developers with step-by-step setup instructions
- **FR-010**: System MUST define clear API boundaries between admin and storefront if they need to communicate
- **FR-011**: Both projects MUST have independent package.json with only their required dependencies (no unused packages)
- **FR-012**: System MUST establish clear ownership of feature modules (see data-model.md §Feature Module Classification for complete mapping: administration → dashboard, cart/catalog/order/review → storefront, core/identity/media → backend)
- **FR-013**: System MUST preserve all existing ESLint rules, TypeScript configurations, and code quality gates
- **FR-014**: Both projects MUST maintain separate git repositories or clearly separated monorepo workspaces
- **FR-015**: System MUST migrate environment variables and configuration files appropriately to each project
- **FR-016**: System MUST establish monorepo structure with three packages: `packages/storefront` (deployable Next.js app), `packages/dashboard` (deployable Next.js app), and `packages/backend` (TypeScript library with no deployment), with workspace dependency linking where dashboard and storefront import backend
- **FR-017**: Backend package MUST own all database schema files, migration scripts, and Drizzle ORM configuration; dashboard and storefront packages MUST access database only through backend's exported repository interfaces and service abstractions imported into their API routes and server components
- **FR-018**: Backend package MUST provide a shared authentication service that issues and validates JWT tokens; dashboard and storefront packages MUST authenticate users exclusively through backend's exported auth APIs and token verification utilities imported into their authentication flows
- **FR-019**: Only dashboard and storefront packages are deployable Next.js applications; backend package has no deployment and exists solely as an importable TypeScript library consumed by the two frontend apps
- **FR-020**: UI components from `src/components/ui/` (shadcn/Radix primitives) and `src/components/shared/` MUST be duplicated into both dashboard and storefront packages, allowing each frontend app to customize their design system independently over time
- **FR-021**: All UI components in both dashboard and storefront packages MUST be built using shadcn/ui (with Radix UI primitives as foundation); no alternative component libraries allowed to maintain consistency and accessibility standards

### Key Entities

- **Dashboard Package** (`packages/dashboard`): Standalone Next.js application containing all administrator-facing functionality (product management, order management, user management, analytics)
- **Storefront Package** (`packages/storefront`): Standalone Next.js application containing all customer-facing functionality (product browsing, cart, checkout, user account)
- **Backend/Core Package**: TypeScript library package (not deployed independently) owning all database concerns (Drizzle ORM schema, migrations, database access layer) and containing all common APIs and abstracted shared business logic (authentication services, domain types, repository interfaces, utilities, UI primitives, i18n setup, shared feature modules); imported by dashboard and storefront for use in their API routes and server components
- **Feature Modules**: Self-contained features from `src/features/` directory requiring classification as admin-only, storefront-only, or shared (administration → dashboard, cart/catalog/order/review → storefront, core/identity/media → backend)
- **Infrastructure Layer**: Database access exclusively through backend package's exported repository interfaces; dashboard and storefront have no direct database access; external API clients and file storage handled per-package or through backend as needed
- **Deployment Pipeline**: CI/CD configuration for building, testing, and deploying the two Next.js applications (dashboard and storefront) independently; backend package built and tested as dependency of frontend apps but not deployed separately

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Build time for admin project reduces from current 4+ minutes to under 2 minutes
- **SC-002**: Build time for storefront project reduces from current 4+ minutes to under 2.5 minutes (larger due to customer-facing features)
- **SC-003**: Bundle size for admin project is under 500KB (gzipped, excluding shared node_modules)
- **SC-004**: Bundle size for storefront project is under 800KB (gzipped, excluding shared node_modules)
- **SC-005**: Zero functionality regression - all existing E2E tests pass in both projects
- **SC-006**: Developer onboarding time for admin-only work reduces by 40% (less codebase to understand)
- **SC-007**: Hot module replacement (HMR) speed improves by 50% in development mode for both projects
- **SC-008**: TypeScript compilation time for each project is under 30 seconds (vs current 60+ seconds)
- **SC-009**: Both frontend apps (dashboard and storefront) can be developed, built, tested, and deployed completely independently; backend package changes trigger rebuilds in dependent apps
- **SC-010**: Shared code updates can be consumed by both projects within 1 day (through defined dependency update process)

## Assumptions

- All three packages share the same PostgreSQL database instance with the backend package owning all schema definitions and migrations; dashboard and storefront access data exclusively through backend's abstracted repository interfaces
- Authentication and session management handled through backend package's shared authentication service using JWT tokens; users can authenticate once and tokens are valid across both dashboard and storefront deployments
- Existing feature flags and environment variables will be replicated to both projects with project-specific configurations maintained separately
- The split will be executed as a one-time migration effort with a clear cutover date; no gradual migration of features over time
- Development team will use a monorepo structure with three packages (storefront, dashboard, backend) managed via Turborepo for build orchestration and caching, with pnpm workspaces for dependency linking
- CI/CD pipeline infrastructure (GitHub Actions, Vercel, or similar) supports deploying two Next.js applications; backend package tested as part of frontend app builds with no separate deployment
- All three packages (storefront, dashboard, backend) will maintain the same versioning of shared dependencies (Next.js, React, etc.) with dependency management handled at the monorepo root level to ensure compatibility
- Media files and uploads will be stored in a shared location accessible by both projects (cloud storage with proper access controls)
- Existing git history will be preserved in one project (likely storefront as original), with admin project starting fresh or using git filter-branch for relevant history
- Both projects will continue using the same initial design system (Tailwind config, shadcn/ui components) duplicated at the start of the split, but may diverge independently over time as each app's UI needs evolve
- Current feature branches and in-progress work will be completed or rebased before the split to minimize migration complexity

### Technical Constraints & Best Practices _(Next.js 16 & React)_

**Next.js 16 App Router Requirements**:

- Use Server Components by default for all pages and layouts (mark Client Components with `'use client'` only when interactivity required)
- Leverage Server Actions for mutations (form submissions, data updates) instead of API routes where possible
- Use `async` Server Components for data fetching at the component level (colocation of data + UI)
- Implement streaming with `<Suspense>` boundaries for progressive page rendering and loading states
- Use `generateMetadata()` for SEO metadata generation in layouts and pages
- Prefer `next/image` with automatic optimization; use `fill` layout for responsive images
- Use Route Handlers (`route.ts`) only for external API integrations or webhooks (prefer Server Actions for internal mutations)
- Implement Partial Prerendering (PPR) where applicable for hybrid static/dynamic rendering
- Use `unstable_cache` for data caching with granular revalidation strategies

**React Best Practices (React 19-compatible patterns)**:

- Use React 19 `use` hook for unwrapping Promises and Context in components
- Implement `useOptimistic` for optimistic UI updates in forms and mutations
- Use `useFormStatus` and `useFormState` for form state management with Server Actions
- Prefer `useActionState` for complex form interactions with Server Actions
- Use `useTransition` for non-urgent state updates to keep UI responsive
- Implement error boundaries with `error.tsx` for route-level error handling
- Use `loading.tsx` for instant loading states during navigation

**Performance & Optimization**:

- Code-split by route automatically via App Router; use `dynamic()` for heavy client components
- Implement font optimization with `next/font` (local fonts or Google Fonts)
- Use `revalidatePath()` and `revalidateTag()` for granular cache invalidation
- Minimize client-side JavaScript by maximizing Server Component usage
- Use `React.cache()` for request-level memoization in Server Components
- Implement proper TypeScript strict mode with no `any` types

**Data Fetching Patterns**:

- Fetch data in Server Components using async/await (no useEffect for data fetching)
- Parallel data fetching: multiple `fetch()` calls in same component render in parallel automatically
- Sequential data fetching: use `await` when one request depends on another
- Use backend package's repository interfaces for database access (no direct ORM usage in frontend apps)
- Implement proper error handling with try/catch in Server Components

**Routing & Navigation**:

- Use Route Groups `(groupName)` for organization without affecting URL structure
- Implement Parallel Routes for complex dashboard layouts (e.g., modal overlays)
- Use Intercepting Routes for modal-based navigation patterns
- Leverage `useRouter()` from `next/navigation` for programmatic navigation (Client Components only)
- Use `<Link>` component for declarative navigation with automatic prefetching

**Styling & UI (shadcn/ui specific)**:

- All components MUST use shadcn/ui components from `components/ui/` directory
- Customize shadcn components via Tailwind CSS classes and CSS variables (no inline styles)
- Use Radix UI primitives as foundation (via shadcn) for accessibility compliance
- Implement dark mode support using `next-themes` with CSS variable theming
- Use Tailwind's logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`) for RTL support
- Define semantic color tokens in `globals.css` using HSL CSS variables

**Internationalization (next-intl)**:

- Use server-side i18n with next-intl for translations (no client-side translation loading)
- Implement `[locale]` dynamic segment for language routing
- Use `useTranslations()` in Client Components, `getTranslations()` in Server Components
- Maintain translation files in backend package for single source of truth
- Support bidirectional text with proper RTL styling

**Authentication & Security**:

- JWT tokens stored in HTTP-only cookies (not localStorage) for XSS protection
- Implement CSRF protection for Server Actions
- Use middleware for route protection and authentication checks
- Validate all inputs with Zod schemas at API boundaries
- Never expose sensitive backend logic or database queries to client bundles

**Testing Requirements**:

- E2E tests with Cypress for critical user journeys
- Unit tests for utility functions and business logic in backend package
- Integration tests for Server Actions and Route Handlers
- Visual regression testing for UI components (optional but recommended)

**Build & Bundle Optimization**:

- Configure `bundlePagesRouterDependencies` and `serverExternalPackages` in next.config.ts
- Use `outputFileTracing` for minimal production builds
- Enable SWC minification (default in Next.js 16)
- Configure proper `images.remotePatterns` for external image domains
