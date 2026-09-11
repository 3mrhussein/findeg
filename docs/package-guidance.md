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
