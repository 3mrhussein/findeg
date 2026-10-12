---
status: accepted
---

# `@findeg/domain` is FindEg's pure, rich business domain

ADR-0017 made `@findeg/schema` the one home of FindEg's business values. It stayed anemic: it held value lists and data shapes but none of the rules that use them, and it also carried things that are not business (the Outbox, Guest Order Access, a payment "phase", portal roles, serial ids). Meanwhile the rules were scattered and drifted apart. Money had three implementations, stock availability had four formulas, and the order, partner and list rules were split across the Backend, the database package and the Storefront. Decided in [#402](https://github.com/3mrhussein/findeg/issues/402). This ADR supersedes ADR-0017.

## Decisions

- **The package is `@findeg/domain` (`packages/domain`), and it is the business domain and only that.** It holds the values, entities with branded identities, value objects (Money, Order Reference, Egyptian mobile phone, shipping address, Public Code, SKU), the relation map and the business rules (transitions, invariants, calculations) of a stationery store whose first partner segment is schools. An export belongs only if an owner of the business would recognise it as a thing or a rule of the business.
- **What ADR-0017 kept still holds.** The package is a leaf: its only dependency is `zod`, never Drizzle, the database, another workspace package or Node. It is browser-safe, so both apps run the same rules in client bundles. `db` derives its enums and constraints from it.
- **It is pure.** It does no I/O and reads no global clock or randomness: `now` and random sources are arguments. Rule violations are typed `DomainError`s with a stable code and no HTTP status; the application layer decides how to present them. Programmer error, such as a random source that returns the wrong number of bytes, throws a `TypeError` instead; only a breach of a business rule throws a `DomainError`.
- **It owns Money.** One Money value object: EGP with exactly two decimals, held as a non-negative `bigint` count of hundredths, so no calculation can produce a third decimal or a negative amount. React Server Components serialise a `bigint` as it is, and any JSON boundary converts Money with `moneyToDecimal`. `@findeg/money` is retired.
- **It holds no plumbing.** No tables, columns, serial-id types or bookkeeping timestamps; no slugs or SEO fields; no input DTOs; no application services, ports or repositories; no auth, sessions, Staff permission codes, audit, Outbox, idempotency or hashing; no display labels, translations or formatting. A value that leaves the domain has exactly one owner, the lowest layer that uses it.
- **Cross-area links are by id, never by object.** An entity stores the branded id of an entity in another area, and the relation map records every link with the field that holds it. The relation tests check the map against the exported types.

## Considered options

- **Keep `@findeg/schema` as values only and leave the rules in the layers.** Rejected: the rules are where the layers disagreed, so values alone did not stop the drift.
- **One domain package per business area.** Rejected for now: the areas share Money, identities and the time zone, and one leaf package keeps the dependency graph trivial.

## Consequences

- #399 switches db, `@findeg/orders`, the Backend and both apps to the domain, applies the approved rule changes and deletes the copies. Until then, the old copies are still live.
- Every business value, entity, relation and rule is declared in `@findeg/domain`. A second copy of any of them is a bug.
- The style (plain data with pure functions, classes only where an aggregate guards several invariants) can change after launch; the ownership of the rules cannot.
