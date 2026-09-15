# Backend Feature Barrel Migration Plan

Implements [ADR-0001](../adr/0001-backend-feature-barrels.md). Ten PRs, one per feature, smallest import-surface first. Each PR is independently mergeable and revertable.

## Per-PR checklist

For feature `<name>`:

1. **Add the barrel** — `backend/src/features/<name>/index.ts`, re-exporting only:
   - Zod-inferred `type`s / DTOs (never the entity class itself, e.g. re-export `type Product`, not `ProductEntity`)
   - Repository/service *interfaces* (e.g. `IReviewRepository`), never concrete implementation classes
   - Factory functions (e.g. `createSchoolServices`)
2. **Narrow the export** — in `backend/package.json`, replace `<name>`'s coverage under the `"./features/*"` wildcard with an explicit entry: `"./features/<name>": "./src/features/<name>/index.ts"`. Once every feature has an explicit entry, delete the wildcard.
3. **Codemod the call sites** — run the ts-morph script (see below) scoped to `@findeg/backend/features/<name>` across `frontend/dashboard/src` and `frontend/storefront/src`, rewriting deep imports to the barrel path.
4. **Add the lint rule** — extend `no-restricted-imports` in `frontend/dashboard`'s and `frontend/storefront`'s eslint configs with a pattern blocking `@findeg/backend/features/<name>/**` except the barrel itself, with a message pointing to `backend/src/features/<name>/index.ts`.
5. **Verify** — typecheck both frontend apps; a stale deep import fails at compile time (module not found) if the codemod missed anything.

## Rollout order

| Order | Feature | Import sites | Depths in use | Notes |
|---|---|---|---|---|
| 1 | `media` | 1 | root only | trivial |
| 2 | `notifications` | 1 | root only | trivial |
| 3 | `identity` | 14 | root only | single depth, higher volume |
| 4 | `cart` | 5 | root, `domain/entities/Cart` | first feature with a leaf-level type import |
| 5 | `review` | 6 | root, `domain/entities/Review`, `application/interfaces/IReviewRepository` | first repo-interface export |
| 6 | `school` | 7 | root, `application/interfaces/*`, `application/services/factory` | first factory-function export |
| 7 | `administration` | 25 | root, `application/interfaces/*`, `domain/entities/AuditLogEntry` | |
| 8 | `order` | 18 | root, `domain/entities/Order`, `application/services/OrderService` (type-only) | |
| 9 | `core` | 56 | root, `domain/auth`, `domain/auth/authorization`, `domain/types/common`, `domain/value-objects` | cross-cutting; touched by every other feature's frontend consumers, do after the pattern is proven |
| 10 | `catalog` | 75 | root, `application/dtos`, `domain`, `domain/entities/Product`, `domain/entities/Variant`, `application/interfaces/*` | largest, all 4 depths in use; `IProductRepository` has no implementation (see ADR-0001 consequences) — decide implement-vs-delete before or during this PR |

## Codemod

A ts-morph script scoped by feature name:

- Input: feature name, source globs (`frontend/dashboard/src/**/*.{ts,tsx}`, `frontend/storefront/src/**/*.{ts,tsx}`)
- For each import declaration whose module specifier matches `@findeg/backend/features/<name>/...` (anything deeper than the bare feature path), rewrite the specifier to `@findeg/backend/features/<name>` and merge with any existing barrel import in the same file
- Leave named imports untouched — only the specifier changes, since barrels re-export the same names
- Flag (don't auto-fix) any import of a symbol not found in the new barrel's exports, for manual review — this is where a class-shaped import would need a DTO substitution, though the survey found none exist today

## Sequencing note

Features 1–6 (through `school`) are a warm-up: they validate the barrel + codemod + lint pattern on single- or low-depth features before `core` and `catalog`, which carry the real coupling risk. Don't skip ahead to `core`/`catalog` even though they're the highest-value fix — the earlier PRs are where codemod bugs and lint-rule false positives get caught cheaply.
