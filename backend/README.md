# Backend

Target business rules belong in `src/modules`; cross-module application operations
belong in `src/application`. The `runtime` package composes their persistence and
security adapters for the unified web host and independent worker. Use explicit
module contracts/public interfaces and application exports from `package.json`.
See [package guidance](../docs/package-guidance.md) for supported import boundaries.

The root export, `features/*`, `portal-entry`, and their associated code and tests
are retained compatibility evidence. They are not the target application API or
an alternative authentication path. Do not add new behavior to them. Retire each
surface only after its callers are migrated and its replacement behavior passes
the target gates, following the
[retirement register](../docs/package-guidance.md#retained-compatibility-evidence-64).
Preserve capabilities needed by the [frontend migration](../docs/frontend-migration.md).

Run development and verification from the repository root using the
[supported commands](../README.md#development). `pnpm quality:check` builds server
adapters, checks types and boundaries, and runs target and retained compatibility
tests. There is no standalone backend server to start.
