# Implementation Plan: Decouple App Infrastructure Dependencies

**Branch**: `005-decouple-app-infrastructure` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-decouple-app-infrastructure/spec.md`

**Note**: This plan enforces Clean Architecture boundaries by preventing apps from directly importing backend infrastructure implementations, fixing build failures caused by database code being pulled into client bundles.

## Summary

Apps (dashboard, storefront) are currently importing infrastructure code from the backend package, causing build failures with "Module not found: Can't resolve 'net/tls/fs/perf_hooks'" errors. This occurs because Client Components transitively import Server Actions that pull in database code (postgres, drizzle-orm). The fix establishes strict architectural boundaries where apps can only import from the backend's application and presentation layers, never infrastructure implementations. This involves: (1) fixing TypeScript path resolution to prevent infrastructure access, (2) restricting backend package.json exports to exclude infrastructure layer, (3) removing duplicated infrastructure code from apps, (4) validating serverExternalPackages prevents bundling, and (5) updating architecture documentation to enforce these boundaries going forward.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16.x (App Router with React Compiler)  
**Primary Dependencies**: Next.js 16, Turborepo 2.x, pnpm workspaces, Drizzle ORM, postgres (node-postgres)  
**Storage**: PostgreSQL via Drizzle ORM (in backend infrastructure layer only)  
**Testing**: Vitest (unit), Cypress (e2e), TypeScript strict type-checking  
**Target Platform**: Web (Node.js server runtime for Next.js apps, pure TypeScript library for backend package)
**Project Type**: Monorepo with 3 packages: @backend (pure TypeScript library), @dashboard (Next.js app), @storefront (Next.js app)  
**Performance Goals**: Build time <3 minutes for production builds, zero client-side bundle bloat from server-only code  
**Constraints**: Apps MUST NOT bundle Node.js-only modules (fs, net, tls, postgres) in client-side JavaScript; backend package MUST remain framework-agnostic (no Next.js APIs)  
**Scale/Scope**: 3 packages with ~50+ features across domain/application/infrastructure/presentation layers; enforcing boundaries for all current and future features

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**FindEg.com Constitution (.specify/memory/constitution.md) Compliance Gates** — Test each principle:

1. **☑ Clean Architecture** - Feature **enforces** domain/application/infrastructure/presentation boundary separation; **eliminates** infrastructure imports from apps to backend; apps depend only on application and presentation layers
2. **☑ Server-Components First** - Not applicable (no new UI); existing Server Components already default; fix prevents Client Components from transitively importing database code
3. **☐ Bilingual & RTL-First** - Not applicable (architectural refactoring only; no user-facing strings)
4. **☑ Feature-Oriented Core Kernel** - Aligns with core principle: apps depend on backend's application layer abstractions, not infrastructure implementations; enforces feature isolation at infrastructure level
5. **☑ Type-Safe & Testable** - TypeScript strict mode enforced via path resolution; build-time validation prevents infrastructure leakage; Constitution-compliant architecture enables easier unit testing
6. **☑ DRY Principle** - **Eliminates** duplicated infrastructure code (DrizzleNotificationRepository, etc.) from storefront; establishes single source of truth in backend package
7. **☑ SOLID Design** - **Enforces Dependency Inversion Principle (DIP)**: high-level modules (apps) depend on abstractions (application layer interfaces), not low-level modules (infrastructure implementations)
8. **☑ Backend Packages (Pure TypeScript Libraries)** - Validates backend package remains framework-agnostic; prevents Next.js-specific code from leaking into backend; package.json exports ensure infrastructure never exposed
9. **☑ Monorepo Architecture & Package Boundaries** - **Enforces** strict package boundaries via TypeScript path resolution and package.json exports; apps cannot bypass boundaries to access backend infrastructure
10. **☑ Source vs Build Artifacts (STRICT)** - Not directly applicable; focuses on import boundaries rather than build outputs; implementation ensures clean separation via exports field

**Violations found**: None. This feature is a **constitutional enforcement mechanism** that prevents future violations of Clean Architecture (Principle I), SOLID/DIP (Principle VII), and Package Boundaries (Principle IX).

**Definition of Done includes**:
- ☑ `npm run type-check` → Zero errors (apps cannot import infrastructure)
- ☑ `npm run lint` → All checks pass
- ☑ `npm run build` → Both dashboard and storefront build successfully without module resolution errors
- ☑ Code Quality Gates: DRY verified (no duplicated infrastructure), SRP/SOLID verified (apps depend on abstractions only)
- ☑ Architecture documentation updated in docs/architecture/ to reflect boundary enforcement

## Project Structure

### Documentation (this feature)

```text
specs/005-decouple-app-infrastructure/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Next.js 16 server/client boundaries, server-only package, TypeScript path enforcement
├── data-model.md        # Phase 1 output - Architectural boundary enforcement patterns
├── quickstart.md        # Phase 1 output - Developer guide for following Clean Architecture import rules
├── contracts/           # Phase 1 output - Defines what apps can import from backend (application + presentation layers only)
│   └── backend-exports.md  # Documents package.json exports structure and allowed import patterns
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Monorepo structure (pnpm workspaces + Turborepo)

packages/
├── backend/             # Pure TypeScript library (framework-agnostic)
│   ├── src/
│   │   ├── features/    # Feature modules (domain, application, infrastructure, presentation)
│   │   │   ├── core/    # Shared cross-cutting concerns
│   │   │   ├── identity/
│   │   │   ├── catalog/
│   │   │   ├── cart/
│   │   │   ├── order/
│   │   │   ├── review/
│   │   │   ├── media/
│   │   │   ├── school/
│   │   │   ├── notifications/
│   │   │   └── administration/
│   │   └── index.ts     # Root barrel export (proxies to feature exports)
│   ├── package.json     # CRITICAL: exports field defines public API (application + presentation only)
│   └── tsconfig.json
│
├── dashboard/           # Admin Next.js 16 app
│   ├── src/
│   │   ├── app/         # Next.js App Router routes
│   │   ├── components/  # Dashboard-specific UI components
│   │   ├── features/    # Dashboard-specific features (if any)
│   │   └── server/      # Server Actions specific to dashboard
│   ├── next.config.ts   # CRITICAL: serverExternalPackages configured
│   └── tsconfig.json    # CRITICAL: paths must NOT allow infrastructure imports
│
├── storefront/          # Customer Next.js 16 app
│   ├── src/
│   │   ├── app/         # Next.js App Router routes
│   │   ├── components/  # Storefront-specific UI components
│   │   ├── features/    # Storefront-specific features (to be removed - duplicates backend)
│   │   └── server/      # Server Actions specific to storefront
│   ├── next.config.ts   # CRITICAL: serverExternalPackages configured
│   └── tsconfig.json    # CRITICAL: paths must NOT allow infrastructure imports
│
└── ui/                  # Shared React components library
    └── src/
        └── components/  # Reusable UI primitives

docs/
└── architecture/        # CRITICAL: Documentation to be updated
    ├── ARCHITECTURE_PLAYBOOK.md      # Layer boundaries and import rules
    ├── clean-architecture.md         # Clean Architecture enforcement patterns
    ├── BACKEND_MIGRATION_PATTERNS.md # Backend package usage patterns
    └── DOMAIN_TYPE_BLOCKS.md         # Domain type foundations
```

**Structure Decision**: This is a monorepo with strict package boundaries enforced via Turborepo and pnpm workspaces. The backend package is a pure TypeScript library containing all domain/application/infrastructure/presentation logic for features, while dashboard and storefront are Next.js 16 apps that consume backend functionality exclusively through the backend's package.json exports field. The critical enforcement points are:

1. **Backend exports** (`packages/backend/package.json`): Only exposes application and presentation layers per feature
2. **App tsconfig paths** (`packages/{dashboard,storefront}/tsconfig.json`): Currently allow `@features/*` to resolve to both app and backend, which must be restricted
3. **serverExternalPackages** in Next.js configs: Already configured to prevent postgres/drizzle-orm from client bundling
4. **Infrastructure layer code**: Must be marked with `server-only` package to fail at build time if client code tries to import

This enforcement mechanism prevents apps from bypassing the architecture by directly importing repository implementations, database clients, or other infrastructure adapters.

## Complexity Tracking

No violations or exemptions needed. This feature enforces constitutional principles rather than violating them.

---

## Implementation Phases

### Phase 0: Outline & Research ✅ COMPLETE

**Status**: All research completed in [research.md](./research.md)

**Deliverables**:
- ✅ Research on Next.js 16 server/client boundary mechanisms
- ✅ `server-only` package usage patterns documented
- ✅ TypeScript path alias enforcement strategies evaluated
- ✅ Package.json exports best practices researched
- ✅ Alternatives considered and decisions documented

**Key Decisions**:
- Use multi-layered defense: server-only + exports + path aliases + ESLint
- Remove backend from `@features/*` path resolution in apps
- Add `import 'server-only'` to all infrastructure files
- Remove duplicated infrastructure from storefront

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Design completed, contracts defined

**Deliverables**:
- ✅ Architectural boundary patterns documented in [data-model.md](./data-model.md)
- ✅ Backend export contract defined in [contracts/backend-exports.md](./contracts/backend-exports.md)
- ✅ Developer quickstart guide created in [quickstart.md](./quickstart.md)
- ✅ Agent context updated with new technologies

**Artifacts**:
1. **data-model.md**: Layer boundary model, package export contract, enforcement patterns
2. **contracts/backend-exports.md**: What apps can/cannot import from backend, per-feature export patterns
3. **quickstart.md**: Developer guide with DO/DON'T examples, common mistakes, error troubleshooting

**Constitution Re-Check**: ✅ PASS - All principles aligned, no violations introduced

---

### Phase 2: Implementation Tasks

**Status**: Ready for `/speckit.tasks` command

**Scope**: Generate detailed implementation tasks for:

1. **Backend Package Exports**
   - Update package.json exports to expose only application and presentation layers
   - Verify infrastructure is NOT exposed in package.json exports
   - Audit feature index.ts files for infrastructure leakage

2. **App Path Resolution Cleanup**
   - Update tsconfig.json in dashboard and storefront
   - Fix imports from `@features/[backend-feature]` to `@backend/features/[feature]`
   - Remove backend path from `@features/*` resolution

3. **Remove Duplicated Infrastructure**
   - Delete `packages/storefront/src/features/notifications/infrastructure/`
   - Identify and remove other duplicated domain/infrastructure directories
   - Update storefront imports to use backend package

4. **Documentation Updates**
   - Update `docs/architecture/ARCHITECTURE_PLAYBOOK.md` with import rules
   - Update `docs/architecture/clean-architecture.md` with boundary enforcement patterns
   - Add ESLint rule as secondary enforcement (optional)

5. **Validation & Testing**
   - Run `npm run type-check` to verify all imports resolve
   - Run `npm run build` to verify apps build successfully
   - Run `npm run test:e2e` to verify e2e tests pass
   - Add CI/CD gates for boundary enforcement

**Next Command**: Run `/speckit.tasks` to generate detailed task breakdown in `tasks.md`

---

## Success Metrics

### Build-Time Metrics

- ✅ Zero TypeScript errors for infrastructure imports (SC-001)
- ✅ Production builds complete in <3 minutes (SC-002)
- ✅ E2e test pipeline passes without build failures (SC-003)
- ✅ No Node.js modules in client bundle analysis (SC-004)
- ✅ TypeScript strict mode passes for all packages (SC-005)

### Code Quality Metrics

- ✅ Zero instances of duplicated infrastructure code (SC-006)
- ✅ Backend package.json exports expose only application/presentation layers
- ✅ 100% of app imports use `@backend/features/[feature]` pattern
- ✅ All feature index.ts files export only application/presentation layers

### Documentation Metrics

- ✅ Architecture docs updated with boundary enforcement rules
- ✅ Developer quickstart guide available for new team members
- ✅ Code review checklist includes boundary validation

---

## Risk Mitigation

### Risk 1: Breaking Existing Functionality

**Mitigation**: Phased rollout with build validation at each step
- Phase 1a: Update backend exports (doesn't break anything yet)
- Phase 1b: Fix paths (breaks if imports are wrong, caught by build)
- Phase 1c: Remove duplicates (only after imports are verified)

### Risk 2: Developer Confusion

**Mitigation**: Comprehensive documentation and clear error messages
- Quickstart guide with examples
- Error troubleshooting section
- Updated copilot-instructions.md for AI assistance

### Risk 3: Performance Impact

**Mitigation**: serverExternalPackages already configured, no runtime impact expected
- Build time should improve (less bundling of server code)
- Client bundle size should decrease (no database code)

---

## Related Documentation

- [Feature Specification](./spec.md) - Original requirements and user stories
- [Research](./research.md) - Phase 0 technical research and decisions
- [Data Model](./data-model.md) - Architectural boundary patterns
- [Backend Export Contract](./contracts/backend-exports.md) - API contract between backend and apps
- [Quickstart Guide](./quickstart.md) - Developer guide for following rules
- [Architecture Playbook](../../docs/architecture/ARCHITECTURE_PLAYBOOK.md) - Overall architecture reference
- [Clean Architecture](../../docs/architecture/clean-architecture.md) - Clean Architecture principles
