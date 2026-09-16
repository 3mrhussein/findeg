---
status: proposed
---

# Enforce a barrel seam for `@findeg/backend` features

`backend/package.json` exports `"./features/*": "./src/features/*"`, so every path under `backend/src/features/**` — domain entities, application services, repository interfaces, DTOs — is importable at any depth. `frontend/dashboard` and `frontend/storefront` both import at inconsistent depths (feature root, `domain`, and leaf files), sometimes for the same feature in different files, coupling two independent Next.js apps to backend internal layout. A survey of 208 existing import sites found none actually depend on class identity or behavior (every "entity" import resolves to a Zod-inferred `type`, and service imports are types or factory functions) — so we can close this seam without changing runtime behavior.

We will replace the wildcard export with one `index.ts` barrel per feature, re-exporting only DTOs/types/interfaces/factory functions (never concrete domain-entity or service classes), and narrow `package.json`'s `exports` field to point at feature-root barrels only. A codemod will rewrite existing deep imports to barrel imports, feature by feature, smallest import-surface first (`media`, `notifications`, `identity`, `cart`, `review`, `school`, `administration`, `order`, `core`, `catalog`). Each feature lands as its own PR: barrel + narrowed export + scoped codemod + a scoped ESLint `no-restricted-imports` rule blocking that feature's deep paths, so the barrier holds without waiting for every feature to migrate at once.

## Amendment: client-safe schemas entry point

Issue #127 / PR #128 found a gap this ADR didn't originally cover: bundlers resolve every static import in a file before tree-shaking, so a Client Component importing one Zod schema from a feature's barrel also pulls in everything else that barrel re-exports — including the service factory, which transitively imports `db/src/connection.ts` (Node's `net`/`tls` via the `postgres` driver) and breaks the client build. Barrel-depth enforcement alone doesn't prevent this: the schema and the service factory can both live at the barrel root.

`backend` and `db` stay framework-agnostic (no `server-only` or other Next.js-specific mechanism); the fix lives in the shape of the barrel and in the Next.js apps that consume it:

- Every feature barrel that exports a Zod schema value used for client-side form validation must also have a **`schemas.ts`** entry point (exported via `package.json` as `./features/<feature>/schemas`) containing only isomorphic DTO/Zod-schema exports — never services, factories, or anything with an import path to `db/connection.ts`. `catalog`, `order`, and `core` have one as of this amendment.
- The Next.js apps' shared ESLint config (`packages/config/eslint/next.js`) enforces this at two levels: the existing `no-restricted-imports` internals block exempts `<feature>/schemas` from the deep-import ban, and a small custom rule (`local/no-full-barrel-import-in-client-components`) blocks importing a feature's known schema *values* from the full barrel inside a `'use client'` file, pointing at the schemas entry point instead. Plain type imports from the full barrel remain fine in Client Components — types are erased at compile time and carry no bundle risk.
- A feature only needs a `schemas.ts` once it actually exports a schema value; features that export only types/interfaces (`identity`, `cart`, `review`, `school`, `administration`, `media`, `notifications` as of this amendment) don't need one.

## Considered options

- **Re-export concrete classes through the barrel** — less migration work, but only relocates the leak to one file per feature instead of closing it; frontends would still couple to internal shape/behavior. Rejected.
- **Rely on the narrowed `exports` field alone, no ESLint rule** — one source of truth, but a deep import fails as a raw module-resolution error instead of a message pointing at the barrel. Rejected in favor of both: `exports` narrowing as the hard backstop, ESLint as the immediate, friendlier feedback.
- **Migrate all ten features in one PR** — fewer PRs, but the highest-risk features (`core`, 56 sites across 3 depths; `catalog`, 75 sites across 4 depths) would land without a smaller feature having proven the barrel/codemod/lint pattern first. Rejected in favor of one PR per feature, smallest first.

## Consequences

- Any future frontend code that needs something not currently re-exported (e.g. a domain entity method) must get a DTO/interface added to the feature's barrel deliberately — it can no longer be reached by a deeper import path.
- `IProductRepository` (see the catalog PR) has no implementation today; narrowing catalog's barrel is a natural point to decide whether to implement it or delete it, but that decision is out of scope for this ADR.
