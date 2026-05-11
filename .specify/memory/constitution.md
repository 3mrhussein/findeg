# FindEg.com E-Commerce Platform Constitution

A modern, multilingual e-commerce application specializing in school supplies, stationary, and kids' toys. Built on Next.js 16 with Clean Architecture, strict type-safety, and bilingual support (English/Arabic) with full RTL compliance.

## Core Principles

### I. Clean Architecture with Strict Layer Boundaries

Domain logic MUST be completely isolated from technical details (database, UI framework, external services). All features follow the 4-layer model: **domain** (pure business rules), **application** (use cases/orchestration), **infrastructure** (adapters/DB), and **presentation** (UI/routes). Cross-feature dependencies are PROHIBITED at infrastructure level—only through application interfaces. No feature's infrastructure code may be imported directly by another feature or UI. Authorization checks MUST use guard interfaces (`IPermissionService`), never role-string checks in routes/components.

**Database Query Layer Organization**: The infrastructure layer follows a strict separation between **query primitives** (single-purpose read operations) and **orchestration** (composition of multiple primitives). Database queries in `@db/src/queries/` are organized by **data domain** (e.g., `catalog/`, `sales/`, `inventory/`) rather than by use case. Each domain exports **primitives only**—reusable, single-purpose query functions with no orchestration or composition logic. Primitives return raw data (counts, arrays, simple objects) suitable for multiple features.

**Default Pattern**: Backend services (`@backend/src/features/{feature}/application/services/`) orchestrate these primitives to build feature-specific use cases:
1. Call multiple primitives in parallel (for performance)
2. Validate results with Zod schemas
3. Transform and map to the output shape needed by the feature
4. Handle errors at the application level

This ensures the **infrastructure layer** (DB) stays focused on data access, while the **application layer** (services) owns all business logic composition and transformation.

**Performance Exception**: If a composed query requires database-level optimization to avoid N+1 queries or excessive round trips AND that optimization cannot be achieved by composing primitives, create an optimized query at the db layer as a single SQL statement. **MANDATORY: Document the performance reason in code comments explaining why single-query execution is necessary.** Still keep primitives available for simpler, non-performance-critical use cases.

### II. Server-Components First & Type-Safe Rendering with Next.js 16 Caching

Server Components are the default for all new UI. Client Components (`'use client'`) are permitted ONLY for interactive elements (forms, client state, event handlers). All data fetching must flow through **App Data Layer** in `src/data/{feature}/{queries|actions}.ts` using Next.js 16 Cache Components (`'use cache'` directive). The app data layer is the **single source of truth for caching decisions**: it calls backend services and wraps results with `'use cache'` for queries or `'use server'` for mutations. Backend packages MUST NOT contain `'use cache'`, `'use server'`, or any `next/cache` imports—they remain pure TypeScript. Cache invalidation via `updateTag()` or `revalidateTag()` happens exclusively at the app layer, never in backend code. TypeScript strict mode is MANDATORY. No `as any` casts are permitted; interfaces and adapters must be properly typed. Every API boundary must validate input with Zod schemas; every domain entity must be strongly typed.

### III. Bilingual & RTL-First (i18n Mandatory)

All UI strings are PROHIBITED from being hardcoded. Every piece of user-facing text must be externalized to translation files (`src/features/core/infrastructure/cms/messages/{locale}.json`) with scoped namespaces (`Pages.{Feature}`). English (`en`) and Arabic (`ar`) translations MUST be added simultaneously for every feature. Tailwind CSS logical classes (`ps-*`, `pe-*`, `text-start`) must be used instead of directional classes to ensure RTL layouts work automatically for Arabic pages. The app's font strategy automatically switches to Cairo for Arabic (`html[lang="ar"]`) via CSS tokens.

### IV. Feature-Oriented with Core Kernel

Features are self-contained modules in `src/features/{feature}/` with strict 4-layer organization. The shared `core` feature in `src/features/core/` provides cross-cutting concerns: authentication, session management, persistence contracts, i18n, layout templates, and UI primitives. All other features (catalog, cart, order, identity, administration, review, media) depend on `core`, never on each other's implementations. If two features need to collaborate, they do so through explicit application-layer interfaces defined in `core/application/contracts/`.

### V. Type-Safe, Testable, & Standards-Driven Code

Every entity and DTO must be validated at boundaries using Zod schemas. Tests (unit and E2E) are mandatory for critical paths: new library contracts, contract changes, inter-service communication, and shared schemas. The linting gate (`npm run lint`) MUST pass before any merge, which includes TypeScript strict type-checking, ESLint rules, and i18n validation. Database changes require SQL migrations in `scripts/migrations/` with corresponding Drizzle schema updates and planning doc updates. All code is self-documenting via clear names and types; JSDoc comments are reserved for "why" explanations, not "what" descriptions.

### VI. DRY Principle (Don't Repeat Yourself)

Every piece of logic, type, component, and utility must have a single source of truth. Duplication is eliminated through extraction and reuse: shared domain types, utility functions, composable components, and hooks are the norm. When similar patterns recur across features, they are consolidated into `core/` or shared utilities. Copy-paste coding is explicitly forbidden; code review must flag duplication. Refactoring to reduce duplication is a continuous practice and takes priority over adding new features if duplication is discovered.

### VII. SOLID Design Principles (Object-Oriented & Functional)

All code adheres to SOLID principles to maximize maintainability and testability:

- **S (Single Responsibility)**: Every function, class, component, and module has ONE reason to change. Violation is a red flag in code review.
- **O (Open/Closed)**: Code is OPEN for extension (new features via composition/inheritance/polymorphism) and CLOSED for modification. New requirements are added without breaking existing code.
- **L (Liskov Substitution)**: Derived types (subclasses, component variants) are substitutable without breaking expected behavior. Contracts are honored.
- **I (Interface Segregation)**: Dependencies depend on minimal, specific interfaces—not fat monolithic contracts. Clients depend on what they actually use.
- **D (Dependency Inversion)**: High-level modules depend on abstractions (interfaces), not concrete implementations. This is enforced via `application/` layer contracts in Clean Architecture.

### VIII. Backend Packages (Pure TypeScript Libraries)

Backend packages (`@backend`) MUST be pure TypeScript libraries containing ONLY domain logic, services, adapters, and pure functions. **Next.js APIs (`'use cache'`, `'use server'`, `updateTag`, `cacheTag`), server actions, or any framework-specific runtime features are STRICTLY FORBIDDEN in backend packages.** The backend package provides business logic contracts, interfaces, types, schemas, service classes, and service factory functions—nothing more. All UI components, routes, server actions, caching directives, and cache invalidation logic belong exclusively to app packages (`@dashboard`, `@storefront`). Backend packages are framework-agnostic and testable in isolation without Next.js runtime.

**Service Factory Pattern**: Backend features export factory functions (e.g., `createCatalogServices()`, `createOrderServices()`) that return service instances. Apps call these factories to get service instances, then wrap the service calls in `'use cache'` queries or `'use server'` actions at the app layer.

**Example**:

```typescript
// Backend (pure TS, no Next.js)
export function createCatalogServices() {
  const db = DrizzleConnection.getInstance();
  return { products: new ProductService(db) };
}

// App data layer (with Next.js caching)
("use cache");
import { createCatalogServices } from "@backend/features/catalog";
export async function getProducts(locale) {
  cacheTag("products");
  const { products } = createCatalogServices();
  return await products.getAll(locale);
}
```

### IX. Monorepo Architecture & Package Boundaries

The monorepo structure enforces strict package boundaries via Turborepo and pnpm workspaces.
Five packages exist: **@db** (database access layer), **@backend** (business logic), **@ui**
(shared React components), **@dashboard** (admin app), and **@storefront** (customer app).

Apps (`@dashboard`, `@storefront`) depend on `@ui` and `@backend`; `@backend` depends on `@db`;
`@db` and `@ui` are leaf packages with no dependencies on other workspace packages. The
dependency flow is: `@db ← @backend ← [@dashboard, @storefront]` and `@ui → [@dashboard, @storefront]`.

NO circular dependencies are permitted. Features within the `@backend` package MUST be
self-contained—cross-feature dependencies are ONLY permitted through application-layer
interfaces defined in `core`. Backend packages CANNOT depend on app-layer code or UI components.

All shared utilities, types, and cross-cutting concerns live in `@backend/features/core`,
`@db/shared` (if needed), or `@ui/lib`. Violating package boundaries (e.g., importing another
feature's infrastructure directly, importing app code into backend, or `@db` importing from
`@backend`) is a critical architecture violation and must be refactored immediately.

### X. Source vs Build Artifacts (STRICT)

Source code directories MUST contain ONLY handwritten, human-maintained source files. All build outputs, generated artifacts, compiled files, and transpiled code MUST be emitted to dedicated output directories and NEVER placed alongside source code. Each package has a single, clearly defined output directory: `dist/` for backend features, `.next/` for Next.js apps, or framework-specific equivalents. Generated TypeScript (`.js`, `.d.ts`, `.map`), compiled CSS, bundled chunks, codegen outputs (API clients, schemas, SDKs), and any file produced by build tools, compilers, or AI code generation MUST go only to the designated output folder. Source directories (`src/`) MUST NEVER contain compiled or generated artifacts. Monorepo packages MUST NOT import from another package's source directory (`src/`) or build output (`dist/`) directly; dependencies MUST flow through declared exports in `package.json`. This strict separation ensures clean version control, predictable Turborepo caching, and clear distinction between human intent and machine-generated code.

## Development Standards & Quality Gates

### CLEAN CODE Principles (Mandatory Standard)

All code MUST follow Clean Code practices for maximum readability and maintainability:

**Naming**

- Names reveal intent: `getUserByEmail()` not `getUser()`, `isValidEmail()` not `check()`, `calculateTotalPrice()` not `calc()`
- Use pronounceable names; avoid single-letter variables except in tight loop counters
- Avoid disinformation; don't use variable names that mislead (e.g., `userList` if it's not a list)

**Functions & Methods**

- Keep functions small: one responsibility, ideally one reason to change
- Minimize parameters; use objects/config if more than 3 parameters
- Early returns reduce nesting; avoid deeply nested conditionals
- No side effects beyond the function's declared purpose

**Comments & Documentation**

- Good code needs less comments. Comments explain WHY, not WHAT
- Remove outdated comments; stale documentation is worse than none
- Use JSDoc for public APIs; explain non-obvious business logic

**SOLID Anti-Patterns to Avoid**

- Feature Envy: Methods in one class accessing many fields of another
- God Objects: Classes with too many responsibilities; break them up
- Tight Coupling: Direct instantiation of dependencies; use interfaces instead
- Divergent Change: A class changed for multiple unrelated reasons; violates SRP

**Definition of Done (Non-Negotiable)**

- `npm run type-check` → Zero errors
- `npm run lint` → All checks pass (includes type-check + eslint + i18n validation)
- `npm run build` → Succeeds without errors or warnings
- Translations added to BOTH `en.json` and `ar.json` (if UI text is new)
- Feature README or affected docs updated if behavior/architecture changes
- E2E tests pass for critical user journeys (`npm run e2e:run`)
- Code Quality Gates (DRY & SOLID):
  - No duplicated logic, components, or utilities (violations raised in review)
  - Single Responsibility verified: each function/class has one reason to change
  - SOLID principles applied: LSP, ISP, DIP evident in design
  - CLEAN CODE standards met: meaningful names, short functions, minimal parameters, no misleading code
  - Comments explain WHY, not WHAT; documentation is current

**Code Review Standards**

- Architecture boundaries are respected (import rules verified)
- UI components are in correct locations (ui/, shared/, or route `_components/`)
- No role-string checks in routes; only guard interface usage
- Semantic Tailwind tokens used in new styles (no hardcoded colors)
- Server Component defaults applied; Client Components justified

**Database Changes Workflow**

1. Update Drizzle schema in `src/features/core/infrastructure/persistence/schema/`
2. Generate & commit migration SQL in `scripts/migrations/`
3. Validate locally: `npm run db:setup` then test CRUD paths
4. Update `docs/database/SCHEMA.md` if schema changes are public-facing
5. Update project planning docs (`project-planning/`) with feature impact
6. Ensure database queries follow Principle I: **queries organized by data domain, primitives only in @db, orchestration in @backend services**

**Test Script Configuration**

All test scripts MUST use non-interactive flags to ensure tests run once and exit cleanly. This prevents CI/CD hangs and ensures proper test completion in automated environments:

- `vitest` scripts: use `vitest --run`
- `jest` scripts: use `jest --watchAll=false`
- `cypress` scripts: already exit by default with `cypress run`

Test watch mode is only used locally during development with `npm run test:watch`. The default `npm run test` command MUST be non-interactive and exit automatically.

## Governance

**Constitution Authority**
This constitution supersedes all other architectural guidance. It is the source of truth for:

- Layer boundaries and import rules
- Component placement restrictions
- i18n and RTL compliance standards
- Source vs build artifacts separation (output directories, version control cleanliness)
- Definition of Done checklist
- Database change workflow

**Amendment Procedure**

- Amendments require explicit updates to this document.
- Any change to layer rules, principle interpretation, or mandatory tooling must be documented with a version bump and rationale.
- All team members and AI agents must be notified of amendments.
- Historical versions are preserved in the Sync Impact Report comment block.

**Compliance Review & Enforcement**

- All PRs must verify constitution compliance during review (explicit checkbox).
- `npm run lint` gate MUST pass—this enforces type-safety, ESLint rules, and i18n checks.
- The Architecture Playbook (`docs/architecture/ARCHITECTURE_PLAYBOOK.md`) and Coding Standards (`docs/guides/CODING_STANDARDS.md`) provide runtime implementation guidance; refer to them for specifics on layer contracts and component patterns.
- Violations are refactored in review before merge.

---

<!-- SYNC IMPACT REPORT -->
<!--
=== CURRENT VERSION ===

Version: 1.4.0 (Database Query Layer Organization Amendment)
Previous Version: 1.3.0
Ratified: 2026-05-11
Last Amended: 2026-05-11

Version Bump Rationale: MINOR (1.3.0 → 1.4.0)
- Principle I (ENHANCED): Clean Architecture now includes Database Query Layer Organization
- Defines data domain organization (catalog, sales, inventory) as infrastructure layer standard
- Mandates backend services orchestrate primitives; db layer provides primitives only
- Allows performance exceptions with mandatory documentation
- Aligns with Clean Architecture principle: DB provides access, Backend provides business logic
- **This is a CORE PRINCIPLE, not just a development standard** — speckit agents must apply it

Core Principles Updated:
✅ Principle I (ENHANCED): Clean Architecture with Strict Layer Boundaries
   - Added: Database Query Layer Organization pattern
   - Added: Data domain organization (@db/src/queries/{domain}/)
   - Added: Primitives-only export rule (no orchestration in infrastructure)
   - Added: Backend service orchestration responsibility
   - Added: Performance exception rule with mandatory documentation
   - These rules apply to ALL database work in the project

Database Changes Workflow Updated:
✅ Step 6 added: Reference to Principle I for query organization compliance

Patterns Formalized:
✅ Primitive Pattern: Single query, single concept, widely reusable
   - Lives in data domain folder (catalog/, sales/, inventory/)
   - Exported from @db/src/queries/{domain}/
   - Tested independently, usable by any feature

✅ Orchestration Pattern: Backend service composes multiple primitives
   - Lives in @backend/src/features/{feature}/application/services/
   - Calls primitives in parallel via Promise.all()
   - Validates with Zod, maps to output shape
   - Tested with mock primitives

✅ Exception Pattern: Performance-critical single queries
   - Requires mandatory comment explaining performance reason
   - Example: product-with-variants.ts with JOINs to avoid N+1
   - Used sparingly, when composing primitives is insufficient

Speckit Agent Impact:
✅ Agents reading Principle I now understand database query organization
✅ Agents enforcing Clean Architecture now enforce query layer separation
✅ Agents generating implementation tasks now reference this principle
✅ Code review agents can validate primitive vs orchestration boundaries

Sections Aligned:
✅ Core Principles: Principle I (ENHANCED) with database query layer organization
✅ Development Standards & Quality Gates → Step 6 added to Database Changes Workflow
✅ Governance/Constitution Authority implicitly updated

No deferred placeholders. All tokens resolved.

=== HISTORICAL AMENDMENTS ARCHIVE ===

Version 1.3.0 (Source vs Build Artifacts Amendment)
Previous Version: 1.2.1
Ratified: 2026-04-05
Last Amended: 2026-04-05

Version Bump Rationale: MINOR (1.2.1 → 1.3.0)
- New Principle X: Source vs Build Artifacts (STRICT) — Enforces strict separation of source code and build outputs
- Prohibits generated/compiled files in src/ directories
- Mandates single output directory per package (dist/, .next/, etc.)
- Requires imports via declared exports, never direct file access
- Ensures clean version control and Turborepo caching
- Applies to all file types: TypeScript, CSS, bundles, codegen, AI-generated artifacts

Principles Modified/Added:
✅ Principle X (NEW): Source vs Build Artifacts (STRICT)
   - Source directories contain ONLY handwritten source files
   - All build outputs go to dedicated output folders (dist/, .next/, etc.)
   - Generated TypeScript (.js, .d.ts, .map), CSS, chunks, codegen must be in output folder only
   - src/ directories MUST NEVER contain compiled/generated artifacts
   - Cross-package imports via declared exports only, never direct src/dist/ access
   - Applies to all: TypeScript compilation, CSS preprocessing, bundlers, codegen, AI artifacts

Sections Aligned:
✅ Core Principles now total 10 (was 9)
✅ Constitution Authority section updated to include source/artifact separation
✅ Governance section intact

Templates Requiring Updates:
⚠ .specify/templates/plan-template.md → Add Constitution Check gate for Principle X (Build Artifact Clean Architecture)
⚠ .specify/templates/spec-template.md → Add compliance gate for X (source/output separation validation)
⚠ .specify/templates/tasks-template.md → Add "Build Artifact Separation" and "Output Directory Validation" tasks in Constitution Compliance section

Follow-Up Actions:
- Add .gitignore validation to lint pipeline to ensure dist/, build/, .next/ are excluded from version control
- Document package.json exports structure in ARCHITECTURE_PLAYBOOK.md
- Consider ESLint rule to detect imports from src/ or dist/ directories directly
- Add Turborepo cache validation to CI/CD (ensure only declared outputs are cached)

No deferred placeholders. All tokens resolved.

Version 1.2.1 (Test Script Configuration Amendment)
Previous Version: 1.2.0
Ratified: 2025-04-03
Last Amended: 2026-04-05

Version Bump Rationale: PATCH (1.2.0 → 1.2.1)
- New Workflow: Test Script Configuration — Mandates --watchAll=false for all test runners (vitest, jest)
- Ensures test scripts exit cleanly in CI/CD environments and prevent terminal hangs
- Establishes test:watch as local-only development command

Development Standards Section Updated:
✅ New subsection: "Test Script Configuration"
   - All test scripts MUST use non-interactive flags
   - Scripts must exit automatically in CI/CD (no hanging processes)
   - vitest scripts: use `vitest --run`
   - jest scripts: use `jest --watchAll=false`
   - cypress scripts: already exit by default
   - test:watch ONLY for local development

Rationale:
- Prevents CI/CD pipeline hangs from watch mode
- Ensures predictable test completion in automated environments
- Maintains developer experience (watch mode still available locally)

Sections Aligned:
✅ Development Standards & Quality Gates → Test Script Configuration added
✅ Definition of Done section references test script standards

No deferred placeholders. All tokens resolved.

---

Version 1.2.0 (Backend Purity & Monorepo Architecture Amendment)
Previous Version: 1.1.0
Ratified: 2025-04-03
Last Amended: 2026-04-05

Version Bump Rationale: MINOR (1.1.0 → 1.2.0)
- Principle II ENHANCED: Added Next.js 16 caching requirements ('use cache' directive enforcement, backend exclusion from cache logic)
- New Principle VIII: Backend Packages (Pure TypeScript Libraries) — Enforces framework-agnostic backend, prohibits Next.js APIs in backend
- New Principle IX: Monorepo Architecture & Package Boundaries — Defines 5-package structure, dependency flow rules, cross-feature interface requirements

Principles Modified/Added:
✅ Principle II (ENHANCED): Server-Components First & Type-Safe Rendering with Next.js 16 Caching
   - Added: Caching logic via 'use cache' in app layer only
   - Added: Backend packages forbidden from managing revalidation/tags
   - Clarification: Backend provides business logic; apps handle cache invalidation

✅ Principle VIII (NEW): Backend Packages (Pure TypeScript Libraries)
   - Backend must be pure TypeScript: domain logic, services, adapters, pure functions only
   - Forbidden: Next.js APIs, server actions, cache directives, framework runtime features
   - Backend is framework-agnostic and testable in isolation
   - Can be used in Node.js, Vercel Functions, or future runtimes without modification

✅ Principle IX (NEW): Monorepo Architecture & Package Boundaries
   - Defines 5-package structure: @db, @ui, @backend, @dashboard, @storefront
   - Enforces dependency flow: apps depend on ui + backend; backend depends on db; db/ui are leaf packages
   - Cross-feature dependencies only via core application interfaces
   - Violating package boundaries is critical architecture violation

Sections Aligned:
✅ Core Principles now total 9 (was 7)
✅ Governance section intact
✅ Development Standards & Quality Gates reference updated architecture

Templates Requiring Updates:
⚠ .specify/templates/plan-template.md → Add Constitution Check gates for Principles VIII (Backend Purity) & IX (Package Boundaries)
⚠ .specify/templates/spec-template.md → Add compliance gates for VIII & IX (monorepo architecture validation)
⚠ .specify/templates/tasks-template.md → Add "Backend Package Purity" and "Package Boundary Validation" tasks in Constitution Compliance section

Follow-Up Actions:
- Update ARCHITECTURE_PLAYBOOK.md to reference Principles VIII & IX
- Add monorepo boundary checks to lint pipeline (if not already present)
- Document package dependency graph in architecture docs
- Create eslint rules to enforce package boundary violations

No deferred placeholders. All tokens resolved.

---

Version 1.1.0 (DRY & SOLID Design Principles Amendment)
Previous Version: 1.0.0
Ratified: 2025-03-20
Last Amended: 2026-04-05

Version Bump Rationale: MINOR (1.0.0 → 1.1.0)
- Principle VI: DRY Principle (Don't Repeat Yourself) — Enforces single source of truth across codebase
- Principle VII: SOLID Design Principles — Object-oriented and functional design best practices
- Development Standards: CLEAN CODE section — Mandatory code quality guidelines (naming, functions, comments)

Principles Added:
✅ Principle VI (NEW): DRY Principle (Don't Repeat Yourself)
   - Every piece of logic, type, component, utility has single source of truth
   - Duplication eliminated through extraction and reuse
   - Shared domain types, utilities, composable components, hooks are norm
   - Copy-paste coding explicitly forbidden; flagged in code review

✅ Principle VII (NEW): SOLID Design Principles
   - S (Single Responsibility): One reason to change per function/class/module
   - O (Open/Closed): Open for extension, closed for modification
   - L (Liskov Substitution): Derived types are substitutable
   - I (Interface Segregation): Dependencies on minimal, specific interfaces
   - D (Dependency Inversion): Depend on abstractions, not concrete implementations

Development Standards Enhanced:
✅ New subsection: CLEAN CODE Principles (Mandatory Standard)
   - Naming: Names reveal intent, pronounceable, non-misleading
   - Functions & Methods: Small, single responsibility, minimal parameters, early returns
   - Comments & Documentation: Explain WHY, not WHAT; keep current
   - SOLID Anti-Patterns: Feature Envy, God Objects, Tight Coupling, Divergent Change
   - Definition of Done extended: Code Quality Gates section added

Sections Aligned:
✅ Core Principles now total 7 (was 5)
✅ Development Standards expanded with CLEAN CODE section
✅ Definition of Done extended with quality gate checklist

No deferred placeholders. All tokens resolved.

-->

**Version**: 1.3.0 | **Ratified**: 2026-04-05 | **Last Amended**: 2026-04-05
