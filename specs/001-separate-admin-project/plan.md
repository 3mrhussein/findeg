# Implementation Plan: Separate Admin Dashboard Project

**Branch**: `001-separate-admin-project` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-separate-admin-project/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Split the monolithic FindEg.com e-commerce application into three packages within a Turborepo monorepo: (1) `packages/storefront` - customer-facing Next.js app, (2) `packages/dashboard` - admin-facing Next.js app, and (3) `packages/backend` - shared TypeScript library containing all business logic, database access, and common utilities. This separation reduces build times, enables independent development, and improves cognitive load by allowing developers to work on isolated concerns. The backend package owns all database schema/migrations and provides abstracted repository interfaces, while frontend packages remain thin UI layers importing backend functionality for their API routes and server components.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 (App Router), React 19  
**Primary Dependencies**: Turborepo (monorepo orchestration), pnpm workspaces (dependency linking), Next.js 16, React 19, Drizzle ORM, Zod (validation), next-intl (i18n), shadcn/ui with Radix UI primitives, Tailwind CSS  
**Storage**: PostgreSQL (shared database accessed via backend package's repository interfaces)  
**Testing**: Cypress (E2E), Vitest or Jest (unit/integration tests for backend package logic)  
**Target Platform**: Web (Node.js runtime for Next.js SSR/API routes), deployed to Vercel or similar Next.js-optimized hosting  
**Project Type**: Monorepo with three packages - two deployable Next.js web applications (dashboard, storefront) and one TypeScript library (backend)  
**Performance Goals**: Dashboard build time <2 min (from current 4+ min), Storefront build time <2.5 min, HMR 50% faster, TypeScript compilation <30 sec per package  
**Constraints**: Zero functionality regression (all existing E2E tests must pass), preserve bilingual support (EN/AR with RTL), maintain Clean Architecture boundaries, dashboard bundle <500KB gzipped, storefront bundle <800KB gzipped  
**Scale/Scope**: Migrate ~50+ existing routes (admin dashboard routes + storefront routes + auth routes), ~10 feature modules (administration, cart, catalog, core, identity, media, notifications, order, review, school), hundreds of components, comprehensive Cypress E2E test suite

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**FindEg.com Constitution (.specify/memory/constitution.md) Compliance Gates** — Test each principle:

1. **☑ Clean Architecture** - ✅ PASS - All three packages (dashboard, storefront, backend) will maintain the existing 4-layer structure (domain/application/infrastructure/presentation); backend package enforces no direct infrastructure imports between features by providing abstracted repository interfaces
2. **☑ Server-Components First** - ✅ PASS - Both frontend packages will preserve existing Server Component defaults; migration maintains current UI patterns with Client Components only for interactivity
3. **☑ Bilingual & RTL-First** - ✅ PASS - All existing i18n strings preserved and migrated; EN + AR translations maintained in backend package (single source of truth); Tailwind logical classes preserved
4. **☑ Feature-Oriented Core Kernel** - ✅ PASS - Feature modules classified and migrated appropriately: administration → dashboard, cart/catalog/order/review → storefront, core/identity/media → backend; backend serves as the shared "core" package
5. **☑ Type-Safe & Testable** - ✅ PASS - All existing Zod schemas migrate with their respective packages; TypeScript strict mode maintained per-package; E2E tests migrated to respective frontend packages; backend package gets unit/integration tests
6. **☑ DRY Principle** - ✅ PASS - Shared code extracted to backend package (single source of truth); UI components initially duplicated per spec decision but can be extracted later if duplication becomes problematic; no logic duplication across packages
7. **☑ SOLID Design** - ✅ PASS - Separation improves Single Responsibility at package level (dashboard = admin UI, storefront = customer UI, backend = business logic/data); backend repository interfaces enforce Dependency Inversion; Interface Segregation via focused exports
8. **☑ Definition of Done** - ✅ PASS - Plan includes migration of all quality gates (type-check, lint, build per package), i18n validation, E2E test migration, and preservation of DRY/SOLID/CLEAN CODE standards through code review during migration

**Violations found**: None. The feature enhances compliance with SOLID principles by improving Single Responsibility at the project/package level.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Turborepo monorepo structure with three packages

packages/
├── backend/              # TypeScript library (no deployment)
│   ├── src/
│   │   ├── features/     # Migrated from src/features/
│   │   │   ├── core/     # Auth, persistence, i18n, shared contracts
│   │   │   ├── identity/ # User management domain
│   │   │   └── media/    # File/image handling
│   │   ├── components/   # Shared but duplicated to frontends
│   │   │   ├── ui/       # shadcn/Radix primitives
│   │   │   └── shared/   # Cross-cutting components
│   │   ├── lib/          # Utilities, helpers
│   │   └── types/        # Shared TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── dashboard/            # Admin Next.js app (deployable)
│   ├── src/
│   │   ├── app/
│   │   │   └── [locale]/ # Admin routes only
│   │   │       ├── admin/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   ├── features/     # Admin-specific features
│   │   │   └── administration/ # Product/order/user management
│   │   ├── components/   # Duplicated from backend initially
│   │   │   ├── ui/
│   │   │   └── shared/
│   │   └── lib/
│   ├── public/
│   ├── package.json      # Depends on @findeg/backend
│   ├── next.config.ts
│   └── tsconfig.json
│
└── storefront/           # Customer Next.js app (deployable)
    ├── src/
    │   ├── app/
    │   │   └── [locale]/  # Customer routes only
    │   │       ├── (storefront)/
    │   │       ├── (auth)/
    │   │       ├── (school-list)/
    │   │       ├── layout.tsx
    │   │       └── page.tsx
    │   ├── features/      # Storefront-specific features
    │   │   ├── cart/
    │   │   ├── catalog/
    │   │   ├── order/
    │   │   ├── review/
    │   │   ├── school/
    │   │   └── notifications/
    │   ├── components/    # Duplicated from backend initially
    │   │   ├── ui/
    │   │   └── shared/
    │   └── lib/
    ├── public/
    ├── package.json       # Depends on @findeg/backend
    ├── next.config.ts
    └── tsconfig.json

# Monorepo root configuration
turbo.json                # Turborepo task configuration
pnpm-workspace.yaml       # pnpm workspace definition
package.json              # Root scripts & devDependencies
tsconfig.json             # Base TypeScript config
.eslintrc.js              # Shared ESLint config
tailwind.config.ts        # Shared (or per-package)
```

**Structure Decision**: Monorepo with three packages using Turborepo + pnpm workspaces. Backend is a TypeScript library package imported by both frontend apps (no deployment). Dashboard and storefront are independent Next.js applications deployed separately. This structure enables independent builds while maintaining shared business logic in a single source of truth.

## Complexity Tracking

_No constitution violations detected. This section is not applicable for this feature._

---

## Post-Design Constitution Re-Check

_GATE: Re-evaluate after Phase 1 design artifacts complete._

**FindEg.com Constitution Compliance Re-Evaluation**:

1. **☑ Clean Architecture** - ✅ CONFIRMED - Design artifacts show clear 4-layer separation maintained across all three packages; backend package provides abstracted repository interfaces (data-model.md §Repository Contracts); no direct database imports allowed in frontend packages (contracts/backend-exports.md §Database Schema Ownership)

2. **☑ Server-Components First** - ✅ CONFIRMED - Quickstart guide emphasizes Server Components as default (quickstart.md §Working on Dashboard/Storefront); examples show async Server Components for data fetching with backend repositories

3. **☑ Bilingual & RTL-First** - ✅ CONFIRMED - i18n utilities exported from backend package support both EN/AR (contracts/backend-exports.md §i18n Contract); migration preserves existing translation files in backend package (research.md §Migration Phases)

4. **☑ Feature-Oriented Core Kernel** - ✅ CONFIRMED - Feature classification documented (data-model.md §Feature Module Classification); backend package serves as shared "core" with identity/media/core features; dashboard/storefront packages contain feature-specific modules

5. **☑ Type-Safe & Testable** - ✅ CONFIRMED - All repository interfaces fully typed with TypeScript (contracts/backend-exports.md §Repository Contracts); Zod schemas at all API boundaries (contracts/backend-exports.md §Validation Schemas); test migration strategy preserves coverage (research.md §Test Migration Strategy)

6. **☑ DRY Principle** - ✅ CONFIRMED - Backend package is single source of truth for business logic, types, validation schemas (data-model.md §Backend Package Exports); UI components initially duplicated with option to extract later if needed (data-model.md §Component & UI Duplication); no logic duplication across packages enforced via repository pattern

7. **☑ SOLID Design** - ✅ CONFIRMED - Single Responsibility: each package has one clear purpose (backend=logic, dashboard=admin UI, storefront=customer UI); Dependency Inversion: frontend depends on repository interfaces, not concrete implementations (contracts/backend-exports.md §Repository Contracts); Interface Segregation: focused exports per feature module (data-model.md §Backend Package Exports)

8. **☑ Definition of Done** - ✅ CONFIRMED - Quickstart includes lint/type-check/build/test commands per package (quickstart.md §Development Workflow); migration strategy includes verification of all quality gates (research.md §Migration Execution Strategy)

**Post-Design Violations**: None detected. Design phase artifacts reinforce constitution compliance.

**Design Completeness**:

- ✅ Research.md explains all technical decisions with alternatives considered
- ✅ Data-model.md defines package structure, dependencies, and feature classification
- ✅ Contracts/backend-exports.md specifies all public APIs and type contracts
- ✅ Quickstart.md provides developer onboarding and workflow documentation

**Phase 1 Complete** ✅

---

## Planning Summary

### Artifacts Generated

| Artifact                      | Path                           | Purpose                                                            | Status      |
| ----------------------------- | ------------------------------ | ------------------------------------------------------------------ | ----------- |
| **Implementation Plan**       | `plan.md`                      | Technical context, constitution compliance, project structure      | ✅ Complete |
| **Research & Decisions**      | `research.md`                  | Technical research, alternatives considered, migration strategy    | ✅ Complete |
| **Data Model & Dependencies** | `data-model.md`                | Package structure, feature classification, export/import contracts | ✅ Complete |
| **Backend Exports Contract**  | `contracts/backend-exports.md` | Public API definitions, type contracts, usage examples             | ✅ Complete |
| **Developer Quickstart**      | `quickstart.md`                | Setup guide, development workflows, troubleshooting                | ✅ Complete |

### Key Decisions Documented

1. **Monorepo Tooling**: Turborepo + pnpm workspaces (intelligent caching, Next.js optimization)
2. **Package Architecture**: 3 packages - dashboard (admin UI), storefront (customer UI), backend (shared library with no deployment)
3. **Database Ownership**: Backend package owns all schema/migrations; frontend packages use repository interfaces only
4. **Authentication**: JWT tokens from backend's shared auth service (stateless, cross-domain support)
5. **UI Components**: Duplicated in both frontend packages initially (allows independent customization)
6. **Migration Strategy**: One-time cutover with feature freeze (5 phases over 15-20 days)

### Technical Stack Confirmed

- **Language**: TypeScript 5.x
- **Frontend**: Next.js 16 (App Router), React 19
- **Backend Library**: TypeScript with Drizzle ORM, Zod validation
- **Database**: PostgreSQL (shared instance)
- **i18n**: next-intl (bilingual EN/AR support)
- **UI**: shadcn/ui with Radix UI primitives, Tailwind CSS
- **Monorepo**: Turborepo + pnpm workspaces
- **Testing**: Cypress (E2E), Vitest (unit/integration)

### Constitution Compliance Status

**Pre-Design Check**: ✅ All 8 principles compliant  
**Post-Design Check**: ✅ All 8 principles confirmed with design artifacts  
**Violations**: None

### Performance Targets

- Dashboard build time: <2 min (from current 4+ min) ✅ 50% reduction
- Storefront build time: <2.5 min (from current 4+ min) ✅ 37.5% reduction
- TypeScript compilation: <30 sec per package
- HMR speed improvement: 50% faster
- Bundle sizes: Dashboard <500KB, Storefront <800KB (gzipped)

### Next Steps

**Ready for Phase 2**: Task generation via `/speckit.tasks` command

The planning phase has produced comprehensive design artifacts covering:

- Technical research with alternatives considered
- Package dependency model and feature classification
- Complete API contracts for backend exports
- Developer workflows and troubleshooting guides
- Migration execution strategy with 5 phases

All constitution gates passed. Implementation can proceed confidently with clear architectural guidance.
