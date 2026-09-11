# Target architecture

This directory is the canonical source for FindEg's phase-one target architecture.
It records the desired end state and migration constraints, not a claim that all
legacy code already conforms to it.

| Need | Canonical source |
| --- | --- |
| Domain terminology | [`CONTEXT.md`](../../CONTEXT.md) |
| Target architecture and constraints | [`0001-target-architecture.md`](../adr/0001-target-architecture.md) |
| HTTP contracts | [`v1.yaml`](../contracts/openapi/v1.yaml) |
| Runtime and release expectations | [`docs/operations/README.md`](../operations/README.md) |
| Package ownership and imports | [`docs/package-guidance.md`](../package-guidance.md) |

The older architecture guides in this directory are historical evidence for the
migration. They must not be used to introduce new package boundaries, portal
roles, or deployment topology.

`pnpm architecture:check` verifies this index remains complete and reports
prohibited dependency directions.
