# Development Guide

This guide defines the current development workflow for FindEg in MVP stage.

## 1. Architecture Baseline

- Source of truth: `docs/architecture/ARCHITECTURE_PLAYBOOK.md`
- Standards checklist: `docs/guides/IMPLEMENTATION_STANDARDS.md`
- Active execution matrix: `project-planning/MISSING_FLOWS_MATRIX.md`
- Prioritized use cases: `project-planning/USE_CASE_BACKLOG.md`
- Test roadmap: `docs/testing/FRONTEND_TEST_MASTER_PLAN.md`
- Product/business constraints: `project-planning/SYSTEM_SPECIFICATION.md`

Code is feature-first under `src/features/*` with `core` as shared kernel.

## 2. Local Setup

```bash
cp .env.example .env.local
npm install
npm run db:start
npm run db:setup
npm run dev
```

Useful commands:

- `npm run db:status`
- `npm run db:shell`
- `npm run db:doc`
- `npm run type-check`
- `npm run lint`
- `npm run e2e:run`
- `npm run e2e:run:ci`
- `npm run changelog`

## 3. Feature Implementation Workflow

1. Update product + execution docs first (`SYSTEM_SPECIFICATION`, `MISSING_FLOWS_MATRIX`, `USE_CASE_BACKLOG`, and test plan when applicable).
2. Implement domain types and boundary schemas.
3. Update application interfaces (`I*Service`, `I*Repository`).
4. Implement infrastructure adapters and migrations (if needed).
5. Update APIs/server actions and UI together.
6. Validate with type-check + lint.
7. Regenerate changelog (`npm run changelog`) for delivery visibility.
8. Update feature README diagrams if behavior changed.

## 4. Current Schema Change Flow

When persistence changes are needed:

1. Update schema under `src/features/core/infrastructure/persistence/schema/`.
2. Add migration SQL in `scripts/migrations/`.
3. Apply migration locally and verify CRUD path.
4. Update planning docs (`SYSTEM_SPECIFICATION.md`, `MISSING_FLOWS_MATRIX.md`, `USE_CASE_BACKLOG.md`).

## 5. MVP Contract Policy

The project is still internal MVP and not integrated with external systems yet.

- Backward compatibility is not a hard constraint at this stage.
- Contract changes are allowed when all in-repo consumers are updated in the same change.
- Keep API contracts explicit and stable enough for active web/mobile clients in this repo.

## 6. Delivery Checklist

Before merge:

1. Business/domain assumptions documented.
2. Layer boundaries respected.
3. Migrations validated (if changed).
4. `npm run type-check` passes.
5. `npm run lint` passes.
6. Docs/diagrams updated for impacted areas.
