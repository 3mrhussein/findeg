# Feature Specification: Fix Storefront Type Errors

**Feature Branch**: `003-fix-storefront-types`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "Fix TypeScript type-checking errors in the @findeg/storefront package. These errors include missing exports from @findeg/ui, missing dependencies (drizzle-orm, resend, etc.), and type mismatches in shop-queries.ts and SearchOverlay.tsx."

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Ensure dependency boundaries between packages are respected. Storefront should correctly depend on `ui` and `backend` (if applicable).
- **II. Server-Components First**: All new UI uses Server Components by default; Client Components justified for interactivity only
- **III. Bilingual & RTL-First**: All UI text added to BOTH `en.json` and `ar.json`; logical Tailwind classes used
- **IV. Feature-Oriented Core Kernel**: Feature is self-contained in `src/features/[feature]/`; dependencies on `core` only
- **V. Type-Safe & Testable**: Eliminate all `any` types and ensure strict type checking passes across the workspace.
- **VI. DRY Principle**: Ensure shared UI components are correctly exported and used, rather than duplicated.
- **VII. SOLID Design**: Single Responsibility verified; Open/Closed principle applied; Liskov Substitution, Interface Segregation, Dependency Inversion evident

---

## Clarifications

### Session 2026-04-05

- Q: How should the storefront handle `ProductDetailPageData | null` from the backend? → A: Propagate `| null` from the cache wrapper; the calling page handles 404.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Clean Build and Type-Check (Priority: P1)

As a developer, I want to run `npm run type-check` and see zero errors, so that I can be confident in the codebase's type safety and avoid runtime regressions.

**Why this priority**: Blocking CI/CD and developer productivity. Without a clean type-check, we cannot guarantee the system's stability.

**Independent Test**: Run `npm run type-check` in the root or `packages/storefront` and receive a success exit code.

**Acceptance Scenarios**:

1. **Given** the current state of the repo, **When** I run `npm run type-check`, **Then** it should complete successfully without reporting missing modules or type mismatches in the storefront.

---

### User Story 2 - Correct UI Component Imports (Priority: P1)

As a developer, I want to import components like `Button`, `Input`, and `Container` from `@findeg/ui` without TypeScript reporting them as missing, so that I can use shared UI primitives consistently.

**Why this priority**: Essential for UI development and consistency.

**Independent Test**: Open `SearchOverlay.tsx` or `PageStateError.tsx` in a TS-aware editor and see no red squiggles on `@findeg/ui` imports.

**Acceptance Scenarios**:

1. **Given** a component in `storefront` importing `Button` from `@findeg/ui`, **When** the type-checker runs, **Then** it should resolve the export correctly.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `@findeg/ui` MUST correctly build and export all shadcn/ui primitives and shared components listed in its `src/index.ts`.
- **FR-002**: `@findeg/storefront` MUST have all required peer/direct dependencies (e.g., `drizzle-orm`, `resend`, `swr`) declared in its `package.json`.
- **FR-003**: All implicit `any` types in `storefront` (e.g., event handlers in `SearchOverlay.tsx`) MUST be explicitly typed.
- **FR-004**: The storefront `getProductDetailData` cache wrapper MUST return `ProductDetailPageData | null`, propagating the backend's nullability. The calling page component MUST handle the `null` case (e.g., render a 404 page).

### Key Entities _(include if feature involves data)_

- **ProductDetailPageData**: Domain entity reflecting product details. The storefront cache wrapper propagates `null` when the product is not found; the calling page handles the 404 display.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `npm run type-check` exits with code 0 in the root directory.
- **SC-002**: Zero `TS2305` (Missing exported member) errors related to `@findeg/ui` in the storefront.
- **SC-003**: Zero `TS2307` (Cannot find module) errors for standard dependencies in the storefront.
- **SC-004**: Zero `TS7006` (Implicit any) errors in modified files.

## Assumptions

- The missing exports in `@findeg/ui` are due to build configuration or incomplete build artifacts, rather than missing source files.
- Missing dependencies like `drizzle-orm` are intended to be direct dependencies of the storefront if it uses them for local data handling or server actions.
- The `ProductDetailPageData` being `null` in `shop-queries.ts` is a valid runtime state and should be handled by the UI.
