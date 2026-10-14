---
status: accepted
---

# Domain as the single source of truth and bounded-context packages

Business values and rules drift when persistence, input validation and UI each declare their own versions. Decided in #464 under spec #434: `@findeg/domain` is the single source of truth for every business value, entity, relation and rule. Layers extend or derive from Domain for their own needs; they never redefine its values or reimplement its rules. This preserves the pure, browser-safe leaf and ownership contract of [ADR-0018](0018-domain-package-is-the-pure-rich-business-domain.md).

## Derivation in each layer

- **Database:** construct Drizzle enums from Domain arrays, for example `pgEnum('locale', LOCALES)`. Generate SQL CHECK value sets from the same arrays rather than writing a second literal list. Derive persistence types from Domain types, adding storage fields or converting representations at the boundary. Existing migrations remain historical snapshots; a new Domain value requires a generated migration before deployment, not a rewritten old migration.
- **Application packages:** build Zod/input schemas from exported Domain schemas, or `z.enum(LOCALES)` for a Domain value set. Compose application fields and validation around them; call Domain functions for business decisions. Commands own transactions, persistence, access checks and idempotency, not copies of business invariants.
- **Backend infrastructure and composition:** consume Domain values/types and application results when mapping notification payloads, Outbox messages or media metadata. Infrastructure owns delivery and transport details; it delegates business decisions to Domain through the application packages.
- **Apps:** derive UI option lists by mapping Domain arrays. Key labels, translations and locale configuration by Domain types using exhaustive maps, for example `localeLabels satisfies Record<Locale, string>` or `translations satisfies Record<Locale, Messages>`. Use `satisfies Record<DomainType, …>` for every finite Domain value set requiring layer-owned entries. Display formatting belongs to the UI; business calculations use Domain functions.

No layer may redeclare a Domain value set as a literal array, enum, union or copied schema. Exhaustive map keys supply layer-owned data, not another definition of the value set. A new Locale or Customer type must propagate automatically through derived structures, or fail type-check exactly where a layer must supply a label, translation or mapping. Runtime input validation must use the same source. Type-checking cannot apply a database migration or prove that deployed constraints are current.

## Topology

Keep one application package per bounded context under `packages/`: catalog, inventory, school-lists, partners, identity, and orders. Orders includes checkout and Guest Order Access; they are not separate application packages. Each application package depends on `@findeg/domain` and `@findeg/db`, follows the recursive source layout in [ADR-0019](0019-shared-standards-and-package-source-conventions.md), and exports only its root index and `types` entry. Consumers use those entries; feature/helper internals stay private. Dependency edges remain acyclic.

`backend` remains infrastructure and composition: core infrastructure, notifications, the Outbox worker, and media. It composes the application packages rather than retaining competing business implementations. `@findeg/db` stays as is: this decision does not reorganize its workspace or public entries. Domain remains a single pure package, not one Domain package per context, and never depends on application packages or persistence.

## Supersession and rollout

This decision supersedes ADR-0001's application-feature topology and client-safe schema barrel/lint policy, and ADR-0016's three-entry Orders contract and custom client-bundle boundary policy. Next.js owns server/client boundaries; server-side app query modules use `server-only`. Do not add framework markers or bundler-specific entry splitting in Domain, db, application packages or Backend.

ADR-0019 is accepted as the standards target. Acceptance of these decisions records the architecture, not completed enforcement. Existing feature entries and Orders `schemas`/`events` entries remain transitional until consumers and contract checks migrate together; #443 owns the root/types contraction. Follow-on tickets implement the bounded-context extraction and derivation gaps. #445 owns measured full standards activation. This ticket changes documentation only and does not claim those migrations are complete.
