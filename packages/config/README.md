# @findeg/config

The lint standard for every package, as five layers composed into profiles. Nothing here is named after an app: a package picks a **profile** by what it is, and the profile applies every layer.

## Layers

| Layer | Question it answers | File | Rule |
| --- | --- | --- | --- |
| L0 hygiene | Is the code well formed? | `eslint/layers/hygiene.js` | Prettier, TypeScript basics, `required-package-scripts` |
| L1 runtime | What may it assume about where it runs? | `eslint/layers/runtime.js` | `local/runtime-imports` |
| L2 boundaries | Which workspace packages may it depend on? | `eslint/layers/boundaries.js` | `local/declared-workspace-dependencies` |
| L3 surface | Which entries of another package may it use? | `eslint/layers/surface.js` | `local/orders-boundary`, barrel rules (Next apps) |
| L4 integrity | Can it switch the checks above off? | `eslint/layers/integrity.js` | `local/no-suppression-comments` |

## Profiles

| Profile | Import | Use for |
| --- | --- | --- |
| `isomorphic` | `@findeg/config/eslint/isomorphic` | Leaf packages shared by server and browser: `money`, `domain-errors` |
| `node` | `@findeg/config/eslint/node` | Server packages and services: `backend`, `db`, `env`, `orders` |
| `react-ui` | `@findeg/config/eslint/react-ui` | Browser component libraries: `ui` |
| `next` | `@findeg/config/eslint/next` | Next.js apps: `dashboard`, `storefront` |

A package's `eslint.config.js` is the import and `export default`, plus app-only rules (the dashboard's `react/jsx-no-literals`). It never restates a layer.

**Add a stack:** add an entry to `RUNTIMES` in `layers/runtime.js` (globals and forbidden modules), add a three-line file in `eslint/profiles/`, and export it in `package.json`. **Add a package:** pick a profile and declare its workspace dependencies in `package.json`; L2 reads them from there.

## Enforcement and the ratchet

`eslint/standard.js` lists the rules that are **under ratchet**. Those report as warnings while known violations remain; every other rule is an error. Lint runs through `findeg-lint` (a thin wrapper around `eslint`), which compares each rule's warning count with `ratchet.json`:

- more warnings than the baseline: fail, fix the new violations;
- fewer warnings than the baseline: fail, lower the baseline so the gain cannot be lost;
- any error: fail.

**Promote a layer to error:**

1. Fix the violations for the rule, package by package.
2. In each package run `pnpm exec findeg-lint . --update-ratchet`; the rule's entry disappears from `ratchet.json`.
3. Delete the rule's line in `eslint/standard.js`. It is now an error everywhere.

Current backlog is whatever `ratchet.json` holds. Both files are owned by people: a feature change never edits `standard.js`, `ratchet.json`, `registry.js` or a layer, and never adds a suppression comment (L4 reports it).

## Verification

`scripts/architecture/standard.test.mjs` holds a violating fixture for each new rule and for the ratchet itself, so a rule cannot go quiet without a test failing. Run it with `node --test scripts/architecture/*.test.mjs`.

`eslint/registry.js` holds the repo-specific facts (backend feature barrels, client-safe schema exports). A new project replaces that file and keeps the layers and profiles.
