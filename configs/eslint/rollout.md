# Global standards rollout (#436)

The complete global baseline lives in `standards.js`. Existing profiles append it
when `FINDEG_ESLINT_STANDARDS=1`. The default remains the compatibility baseline;
this is explicit staged activation, not a downgrade of preset rules or a warning
ratchet for the target. The complete target uses errors from the maintained
presets. `findeg-lint` and workspace lint scripts remain the acceptance interface.

```sh
FINDEG_ESLINT_STANDARDS=1 pnpm --filter @findeg/domain lint
# Once each scope is remediated, its owner appends standards(role) unconditionally
# in its workspace entry; #445 removes compatibility and the temporary switch.
```

Turbo hashes and passes this variable for lint. A target-mode lint run cannot
reuse a compatibility-mode result. Consumers can also import
`standards` from `@findeg/config/eslint/standards` and await
`standards(role, { root: workspaceDirectory })` in a flat configuration. Append it
after the compatibility profile to preserve the existing dependency/import guards.
No library layout policy is part of this global configuration. Next.js continues
to own server/client boundaries.

## Presets and narrow overrides

- All code extends JavaScript recommended. TypeScript extends every entry of
  `strictTypeChecked`, with the project service resolving each workspace's
  `tsconfig.json`. Configuration JS/MJS receives JavaScript checks and naming;
  TypeScript configuration entries must be included in a workspace TS project.
  Files outside a TS project fail visibly rather than falling back to untyped TS.
- Browser/UI code extends React recommended, React JSX runtime, Hooks recommended,
  and accessibility recommended. Next apps extend official Core Web Vitals and
  the full accessibility baseline using Next's existing plugin instance.
- Node workspaces extend `eslint-plugin-n` recommended module checks. In Next,
  Node checks cover root configuration entries, server data modules and route
  handlers, while the official Next preset covers app source. This avoids applying
  Node-only assumptions to Client Components.
- TypeScript props are checked by `tsc`; `react/prop-types` is disabled only for
  TSX. The JSX runtime preset handles React's automatic JSX transform.
- `tsc` owns TypeScript path/extension resolution and emitted syntax checks;
  Node's `no-missing-import`, `no-missing-require` and
  `no-unsupported-features/es-syntax` are disabled only in TypeScript files.
  JavaScript retains these checks.
- Prettier's config runs last to disable conflicting formatting rules. The
  existing Prettier formatter/check remains in the compatibility hygiene layer.

Naming checks local bindings, not property names. Type information recognizes
function aliases, class aliases, React JSX return types, typed React components,
and React wrappers in TSX. A DOM or locally declared `Element` does not grant a
component exception. JavaScript config uses lexical function/alias resolution.
Non-function mutable variables receive no naming convention.

## Activation ownership

| Scope | Complete mode today | Activation / remediation owner |
| --- | --- | --- |
| Domain | Available, opt-in; whole library enforced (scope `src`) | #439 pilot (Common, Customers, Catalog), #440 (Inventory, Orders), #441 (Partners, School Lists) and #442 (Relations, root and types entries) enforced; #445 final activation |
| Domain Errors | Available, opt-in | #445 measured remediation |
| Money | Package absent from this checkout | Retirement stays with #415; nothing to activate here |
| UI | Available, opt-in | #445 measured remediation |
| Env | Available, opt-in | #438 relocation, #445 remediation/activation |
| Orders | Available, opt-in; whole library enforced (scope `src`) | #443 phase 1 (recursive layout, root and types entries) enforced; #443 phase 2 (subpath contraction and consumer migration); #445 final activation |
| Backend, db | Available, opt-in | #445 measured remediation/activation |
| Dashboard, Storefront | Available, opt-in | After #400/#401 app rebuilds; #445 measured remediation/activation |
| Shared configuration | Available, opt-in | #445 config/CI activation audit |

## Recursive library layout (#layout)

`configs/eslint/rules/library-layout.js` enforces the recursive library vocabulary:
index, types, constants and helpers (`.ts`, or `.tsx` for index/helpers) inside a module, including the source root;
`helpers/` and `features/` as containers of named module directories, recursively from `src/`;
free-named directories directly under a module are rejected; `__tests__/` and test
files exempt. A module holds either `helpers.ts` (which needs an `index.ts`) or a
`helpers/` container, never both. It applies only to the subtrees listed in
`configs/library-scopes.mjs`, through `libraryLayout(scopes)` in each package's
flat configuration, so applications and the UI library keep their own layouts. Shared
Vitest uses the same list: library scopes measure 80% per file and require local
executable `__tests__` only inside those scopes. `scripts/architecture/library-layout.test.mjs`
exercises positive and negative fixtures and the real Domain and Orders trees.

## Inventory and Orders (#440)

Inventory and Orders follow the library vocabulary: each bounded context under `src/features/` has `index`, `types`,
`constants` and `helpers` files, and each feature under `features/` is a module of the same
shape (`order-status`, `cart`, `quote`, `acceptance`, and so on). Every implementation
directory has local executable tests in its `__tests__/`. Their scopes are listed in
`configs/library-scopes.mjs`, so Vitest measures 80% per file for those subtrees.

Preserved public behavior: `@findeg/domain`, `@findeg/domain/orders` and
`@findeg/domain/inventory` export the same names with the same runtime kinds as before the
restructure (checked against the pre-change export list). Internal filenames such as
`order-status.ts` or `allocation.ts` are not public; consumers import the subpaths, so the
temporary bounded-context subpath aliases keep parallel consumer migration (#399, #443) decoupled from internal
file moves. Business rules, Money, branded identities, injected time and randomness, and typed
errors are unchanged.

## Orders library and root entries (#443 phase 1)

`packages/orders/src` follows the same recursive vocabulary as Domain. Its root holds `index`, `types`, `helpers` (the `createOrders` factory), and `features/`
modules. Each feature has its own `__tests__/` with executable tests:
`input-schemas` (client-safe schemas), `order-events` (the pure status message protocol),
`write-permission`, `order-errors`, `order-mapping`, `validation`, `order-reads`,
`order-statistics` and `order-status-changes`. Database-bound features are exercised through
the injected database seam with a scripted, test-only client (`src/__tests__/fixture.ts`),
so Vitest measures them without PostgreSQL; the PostgreSQL integration suite in
`backend/src/testing/orders` still covers the same commands on a real database.

Public entries during phase 1: `@findeg/orders` (the root runtime, `src/index.ts`),
`@findeg/orders/types` (the type-only root entry, `src/types.ts`, a type-only re-export of the
root index), and the retained `@findeg/orders/schemas` and `@findeg/orders/events` subpaths,
which now point at their feature indexes. `src/__tests__/entries.test.ts` pins the root runtime
names and checks that every `schemas` and `events` name is also reachable from the root.

Public PascalCase names (`OrderStatusSchema`, `PaymentStatusSchema`, `OrderStatusUpdateSchema`)
are kept for consumers. Internally they are camelCase constants exported under those names, so
the naming rule applies without renaming the public contract. Phase 2 removes the subpaths and
migrates consumers to the root and types entries.

## Relations and root entries (#442)

`src/features/relations/` follows the same vocabulary: `constants.ts` (`ENTITY_DOMAINS`, `RELATIONS`),
`types.ts` (`Relation` and entity names), `index.ts`, and `__tests__/relations.test.ts`, which
checks the map against the public domain types. The root runtime index is `@findeg/domain`; the
root type entry is `@findeg/domain/types` (`src/types.ts`, a type-only re-export of the root
index, so it has no runtime value). `src/__tests__/entries.test.ts` pins the root runtime names
and checks that every bounded-context subpath is a subset of the root. Bounded-context subpaths remain until #443.

Cycle checks: `scripts/architecture/domain-import-cycles.test.mjs` forbids runtime cycles.
Type-only cycles (for example `types.ts` ↔ `constants.ts`) are erased and are not checked.

## Measurement

`violations.json` records actual complete-config diagnostics by workspace/rule,
including parse failures. Counts describe this checkout before consumer migration;
they are measurements, not suppressions or allowed baselines. Measurement uses
ESLint's public `lintFiles(['.'])` interface with the same `standards(role,
{ root: workspace })` configuration. It does not write a ratchet or modify source.
The existing command for a fully composed measurement is:

```sh
FINDEG_ESLINT_STANDARDS=1 pnpm --filter <workspace> exec eslint . --format json
```

Measured with the complete configuration (`standards(role, { root: workspace })`, ESLint `lintFiles(['.'])`). Counts are per workspace; rule-level breakdowns live in `violations.json`. `packages/money` is absent from this checkout, so it is not measured.

- `packages/domain` (isomorphic): 162 files, 0 errors, 0 warnings (the library scope `src` reports 0; `vitest.config.ts` is in the Domain TypeScript project)
- `packages/domain-errors` (isomorphic): 7 files, 1 errors, 0 warnings
- `packages/money` (isomorphic): No files matching '.' were found.
- `configs/env` (node): 14 files, 0 errors, 0 warnings
- `packages/orders` (node): 46 files, 0 errors, 0 warnings (library scope `src`; #443 phase 1)
- `backend` (node): 331 files, 975 errors, 0 warnings
- `db` (node): 138 files, 297 errors, 0 warnings
- `frontend/ui` (browser): 56 files, 147 errors, 0 warnings
- `frontend/dashboard` (next): 371 files, 1226 errors, 11 warnings
- `frontend/storefront` (next): 274 files, 807 errors, 3 warnings
- `configs` (node): 25 files, 6 errors, 0 warnings

The Node plugin (`eslint-plugin-n`) is declared in `configs/package.json` and resolved by the workspace lockfile. `violations.json` records actual complete-config diagnostics, including parse failures. These are measurements, not suppressions, ratchets, or allowed baselines. Fully composed lint for one workspace: `FINDEG_ESLINT_STANDARDS=1 pnpm --filter <workspace> exec eslint . --format json`.

Fixtures in `scripts/architecture/ecosystem.test.mjs` use actual flat configs and
`findeg-lint` exit status. Every preset family (JavaScript, TypeScript strict
type-aware, React/Hooks/a11y, Next, Node, naming, Prettier) executes; none skip.

## Domain derivation (#466; remediation and activation #467)

The existing `local/no-domain-value-set-copies` guard retains its default #416
array, union and SQL enforcement. `FINDEG_DOMAIN_DERIVATION=1` adds literal-key
objects/maps, exhaustive per-value maps and business constants as **errors** through
all canonical and compatibility profiles. Default lint remains green during this
staged rollout. The switch is passed and hashed by Turbo; measurement cannot reuse
a default-mode lint result. #467 fixes the recorded violations and makes the expanded
option unconditional. No suppression or warning baseline is added.

```sh
# Existing lint seam; expected to fail until #467 remediates the measured violations.
FINDEG_DOMAIN_DERIVATION=1 pnpm lint --concurrency=1 --continue
# Machine-readable diagnostics for a single workspace:
FINDEG_DOMAIN_DERIVATION=1 pnpm --filter @findeg/backend exec eslint . --format json
```

Value sets, literal types and constants are discovered from Domain's public export
graph; context paths are not hard-coded. Consumers import `@findeg/domain` or
`@findeg/domain/types`. Per-value labels, translations and colours supply literal
objects checked with `satisfies Record<DomainType, Value>`. Nested records, namespace
imports, renamed types, local aliases and tuple-derived types (`typeof LOCALES[number]`)
are recognized. Missing/extra/duplicate
keys, `Partial`, assertion-based maps and literal-key `Map` copies fail. Domain,
tests/fixtures and historical migrations retain the original exemptions.

Hard-coded strings such as the business time zone/currency and regular expressions
are matched against public constants. Numeric constants are checked in matching
camelCase/UPPER_SNAKE_CASE declarations or properties (including shippingFee), and
stock comparisons use the exported threshold. Shipping money factories are checked
in fee/shipping contexts. Unrelated numbers and prices remain legal: an arbitrary
literal `5` or price of `50.00` alone cannot identify a business policy. All matched
values come from Domain, including exported literal aliases.

Both apps' routing uses `LOCALES` and `DEFAULT_LOCALE`. Their exhaustive message-loader
maps import the real translation files. The architecture canary copies Domain's real
type graph and app i18n files, resolves tuple declarations through the package root,
and adds a Locale and a customer-facing StockLevel. Drizzle enums, zod schemas and
chained layer types must grow automatically. Missing per-value maps fail in db,
packages, backend and both apps; supplying those entries restores a clean type-check.
The current Customer interface has no separate customer-kind value set to mutate.

`violations.json` preserves #436's measurements and adds `domainDerivation` per
workspace, owned by #467: file counts, error counts and exact file/line/message
lists from the composed workspace configuration (`ESLint.lintFiles(['.'])`, with
`FINDEG_DOMAIN_DERIVATION=1`). These are measurements of the #466 working tree based
on `2349b31ff`, not suppressions. The architecture suite includes positive/negative
fixtures, existing-CLI exit checks and actual Turbo hash separation.
