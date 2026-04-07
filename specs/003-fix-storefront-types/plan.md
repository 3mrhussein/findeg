# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Resolve all TypeScript errors in `@storefront` to ensure a clean `npm run type-check`. This includes adding missing dependency declarations, explicitly typing implicit `any` handlers, fixing nullability mismatches from the backend wrapper, and verifying the `@ui` build emits the expected declarations.

## Technical Context

**Language/Version**: TypeScript 5.7+
**Primary Dependencies**: Next.js 16.0, React 19, @ui, drizzle-orm, resend, swr, @react-email/components
**Storage**: N/A
**Testing**: tsc, vitest
**Target Platform**: Web (Next.js)
**Project Type**: Web Application & UI Package
**Performance Goals**: N/A
**Constraints**: Zero `any` types permitted; clean `type-check` required (SC-001)
**Scale/Scope**: Localized to `@storefront` and `@ui` packages

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**FindEg.com Constitution (.specify/memory/constitution.md) Compliance Gates** — Test each principle:

1. **[x] Clean Architecture** - Dependency boundaries between packages are respected.
2. **[x] Server-Components First** - N/A (Type fixes only)
3. **[x] Bilingual & RTL-First** - N/A (Type fixes only)
4. **[x] Feature-Oriented Core Kernel** - N/A
5. **[x] Type-Safe & Testable** - Core focus of this feature.
6. **[x] DRY Principle** - Ensures `ui` is properly exported to avoid duplication.
7. **[x] SOLID Design** - N/A
8. **[x] Definition of Done** - Requires clean `npm run type-check`.

**Violations found**: None.

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
packages/
├── storefront/
│   ├── package.json
│   └── src/
│       ├── components/shared/SearchOverlay.tsx
│       ├── hooks/use-toast.ts
│       └── queries/shop-queries.ts
└── ui/
    └── tsconfig.json
```

**Structure Decision**: Fixes are isolated to the `packages/storefront` and `packages/ui` projects in the monorepo.
