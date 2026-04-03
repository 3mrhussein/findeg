---
description: "Use when editing src/features/**. Enforces Clean Architecture import boundaries, no-JSX presentation rules, and the schema/migration workflow (Drizzle + SQL migrations + planning docs)."
applyTo: "src/features/**"
---

# Features (src/features/\*\*) — Clean Architecture + migrations

## Layer rules (non-negotiable)

- `domain`:
  - Pure types/business rules/value objects; no framework deps.
- `application`:
  - Orchestrates use cases; define interfaces here (`I*Service`, `I*Repository`).
  - UI and infrastructure depend on **contracts**, not concrete implementations.
- `infrastructure`:
  - Implements application interfaces (DB/adapters); keep Drizzle/SQL details here.
- `presentation`:
  - Presentation logic only (hooks/mappers/config/schemas).
  - **NO JSX** in `src/features/**/presentation/**` (enforced by ESLint).

## Cross-feature dependency rules

- Do NOT import another feature’s `infrastructure` directly.
- Do NOT do role-string checks in UI/routes; use permission guard interfaces (e.g. `IPermissionService`).

## Schema / migration workflow

When persistence changes are needed:

1. Update schema in `src/features/core/infrastructure/persistence/schema/`.
2. Add migration SQL in `scripts/migrations/`.
3. Validate locally (db start/setup + relevant CRUD path).
4. Update planning docs when behavior/schema changes: `project-planning/*`.

References:

- `docs/architecture/ARCHITECTURE_PLAYBOOK.md`
- `docs/development/conventions.md`
- `docs/guides/DEVELOPMENT.md`
- `docs/development/component-placement.md`
- `eslint.config.js`
