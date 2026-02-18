# Implementation Standards (Clean Architecture)

This guide defines engineering standards for implementing and reviewing code in FindEg.

---

## 1. Definition of Done

A task is done only when all are true:

1. Spec and plan updated:
   - `project-planning/SYSTEM_SPECIFICATION.md`
   - `project-planning/MISSING_FLOWS_MATRIX.md`
   - `project-planning/USE_CASE_BACKLOG.md`
   - `docs/testing/FRONTEND_TEST_MASTER_PLAN.md` (when test scope changes)

2. Contracts updated:
- Domain types and zod schemas are explicit
- Service/repository interfaces updated first

3. Implementation complete:
- Infrastructure adapters and APIs updated
- UI bound to current API contracts in the same change set

4. Validation complete:
- `npm run type-check` passes
- `npm run lint` passes
- migrations validated if schema changed

5. Docs updated:
- affected feature README updated with behavior/diagram changes

---

## 2. Layer-by-Layer Rules

## Domain
- Keep pure and deterministic.
- Avoid framework types (Next.js/React/ORM).
- Prefer strict unions (`OrderStatus`, `UomCode`, `CustomerGroup`) over freeform strings.
- Snapshots must be explicit for historical correctness.

## Application
- Expose behavior through interfaces (`I*Service`, `I*Repository`).
- Keep orchestration and policy here (not in routes/components).
- No direct DB/ORM calls.

## Infrastructure
- Repository methods must map DB rows to domain types centrally.
- Evolve schema with explicit migrations and clear data transition notes.
- Keep migration scripts and schema declarations synchronized.

## API / Server Actions
- Validate body/query/params with zod.
- Return consistent shape and status codes.
- During MVP, prefer fast coherent iteration; breaking internal contracts is allowed when all callers are updated together.

## UI
- UI forms may transform user input into DTOs.
- Avoid leaking transport/database concerns into components.
- New complex data paths should have preview/validation UX.

---

## 3. Coding Conventions

- No `any` unless unavoidable; if used, isolate and document.
- Prefer explicit helpers over inline complex objects.
- Keep side effects in services/adapters, not in domain entities.
- Keep DTO schemas near entry boundaries (`domain/schemas` or route-level schema files).

---

## 4. Migration Checklist

When changing persistence:

1. Update schema file(s) under `core/infrastructure/persistence/schema`.
2. Add migration SQL in `scripts/migrations/`.
3. Apply migration on local DB.
4. Verify tables/indexes and basic CRUD path.
5. Update planning docs and test plan:
   - `project-planning/SYSTEM_SPECIFICATION.md`
   - `project-planning/MISSING_FLOWS_MATRIX.md`
   - `project-planning/USE_CASE_BACKLOG.md`
   - `docs/testing/FRONTEND_TEST_MASTER_PLAN.md` (if coverage/scope changed)

---

## 5. Review Checklist

Before merge:

1. Boundaries respected (domain/application/infra/ui)
2. Contract changes are documented and all internal consumers are updated in the same change
3. Snapshot integrity preserved for orders/payments
4. Multi-language support preserved for translatable entities
5. Admin actions are auditable where applicable
6. Docs + diagrams updated for affected feature

---

## 6. UI Separation Pattern (Required)

For new feature work and refactors, keep UI and behavior separate:

1. Hooks for interactive state and URL/query synchronization.
- Example: filter/sort state in `use*` hooks.

2. Utility/query modules for data shaping.
- Parse query params, build view models, sort/filter transformations outside page JSX.

3. HOCs for reusable behavior injection when multiple components share behavior contracts.
- Use HOCs to inject behavior/state into presentational components instead of duplicating logic.

4. Presentational components should be replaceable.
- Avoid embedding business rules in JSX files.
- A UI redesign should mostly touch view files, not hooks/query modules.
