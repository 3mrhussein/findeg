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
