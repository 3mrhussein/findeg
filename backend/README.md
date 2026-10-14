# @findeg/backend

Backend contains infrastructure and composition: session/token transport, logging,
storage/media, notification delivery, audit persistence and the Outbox worker.
Business operations live in `@findeg/{identity,catalog,inventory,school-lists,partners,orders}`;
business values and rules live in `@findeg/domain`.

The explicit export map in `package.json` publishes the infrastructure entries listed
in [ADR-0020](../docs/adr/0020-domain-single-source-and-bounded-context-packages.md).
Consumers use those entries. Dashboard wires the audit adapter into context ports
in its own server-side composition module. Next.js owns server/client boundaries.

Run `pnpm --filter @findeg/backend lint`, `type-check`, `test` and `test:integration`.
Integration tests need PostgreSQL; the shared harness lives in `configs/vitest/postgres`.
Context business integration suites live with their owning packages. Backend tests
cover infrastructure delivery and composition. See [integration setup](../README.md#running-integration-tests).
