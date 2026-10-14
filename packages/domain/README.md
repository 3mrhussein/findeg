# @findeg/domain

One pure business domain, split by bounded context under `src/features/`: Common
(shared kernel), Customers, Catalog, Inventory, Orders, Partners, School Lists and
Relations. Each context retains its nested `features/` modules and local `__tests__/`.
The recursive source vocabulary is index/types/constants/helpers files, `features/`
and `helpers/` containers, named modules inside those containers, and `__tests__/`.

Consumers use `@findeg/domain` or `@findeg/domain/types`. Existing bounded-context
subpaths remain available until #443 phase 2 and point at the context indexes.
Root runtime export names are pinned by `src/__tests__/entries.test.ts`.

Run `pnpm lint`, `pnpm type-check` and `pnpm test` in this workspace. Shared Vitest
policy measures all source implementation at 80% per file for all four metrics and
requires executable tests in each implementation directory's own `__tests__/`.
