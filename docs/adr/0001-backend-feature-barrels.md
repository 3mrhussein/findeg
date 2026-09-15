---
status: proposed
---

# Enforce a barrel seam for `@findeg/backend` features

`backend/package.json` exports `"./features/*": "./src/features/*"`, so every path under `backend/src/features/**` — domain entities, application services, repository interfaces, DTOs — is importable at any depth. `frontend/dashboard` and `frontend/storefront` both import at inconsistent depths (feature root, `domain`, and leaf files), sometimes for the same feature in different files, coupling two independent Next.js apps to backend internal layout. A survey of 208 existing import sites found none actually depend on class identity or behavior (every "entity" import resolves to a Zod-inferred `type`, and service imports are types or factory functions) — so we can close this seam without changing runtime behavior.

We will replace the wildcard export with one `index.ts` barrel per feature, re-exporting only DTOs/types/interfaces/factory functions (never concrete domain-entity or service classes), and narrow `package.json`'s `exports` field to point at feature-root barrels only. A codemod will rewrite existing deep imports to barrel imports, feature by feature, smallest import-surface first (`media`, `notifications`, `identity`, `cart`, `review`, `school`, `administration`, `order`, `core`, `catalog`). Each feature lands as its own PR: barrel + narrowed export + scoped codemod + a scoped ESLint `no-restricted-imports` rule blocking that feature's deep paths, so the barrier holds without waiting for every feature to migrate at once.

## Considered options

- **Re-export concrete classes through the barrel** — less migration work, but only relocates the leak to one file per feature instead of closing it; frontends would still couple to internal shape/behavior. Rejected.
- **Rely on the narrowed `exports` field alone, no ESLint rule** — one source of truth, but a deep import fails as a raw module-resolution error instead of a message pointing at the barrel. Rejected in favor of both: `exports` narrowing as the hard backstop, ESLint as the immediate, friendlier feedback.
- **Migrate all ten features in one PR** — fewer PRs, but the highest-risk features (`core`, 56 sites across 3 depths; `catalog`, 75 sites across 4 depths) would land without a smaller feature having proven the barrel/codemod/lint pattern first. Rejected in favor of one PR per feature, smallest first.

## Consequences

- Any future frontend code that needs something not currently re-exported (e.g. a domain entity method) must get a DTO/interface added to the feature's barrel deliberately — it can no longer be reached by a deeper import path.
- `IProductRepository` (see the catalog PR) has no implementation today; narrowing catalog's barrel is a natural point to decide whether to implement it or delete it, but that decision is out of scope for this ADR.
