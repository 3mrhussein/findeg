# Shared Vitest policy

The existing local acceptance command is `pnpm test` (`turbo run test`). CI's Unit
Tests leg in `.github/workflows/ci-jobs.yml` runs `pnpm exec turbo run test` with the
planner's selection/cache flags. Both execute workspace `vitest --run` scripts;
coverage and placement are enabled by configuration, without an extra CLI flag.
`pnpm test:architecture` exercises the policy through real positive/negative Vitest
fixture projects, including the Node/browser compatibility fixtures from #435.

## Staged activation

`activeWorkspaces` in `policy.mjs` is the single activation list. Domain Errors is
active: its existing local tests and measured implementation coverage meet the
policy. Environment configuration (`configs/env`, #438) is active with its consumer-entry
tests. Domain is active for its pilot library scopes (`configs/library-scopes.mjs`:
Common, Customers, Catalog, Inventory, Orders), which measure only those subtrees. Orders, Backend, DB,
UI, Dashboard and Storefront remain inactive pending #441-#445. Inactivity preserves
existing test runs; it is not evidence of sufficient coverage. Activating a workspace enables the same four 80% per-file
thresholds and, for libraries under `packages/`, local test validation. There are
no workspace-specific coverage thresholds. UI, backend, db and applications do
not inherit the library placement restriction.

Run measurements of inactive scopes with the existing command:

```sh
FINDEG_VITEST_MEASURE=1 pnpm test --concurrency=1 --continue -- --maxWorkers=1
```

This collects `coverage/coverage-summary.json` in each workspace and prints missing
library test directories. It does not lower thresholds in active workspaces.
Turbo hashes the measurement variable and caches coverage outputs. Use `--force`
to bypass cache when remeasuring. The JSON has entries for each file and metric;
a high aggregate percentage does not establish per-file compliance. #445 owns
remediation, remaining activation and the final CI activation matrix.

## Discovery and scope

Shared discovery includes arbitrary JS/TS filenames under `__tests__` and existing
`*.test.*`/`*.spec.*` filenames elsewhere; non-suite helpers named `fixture(s)` or
`helper(s)` under `__tests__` are excluded. Local placement is checked by a reporter
(`placement.mjs`) at Vitest init, so `--passWithNoTests` cannot skip it. Local library tests may be nested inside
the implementation directory's own `__tests__`; skipped/todo-only files do not
satisfy placement. Types/declarations-only and re-export-only source directories
are exempt, as are recursive `constants.ts` and `types.ts`. Test and generated
directories do not recursively require tests. Implementation-bearing indexes,
helpers and ordinary constant declarations remain measured.

Coverage includes JS/TS implementation across the workspace, including root files
and DB seeds, even when never imported. Exclusions cover named types/constants,
declarations, test infrastructure, generated code, configuration entries, Cypress
and build/dependency artifacts. React setup, aliases and server-only stubs remain
in the consumer configs. Backend unit tests still exclude PostgreSQL integration
tests; `pnpm test:integration` retains its separate database setup and serial run.

The shared global setup rejects disabling coverage or changing its thresholds or
source include policy in an active run. Keep its `globalSetup`/`provide` when
adding consumer setup. No migration may replace the shared policy with an
independent coverage configuration.

Coverage providers are declared in each consumer's devDependencies so a clean
install can load coverage without Vitest's interactive dependency installation.
