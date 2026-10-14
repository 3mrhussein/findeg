# Ecosystem preset rollout (#476)

`standards.js` is the single ESLint baseline. Profiles append FindEg's runtime,
dependency, public-entry, Domain derivation, integrity and scoped layout rules.
There is no standards environment switch, hand-picked TypeScript baseline,
JSDoc baseline or ESLint formatting check. Prettier remains the formatter through
`eslint-config-prettier` (last in the baseline) and lint-staged.

## Default activation

`activation.mjs` is the one explicit complete-preset list, independent of the
layout/coverage list in `../library-scopes.mjs`. Workspace lint commands resolve
the tier from their working directory. Every library and shared configuration
workspace uses complete presets by default; #445 owns the remaining activation.

| Workspaces | Default tier | Role |
| --- | --- | --- |
| `packages/domain`, `packages/domain-errors` | Complete | Isomorphic |
| `packages/catalog`, `packages/identity`, `packages/inventory`, `packages/orders`, `packages/partners`, `packages/school-lists` | Complete | Node |
| `configs`, `configs/env` | Complete | Node |
| `backend`, `db` | Recommended | Node |
| `frontend/ui` | Recommended | Browser |
| `frontend/dashboard`, `frontend/storefront` | Recommended | Next |

Both tiers extend `@eslint/js` recommended and an entire maintained TypeScript
preset. Complete uses `strictTypeChecked` with the project service and local
naming; recommended uses `typescript-eslint` recommended without type information
or naming. This is staged activation of whole presets, not selected rule lists,
warning baselines or exemptions for activated violations.

Complete browser roles add React recommended, JSX runtime, Hooks recommended and
jsx-a11y recommended. Complete Next adds Core Web Vitals and the full accessibility
preset using Next's plugin instance. Complete Node roles add `eslint-plugin-n`
recommended module checks. In Next, Node checks apply to root configuration,
server data modules and route handlers, rather than Client Components.

TypeScript entries belong to their workspace's `tsconfig.json`; files outside the
project fail visibly. `configs` now participates in root lint, type-check and test
commands and has a project for its shared TypeScript tooling. It ignores `env/`
in lint because that independently checked workspace has its own project.

## Narrow overrides

Each override has its justification beside the configuration:

- TypeScript props use `tsc`; runtime prop validation remains on JavaScript JSX.
- `tsc` owns TypeScript import/require resolution and emitted syntax checks, so
  Node's source resolution and syntax-version rules are disabled only for TS.
- Underscore parameters describe intentionally unused callback/port parameters;
  other unused variables retain the preset check.
- Cypress uses ambient namespace merging to extend its global commands;
  declarations are allowed without allowing implementation namespaces.
- Executable `bin/*.mjs` entry points communicate their status with `process.exit`.
- `eslint-config-prettier` disables formatting conflicts; ESLint never reports
  Prettier formatting.

Naming checks local bindings while preserving external keys and public export
names through aliases. Class constructors and instances are distinguished from
callable adapters that also expose construct signatures. Type-only imports can
refer to values through `typeof`; they follow the exported symbol's category.

Library layout, local test placement and per-file coverage remain derived from
`../library-scopes.mjs`. Applications and UI retain their source layouts. Next.js
continues to own server/client boundaries; this rollout adds no boundary policy.

## Complete-preset measurement

Run from the repository root:

```sh
node scripts/architecture/measure-eslint.mjs --complete
```

The script starts a fresh ESLint process per workspace, uses its actual composed
config plus the complete role baseline, and calls `ESLint.lintFiles(['.'])`.
`violations.json` records every current workspace, including all context packages,
with file/error/warning counts and a breakdown by rule (parse errors use `parse`).
These are measurements for #445, never suppressions or allowed baselines. The
measurement includes raw diagnostics hidden by an application's pre-existing CLI
bulk suppressions; it does not create or change those suppressions.

`preset-activation.test.mjs` proves default activated lint rejects strict typing
and naming violations, the recommended tier accepts the same code, and formatting
is absent from lint. `ecosystem.test.mjs` executes every role preset through real
ESLint configs and the lint CLI. Existing architecture fixtures retain layout,
Domain derivation, dependency, coverage and change-selection checks.

## #445 inventory after #476

Activated libraries and shared configuration have zero complete-preset diagnostics.
Remaining complete-preset measurements (including existing app bulk suppressions):

| Workspace | Errors | Warnings |
| --- | ---: | ---: |
| `backend` | 251 | 0 |
| `db` | 264 | 0 |
| `frontend/ui` | 146 | 0 |
| `frontend/dashboard` | 1006 | 10 |
| `frontend/storefront` | 761 | 3 |

Total: 2,428 errors and 13 warnings. #445 owns remediation and activation.
