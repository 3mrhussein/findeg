# Implementation Plan: Universal Test Pipeline and Global Type Fixes

**Branch**: `004-test-pipeline-fixes` | **Date**: 2026-04-05 | **Spec**: [spec.md](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/specs/004-test-pipeline-fixes/spec.md)
**Input**: Feature specification from `/specs/004-test-pipeline-fixes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Restructure the test pipeline into a unified, sequential workflow (`type-check → unit → e2e`) across all 4 packages (`storefront`, `dashboard`, `backend`, `ui`). Resolve all global TypeScript compilation errors (primarily in `dashboard`) to achieve a clean 0-error build.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 22+
**Primary Dependencies**: Turbo 2.x, Vitest, Cypress, Next.js 16
**Storage**: N/A (Build/Script task)
**Testing**: Vitest (Unit), Cypress (E2E)
**Target Platform**: Node.js / Browser (Build & Runtime)
**Project Type**: Monorepo Test Infrastructure
**Performance Goals**: < 60s total type-check time
**Constraints**: Must fail fast on type errors
**Scale/Scope**: 4 core packages

## Constitution Check

_GATE: Passed before Phase 0 research. Re-checked after Phase 1 design._

**FindEg.com Constitution (.specify/memory/constitution.md) Compliance Gates** — Test each principle:

1. **[x] Clean Architecture** - Pipeline orchestration uses root/package layer separation.
2. **[x] Server-Components First** - N/A (Non-UI task, but type fixes will respect SC patterns).
3. **[x] Bilingual & RTL-First** - N/A (Non-UI task).
4. **[x] Feature-Oriented Core Kernel** - Self-contained in build scripts and dashboard fixes.
5. **[x] Type-Safe & Testable** - Core goal of the feature.
6. **[x] DRY Principle** - Standardizing scripts across packages to reduce inconsistency.
7. **[x] SOLID Design** - Separation of concerns between type-checking, unit, and e2e phases.
8. **[x] Definition of Done** - Plan includes type-check, unit tests, and E2E sequence.

**Violations found**: None.

## Project Structure

### Documentation (this feature)

```text
specs/004-test-pipeline-fixes/
├── plan.md              # This file
├── research.md          # Completed Phase 0
├── data-model.md        # Standardized Script Model
├── quickstart.md        # Command usage guide
└── tasks.md             # Implementation steps (Next)
```

### Source Code (affected paths)

```text
/
├── package.json         # Root orchestration
├── turbo.json           # Task DAG
├── packages/
│   ├── backend/         # package.json
│   ├── dashboard/       # package.json + src/ type fixes
│   ├── storefront/      # package.json
│   └── ui/              # package.json
```

**Structure Decision**: Standard monorepo configuration update across all workspaces.

## Complexity Tracking

N/A
