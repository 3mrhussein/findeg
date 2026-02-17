# Onboarding Guide

This guide helps a new developer become productive on FindEg's MVP codebase.

## 1. Read First

1. `README.md`
2. `project-planning/SYSTEM_SPECIFICATION.md`
3. `project-planning/IMPLEMENTATION_PLAN.md`
4. `docs/architecture/ARCHITECTURE_PLAYBOOK.md`
5. `docs/guides/IMPLEMENTATION_STANDARDS.md`

## 2. Quick Setup

```bash
cp .env.example .env.local
npm install
npm run db:start
npm run db:setup
npm run dev
```

## 3. Architecture Mental Model

- The app is feature-based under `src/features/*`.
- Each feature follows clean layers: `domain`, `application`, `infrastructure`, `ui`.
- Shared concerns live in `src/features/core`.
- Routes are in `src/app/[locale]/...`.

## 4. Where to Work

- Business rules/types: feature `domain/`
- Use cases/contracts: feature `application/`
- DB/adapters: feature `infrastructure/`
- Screens/forms/components: feature `ui/` or route-level components

## 5. MVP Reality

- Project is in initial MVP development.
- External backward compatibility is not required yet.
- If you change contracts, update all internal callers in the same change.

## 6. Before You Open a PR

1. Update spec/plan docs if behavior or schema changed.
2. Run `npm run type-check`.
3. Run `npm run lint`.
4. Update affected feature README diagrams and notes.
