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
| Orders | Available, opt-in | #443 public contract migration, #445 remediation/activation |
| Backend, db | Available, opt-in | #445 measured remediation/activation |
| Dashboard, Storefront | Available, opt-in | After #400/#401 app rebuilds; #445 measured remediation/activation |
| Shared configuration | Available, opt-in | #445 config/CI activation audit |

## Library layout pilot (#439)

`configs/eslint/rules/library-layout.js` enforces the recursive library vocabulary:
index, types, constants and helpers (`.ts`, or `.tsx` for index/helpers) inside a module;
`helpers/` and `features/` as containers of module directories; `__tests__/` and test
files exempt. A module holds either `helpers.ts` (which needs an `index.ts`) or a
`helpers/` container, never both. It applies only to the subtrees listed in
`configs/library-scopes.mjs`, through `libraryLayout(scopes)` in each package's
flat configuration, so applications and the UI library keep their own layouts. Shared
Vitest uses the same list: pilot scopes measure 80% per file and require local
executable `__tests__` only inside those scopes. `scripts/architecture/library-layout.test.mjs`
exercises positive and negative fixtures and the real Domain pilot.

## Inventory and Orders (#440)

Inventory and Orders follow the library vocabulary: each area has `index`, `types`,
`constants` and `helpers` files, and each feature under `features/` is a module of the same
shape (`order-status`, `cart`, `quote`, `acceptance`, and so on). Every implementation
directory has local executable tests in its `__tests__/`. Their scopes are listed in
`configs/library-scopes.mjs`, so Vitest measures 80% per file for those subtrees.

Preserved public behavior: `@findeg/domain`, `@findeg/domain/orders` and
`@findeg/domain/inventory` export the same names with the same runtime kinds as before the
restructure (checked against the pre-change export list). Internal filenames such as
`order-status.ts` or `allocation.ts` are not public; consumers import the subpaths, so the
temporary area aliases keep parallel consumer migration (#399, #443) decoupled from internal
file moves. Business rules, Money, branded identities, injected time and randomness, and typed
errors are unchanged.

## Relations and root entries (#442)

`src/relations/` follows the same vocabulary: `constants.ts` (`ENTITY_DOMAINS`, `RELATIONS`),
`types.ts` (`Relation` and entity names), `index.ts`, and `__tests__/relations.test.ts`, which
checks the map against the public domain types. The root runtime index is `@findeg/domain`; the
root type entry is `@findeg/domain/types` (`src/types.ts`, a type-only re-export of the root
index, so it has no runtime value). `src/__tests__/entries.test.ts` pins the root runtime names
and checks that every area subpath is a subset of the root. Area subpaths remain until #443.

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
- `packages/orders` (node): 14 files, 15 errors, 0 warnings
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
