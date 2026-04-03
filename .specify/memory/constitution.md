# FindEg.com E-Commerce Platform Constitution

A modern, multilingual e-commerce application specializing in school supplies, stationary, and kids' toys. Built on Next.js 16 with Clean Architecture, strict type-safety, and bilingual support (English/Arabic) with full RTL compliance.

## Core Principles

### I. Clean Architecture with Strict Layer Boundaries

Domain logic MUST be completely isolated from technical details (database, UI framework, external services). All features follow the 4-layer model: **domain** (pure business rules), **application** (use cases/orchestration), **infrastructure** (adapters/DB), and **presentation** (UI/routes). Cross-feature dependencies are PROHIBITED at infrastructure level—only through application interfaces. No feature's infrastructure code may be imported directly by another feature or UI. Authorization checks MUST use guard interfaces (`IPermissionService`), never role-string checks in routes/components.

### II. Server-Components First & Type-Safe Rendering

Server Components are the default for all new UI. Client Components (`'use client'`) are permitted ONLY for interactive elements (forms, client state, event handlers). All data fetching must flow through Services or ViewModels in the application layer—no direct DB access in routes. TypeScript strict mode is MANDATORY. No `as any` casts are permitted; interfaces and adapters must be properly typed. Every API boundary must validate input with Zod schemas; every domain entity must be strongly typed.

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

## Governance

**Constitution Authority**
This constitution supersedes all other architectural guidance. It is the source of truth for:

- Layer boundaries and import rules
- Component placement restrictions
- i18n and RTL compliance standards
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
Version: 1.1.0 (DRY & SOLID Principles Amendment)
Previous Version: 1.0.0
Ratified: 2025-04-03
Last Amended: 2026-04-03

Version Bump Rationale: MINOR (1.0.0 → 1.1.0)
- New Principle VI: DRY Principle (Don't Repeat Yourself)
- New Principle VII: SOLID Design Principles (expands design discipline)
- Enhanced "Development Standards" with CLEAN CODE section (code quality practices)
- Updated Definition of Done to include code quality gates (DRY, SRP, SOLID, CLEAN CODE)

Principles Modified/Added:
✅ Principle VI (NEW): DRY Principle — Single source of truth enforcement + refactoring discipline
✅ Principle VII (NEW): SOLID Design Principles — SRP, O/C, LSP, ISP, DIP enforcement
✅ Development Standards (ENHANCED): CLEAN CODE Principles section added (naming, functions, comments, anti-patterns)
✅ Definition of Done (ENHANCED): Code Quality Gates added (DRY, SRP, SOLID, CLEAN CODE verification)

Sections Aligned:
✅ Core Principles now total 7 (was 5)
✅ Development Standards → CLEAN CODE practices documented
✅ Code Review Standards section references DRY + SOLID compliance

Templates Requiring Follow-Up (from initial extraction):
⚠ .specify/templates/plan-template.md → Add Constitution Check gates for Principles VI (DRY) & VII (SOLID)
⚠ .specify/templates/spec-template.md → Add Constitution Compliance gates for VI & VII
⚠ .specify/templates/tasks-template.md → Add DRY/SOLID compliance tasks in "Constitution Compliance Tasks" section

No deferred placeholders. All tokens resolved.
-->

**Version**: 1.1.0 | **Ratified**: 2025-04-03 | **Last Amended**: 2026-04-03
