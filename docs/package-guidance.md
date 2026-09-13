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

## Versioned JSON contracts (#62)

`docs/contracts/openapi/v1.yaml` describes every released `/api/v1` route and method.
JSON adapters decode transport input, obtain opaque browser credentials, invoke the
runtime's authorized application operations, and translate outcomes to HTTP. Keep
commercial eligibility, authorization policy and idempotency inside those operations.
Clients import explicit `@findeg/backend/modules/<owner>/contracts` exports; never
send a caller-constructed Current Session as an authorization credential.

OpenAPI uses `status` outcomes for commerce and `errorCode`/`message` envelopes for
management errors. HTTP 200 Cart/quote responses can contain a business rejection;
clients must inspect the body. Checkout returns 201 for both first acceptance and
an identical replay; changed input under the same key returns 409. Preserve the
owner cookie across retries. Other mutations have no general replay guarantee;
each operation documents its retry semantics with `x-idempotency`. Cookie-authenticated
management and List Selection writes require the same-origin Origin header.

The architecture gate follows transitive imports from target `use client` modules
and browser-safe contracts, rejecting runtime, server, infrastructure and Node-only
dependencies. Legacy frontend sources remain preserved pending the page and visual migration in [the frontend migration map](frontend-migration.md). `pnpm test:architecture`
also checks route/OpenAPI coverage, references, response schemas and retry metadata.
Real PostgreSQL tests compare HTTP outcomes with the same application operations,
including immutable-list rejection and checkout replay/conflict. OpenAPI response
validation uses the JSON Schema subset supported by Ajv; extend the validator when
introducing newer schema keywords.

Partner Rewards and Partner Reports currently expose module foundations without
runtime/persistence wiring. The Partner Reward event schema already exists, but
accepted Orders do not yet write it. Review remediation is tracked in #91–#95:
authorized boundaries, accounting corrections, atomic acceptance rewards, COD
completion, and scoped reporting. These modules are not released HTTP capabilities
until their durable authorized runtime operations and adapters are implemented.
Worker notification delivery remains an internal process operation.

### Partner Reward statement semantics (#92)

The Partner Rewards module folds events in append order. `pending` is the sum of
unearned entitlements tracked separately for each Business Partner and Order.
Payment transfers only that Order's remaining pending points into earnings.
Cancellation consumes that Order's pending entitlement first, then its remaining
earnings; it cannot cancel more than the combined remainder or create points that
can be earned later. Refunds and reversals debit remaining earnings only. All three
corrections share the same statement calculation, including earlier corrections
and signed manual adjustments, so event ordering cannot debit an entitlement twice.
Correction inputs are positive safe integers; the ledger records their negative
sign. Original events remain unchanged.

`earned` reports earnings after refunds, reversals, earned-point cancellations and
manual adjustments, before settlements, with a zero display floor. `reversed`
reports the total points removed by refunds, reversals and cancellations (including
cancelled pending points). `settled` is the cumulative completed payout amount.
`available` is net earnings less settlements, deducted once, with a zero floor:
100 earned and 40 settled means 100 earned, 40 settled and 60 available. Later
corrections retain the original settlement history rather than rewriting it.

Authorized Partner Reports filter rows to the selected Business Partner before
privacy suppression and sanitization. Another partner's rows affect neither the
returned rows nor the suppression flag. These module contracts remain foundations;
durable transaction serialization and authorized runtime integration belong to the
commerce and reporting integration tickets.

## Target runtime foundation (#52)

- `frontend/web` (`@findeg/web`) is the target Next.js executable. It owns browser
  presentation, locale layouts, and transport adapters. Its server adapter is
  marked `server-only`; runtime configuration is never passed to browser code.
- `runtime` (`@findeg/runtime`) owns process configuration and concrete startup
  wiring, shared by web, worker, and migrations. It has no browser-safe exports.
  This is the runtime layer required by ADR 0001, not a generic shared library.
- `@findeg/backend/modules/identity-access/public` exposes Current Session,
  sign-in/sign-out, and authorized staff-access operations. `contracts` exposes
  database-free vocabulary; explicit infrastructure exports are runtime-only
  construction surfaces. The old `portal-entry` export remains migration evidence.
- `@findeg/db/migrations` is the compiled persistence construction surface for
  the existing ordered migration history; importing it neither parses environment
  variables nor opens a connection. Only the migration runtime calls it.
- Target server entry points import emitted JavaScript through explicit exports.
  Their builds precede dependent type checks. Business owners never import runtime.

The Storefront and Dashboard sources are preserved as migration references outside the active workspace. Their page and theme migration is not complete.
New behavior belongs in `frontend/web`; #89 owns the later production certification
and controlled release phase.

## Retained compatibility evidence (#64)

Package-local entry guides are available for [backend](../backend/README.md),
[database](../db/README.md), and [environment compatibility](../packages/env/README.md).
The backend and database root barrels are compatibility exports, not recommended
target imports. In particular, database schema/type exports are not browser-safe
entry points: ADR 0001 prohibits all browser imports from `@findeg/db`.

The following surfaces remain for comparison and migration continuity. They are
not supported application entry points, and new behavior belongs in the target
modules and runtime. Their historical READMEs describe the prototype only.

| Retained surface                                                                                      | Replacement and retirement boundary                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/src/features`, its tests, the root and `features/*` exports, and `portal-entry` export/build | Target `backend/src/modules`, application operations, and `runtime` replace these services. Retire a feature together with its old exports and tests when its remaining imports are removed and the corresponding target behavioral, HTTP, and PostgreSQL gates cover the behavior being retained. Unreleased prototype capabilities are not promised target features.                               |
| Legacy `backend/src/lib`, `backend/src/types`, and their tests                                        | Remove a helper when neither a retained feature nor a target module imports it; preserve target-used helpers until an owner-scoped replacement passes the same behavior checks.                                                                                                                                                                                                                      |
| `db/src/connection.ts`, query/type barrels, `db/seed.ts`, `db/seeds`, `db:seed`, and `packages/env`   | Compatibility tools for disposable prototype fixtures only; the seed runner truncates data and does not provision target access. Target runtime configuration, injected persistence adapters, and test-owned fixtures replace them. Retire them and their exports/dependencies after their last compatibility caller is removed and target migration/replay and application tests pass without them. |
| `db/src/schema` mappings re-exported by owner schemas                                                 | Still required by the target schema assembly. Move definitions into their owners before removing these mappings; verify identical schema ownership and migration/replay results. Do not drop persisted records as code cleanup.                                                                                                                                                                      |
| `db/migrations`, including the original prototype migrations and snapshots                            | Required immutable history for fresh databases and replay, not an alternative schema setup path. Keep it for the lifetime of this migration chain. Retirement requires a separately approved baseline/data transition with fresh-install, upgrade, and replay evidence.                                                                                                                              |
| `frontend/storefront` and `frontend/dashboard`                                                        | Preserve all original pages, themes, assets, translations, and tests until each has a reviewed target equivalent in the [frontend migration map](frontend-migration.md). The user must explicitly approve any omission. Existing target gates alone do not establish page or visual parity.                                                                                                          |
| `frontend/ui`                                                                                         | Preserved presentation primitives and brand elements used by the reference apps. `frontend/web` does not currently depend on them. Migrate them with theme, accessibility, and RTL checks; lack of an active workspace consumer is not permission to discard them.                                                                                                                                   |

The existing compatibility tests remain part of `pnpm test` while their subjects
are retained. The restored portal tests are preserved as migration evidence outside the active workspace. `frontend/web/cypress/e2e` journeys and the HTTP/process/PostgreSQL suites in `tests`, run by `pnpm quality:check`, verify selected target flows, not complete frontend parity. Passing these development gates does not certify a production
release; #89 owns that separate evidence and approval.

Historical architecture guides, the monorepo migration plan, component-placement
and logging guides, legacy schema/feature READMEs, and the root infrastructure
analysis are retained documentation evidence. Their banners identify historical
claims; they do not govern target development. Retire each with its referenced
compatibility surface after carrying forward useful decisions into owner or
canonical documentation. Preserve frontend documentation under the separate
page/theme migration boundary above.

## Module data and transactions (#53)

The target business owners are `identity-access`, `partner-management`, `catalog`,
`school-supply-lists`, `inventory`, `commerce`, `partner-rewards`, and
`partner-reports`. Each has a persistence construction surface under
`db/src/modules/<owner>/schema.ts`, exported as `@findeg/db/modules/<owner>`.
New business contracts and operations belong under `backend/src/modules/<owner>`.
This split keeps the existing rule that database code never imports business code.

| Owner                  | Existing persisted records / responsibility                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Identity & Access      | Users, credentials, authentication accounts, roles and grants, Current Sessions, guest principals                |
| Partner Management     | Business Partners, Partner Invitations, Partner Memberships and access history; legacy organizations/memberships |
| Catalog                | Products, variants, attributes, categories, brands, collections, tags, reviews and helpful votes, search logs    |
| School Supply Lists    | Lists, items, alternatives, list access grants/requests/tokens/attempts and parent sessions                      |
| Inventory              | Warehouses, balances and stock movements                                                                         |
| Commerce               | Orders/items, Cart Kits, discount rules, addresses and saved payment methods                                     |
| Partner Rewards        | Partner Reward event schema; durable acceptance/runtime integration tracked in #93                               |
| Partner Reports        | No persisted records yet; approved read views land with reporting                                                |
| Runtime infrastructure | Existing audit log, server logs and notifications; these are technical records, not a ninth business module      |

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
The original migrations and retained schema mappings follow the compatibility
boundaries above; their commercial rules are not certified by assigning ownership.

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

## Current Sessions (#54)

Identity & Access owns `identity.sessions` and `identity.staff_role_grants` and
contributes migration `0002_portal_sessions` to the shared history. The migration
also supplies version/invalidation triggers. Snapshot 0001 is corrected to match
its existing SQL: `authorization_version` belongs to Users, not Organizations;
no historical SQL is rewritten. See [the Current Session runbook](operations/current-sessions.md)
for fixed roles, runtime configuration, bootstrap boundaries, and denial behavior.

## Partner access (#56)

`partner-management/contracts` contains browser-safe membership and Workspace
vocabulary; `public` owns invitation and membership policy. The authorized
`@findeg/backend/partner-operations` application coordinator resolves Identity &
Access before invoking Partner Management. Runtime binds both owners to one
transaction. New persistence uses only the Partner Management schema surface.
Migration `0003_partner_memberships` adds the target records alongside retained
legacy organizations; legacy membership and role records confer no target access.
See [Partner access](operations/partner-access.md) for administration and validation.
