# ADR 0001: Adopt the phase-one target modular monolith

**Status:** Accepted — target architecture

## Decision

FindEg will converge on one private pnpm/Turborepo monorepo containing one web
application with separate Customer Storefront, Partner Workspace, and FindEg
Back Office route areas. A worker from the same revision delivers the durable
outbox. The web and worker share framework-independent, authorized application
operations and runtime composition; neither duplicates business rules.

The target has eight responsibility owners: Identity & Access, Partner
Management, Catalog, School Supply Lists, Inventory, Commerce, Partner Rewards,
and Partner Reports. Each owns its rules, public contracts, persistence mapping,
schema definitions, and writes. Cross-owner workflows use declared interfaces
inside an injected transaction runner. Drizzle remains in persistence adapters.

One PostgreSQL database and one ordered migration history are retained. Accepted
commercial facts are immutable snapshots or append-only accounting entries.

## Constraints

- Browser code must not import `@findeg/db`.
- Business code under `backend/src/features` must not import Next.js.
- Database code must not import `@findeg/backend`.
- A module reads or writes another module only through that module's declared
  contract; reporting views are read-only exceptions approved by their owner.
- Versioned JSON HTTP adapters call the same application operations as direct
  web callers and workers.
- A cross-module workflow commits commercial writes, stock reservation,
  attribution snapshots, idempotency outcome, and the required outbox record in
  one transaction; external delivery happens after commit.
- Existing Storefront/dashboard packages and historical documents are migration
  evidence, not target architecture. Do not expand them with new behavior.

## Consequences

Migration work is target-first: introduce a conforming vertical slice and its
quality gates before retiring its legacy counterpart. No new generic shared
package is allowed without demonstrated shared behavior and a narrowly named
owner. Existing code may remain temporarily only when its target replacement
and retirement gate are explicit.
