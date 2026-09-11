# Package and module guidance

This is the canonical ownership guide for new target work.

- Keep business behavior with its responsibility owner; export only explicit
  application and contract surfaces.
- Keep persistence and concrete provider implementations behind owner-scoped
  infrastructure construction contracts.
- Keep orchestration in the application coordination layer and concrete wiring
  in runtime composition.
- Do not create a generic `shared` package. A new package needs demonstrated
  reuse, a narrow name, one owner, and an ADR if it changes dependency flow.
- Browser-safe code may import only browser-safe contracts. It never reaches the
  database or `@findeg/backend/**/infrastructure` directly; a public backend
  contract must be explicitly browser-safe before a browser consumer imports it.
- Database code provides persistence, migration, and schema assembly; it does
  not depend on business packages.

Run `pnpm architecture:check` after changing imports or any canonical document.

## Target runtime foundation (#52)

- `frontend/web` (`@findeg/web`) is the target Next.js executable. It owns browser
  presentation, locale layouts, and transport adapters. Its server adapter is
  marked `server-only`; runtime configuration is never passed to browser code.
- `runtime` (`@findeg/runtime`) owns process configuration and concrete startup
  wiring, shared by web, worker, and migrations. It has no browser-safe exports.
  This is the runtime layer required by ADR 0001, not a generic shared library.
- `@findeg/backend/portal-entry` is the compiled Identity & Access entry policy.
  It permits the public Storefront and denies authenticated entry until #54.
  The existing backend exports remain migration evidence.
- `@findeg/db/migrations` is the compiled persistence construction surface for
  the existing ordered migration history; importing it neither parses environment
  variables nor opens a connection. Only the migration runtime calls it.
- Target server entry points import emitted JavaScript through explicit exports.
  Their builds precede dependent type checks. Business owners never import runtime.

Legacy `frontend/storefront` and `frontend/dashboard` remain available through
`pnpm dev:legacy` for migration evidence. New behavior belongs in the target host;
#64 owns their retirement after replacement journeys are certified.

## Module data and transactions (#53)

The target business owners are `identity-access`, `partner-management`, `catalog`,
`school-supply-lists`, `inventory`, `commerce`, `partner-rewards`, and
`partner-reports`. Each has a persistence construction surface under
`db/src/modules/<owner>/schema.ts`, exported as `@findeg/db/modules/<owner>`.
New business contracts and operations belong under `backend/src/modules/<owner>`.
This split keeps the existing rule that database code never imports business code.

| Owner                  | Existing persisted records / responsibility                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Identity & Access      | Users, credentials, authentication accounts, roles and grants, guest principals                               |
| Partner Management     | Organizations and organization memberships (legacy names)                                                     |
| Catalog                | Products, variants, attributes, categories, brands, collections, tags, reviews and helpful votes, search logs |
| School Supply Lists    | Lists, items, alternatives, list access grants/requests/tokens/attempts and parent sessions                   |
| Inventory              | Warehouses, balances and stock movements                                                                      |
| Commerce               | Orders/items, Cart Kits, discount rules, addresses and saved payment methods                                  |
| Partner Rewards        | No persisted records yet; reward accounting lands in its feature ticket                                       |
| Partner Reports        | No persisted records yet; approved read views land with reporting                                             |
| Runtime infrastructure | Existing audit log, server logs and notifications; these are technical records, not a ninth business module   |

`db/src/runtime/schema.ts` assembles these fragments and the retained legacy
mappings, validates unique ownership, and exports the flat Drizzle schema.
`schemaOwnership` is the executable table-by-table ownership register. SQL schema
names do not imply ownership: for example, `identity.organizations` belongs to
Partner Management, and `school_engine.cart_kits` belongs to Commerce. These are
application ownership boundaries, not PostgreSQL role-based access controls.

Drizzle Kit uses this one assembly and `db/migrations` remains the only ordered
history. All owners contribute migrations there; no module gets its own migration
runner or journal. The database tests compare the migrated records with the
ownership register and verify replay. New tables belong in their owner's schema
fragment and must be exported through the assembly. Add an ordered migration and
update replay expectations when changing the physical schema. This ticket changes
ownership/construction, so it adds no SQL migration or replacement business tables.
The two existing migrations and retained schema mappings remain compatibility
evidence until their feature replacements and #64 retirement; their commercial
rules are not certified by assigning ownership.

### Application and construction boundaries

- `contracts.ts` exposes database-free types and may be browser-safe. `public.ts`
  exposes framework-independent application operations. Cross-owner business
  imports use only these named surfaces and must remain acyclic, including
  type-only dependencies. Add explicit package exports for new compiled surfaces;
  do not add wildcard exports exposing module internals.
- Concrete adapter factories belong in `infrastructure/`. They may import their
  owner's `@findeg/db/modules/<owner>` schema, Drizzle, and the infrastructure-only
  `TransactionDatabase` type from `@findeg/db/transactions`. They must not use
  another owner's schema or the legacy database connection/query barrels. Driver
  and pool constructors are runtime-only; the transaction import exception permits
  only the named type, never the database constructor.
- `@findeg/backend/transactions` exposes `TransactionRunner<Adapters>` and
  `TransactionOutcome<Value, Rejection>` without database or ORM types.
  Application orchestration receives this interface through dependency injection.
- `@findeg/runtime/transactions` constructs the runner with an explicit database
  configuration and one binder that constructs every participating adapter from
  the supplied transaction. It owns the pool; the process must await `close()`
  during shutdown. Importing these construction surfaces does not connect or read
  environment variables. Use a validated process configuration and budget the
  pool's `max` alongside other process connections.
- `run` calls the binder afresh inside each transaction. Await every adapter call;
  adapters and the transaction must not escape the callback. `{ ok: true, value }`
  commits before resolution. `{ ok: false, error }` rolls back and returns that
  rejection; exceptions roll back and propagate. External delivery happens after
  a successful return. The runner does not retry transactions or implement stock
  locking, idempotency, outbox delivery, or Order acceptance; those belong to the
  corresponding workflows.

`pnpm architecture:check` follows relative imports, configured TypeScript aliases,
package exports, re-exports, dynamic imports, `require`, and type imports. It
rejects database leaks from target contracts/operations, cross-owner internals,
computed target dependencies, unknown owners, legacy helper bypasses, and module
cycles. Schema fragments alone may bridge the retained legacy schema definitions;
new persistence adapters use only their own construction surface. Legacy schema
foreign-key/Drizzle relation references are retained assembly details, not permitted
cross-owner application calls. Future reporting read exceptions require explicit
owner approval and an enforced read-only contract; none is introduced here.
