# Feature Specification: Test Pipeline Restructuring and Fixes

**Feature Branch**: `004-test-pipeline-fixes`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "npm run test command should run type-check first then unit tests then e2e tests, make sure to adapt this behaviour at all levels, then fix all type errors in all packages when running npm run typecheck or npm run test on root level"

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Feature uses 4-layer structure (domain/application/infrastructure/presentation); no cross-feature infrastructure imports
- **II. Server-Components First**: All new UI uses Server Components by default; Client Components justified for interactivity only
- **III. Bilingual & RTL-First**: All UI text added to BOTH `en.json` and `ar.json`; logical Tailwind classes used
- **IV. Feature-Oriented Core Kernel**: Feature is self-contained in `src/features/[feature]/`; dependencies on `core` only
- **V. Type-Safe & Testable**: Zod schemas at boundaries; TypeScript strict mode; tests for critical paths
- **VI. DRY Principle**: No duplicated logic, components, or utilities; single source of truth for all abstractions
- **VII. SOLID Design**: Single Responsibility verified; Open/Closed principle applied; Liskov Substitution, Interface Segregation, Dependency Inversion evident

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer runs tests at Root Level (Priority: P1)

Developers need a unified, cascading test pipeline at the root level of the monorepo to ensure application health across all packages.

**Why this priority**: It is critical to enforce CI/CD and developer testing standards comprehensively. Running the standard test command should be deterministic.

**Independent Test**: Can be fully tested by running `npm run test` from the monorepo root and observing the ordered output of checks and tests.

**Acceptance Scenarios**:

1. **Given** a developer is in the monorepo root, **When** they run `npm run test`, **Then** the terminal completes type-checking, proceeds to unit tests, and finally executes end-to-end tests successfully for all packages.
2. **Given** a type error exists in any package, **When** they run `npm run test`, **Then** the type-checker catches it and aborts the pipeline before running unit tests.

---

### User Story 2 - Developer runs tests within a Package (Priority: P1)

Developers working inside a specific workspace package need the local test command to mimic the behavior of the global pipeline on a smaller scale.

**Why this priority**: Fast feedback cycles during local development require package-scoped pipeline consistency.

**Independent Test**: Can be independently tested by changing directory into a package (e.g., `packages/dashboard`) and running package-level test commands.

**Acceptance Scenarios**:

1. **Given** a developer is in `packages/storefront`, **When** they run `npm run test`, **Then** the pipeline executes `type-check -> unit tests -> e2e` only for the storefront package.

---

### User Story 3 - Resolving Root-Level Compilation Errors (Priority: P1)

The pipeline improvements are blocked by existing compilation errors. These errors must be addressed across the Monorepo to yield a passing build out of the box.

**Why this priority**: The pipeline cannot be truly verified if the default checkout state fails compilation immediately.

**Independent Test**: Can be fully tested by running `npm run type-check` at the root and observing `0 errors`.

**Acceptance Scenarios**:

1. **Given** the current state of the backend and frontend packages, **When** the developer runs `npm run type-check` globally, **Then** all packages build without emitting any TypeScript errors.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The root monorepo `package.json` MUST configure its `test` command to run `type-check`, then `test:unit`, then `test:e2e` sequentially.
- **FR-002**: Every applicable package in `packages/` MUST have a `test` command defined to run `type-check` followed by any existing unit and e2e test steps.
- **FR-003**: Type definitions, invalid imports, implicit `any` signatures, and other TypeScript failures in `packages/dashboard`, `packages/backend`, and other workspaces MUST be fully resolved.
- **FR-004**: Running `npm run typecheck` from the root MUST result in exactly zero errors across all packages.
- **FR-005**: If unit testing or e2e configurations are presently missing in some packages, the `test` script MUST NOT fail ungracefully, but should safely exit zero for those phases or just run the phases that are currently available.

### Key Entities

- **package.json (Root)**: Controls the global turbo orchestration for testing and type-checking.
- **package.json (Workspaces)**: The scripts layer for individual packages that will be refactored.
- **TypeScript Configuration**: The `.tsconfig` files governing strictness.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Root-level execution time of `npm run type-check` should complete without error codes within 60 seconds on a CI/CD runner or local developer environment.
- **SC-002**: Passing threshold of 100% on the TypeScript strict compiler check across all connected monorepo workspaces.
- **SC-003**: The CI/CD or local test command behavior matches the sequence exactly: 1. Types -> 2. Unit -> 3. E2E.

## Assumptions

- We assume no additional testing frameworks (e.g. Playwright, Jest, Vitest) need to be newly installed if they don't already exist. The goal is to coordinate the _commands_ and test pipeline definitions.
- The `type-check` target may be named `type-check` or `typecheck` inconsistently; this task will standardize it.
- Resolving the type errors does not mandate architectural rewrites unless the architecture inherently prevents typing inference (e.g., untyped DB rows). If so, casting or mock typing is an acceptable fallback to unblock the pipeline on this branch.
