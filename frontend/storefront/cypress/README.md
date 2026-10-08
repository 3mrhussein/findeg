# Cypress E2E Structure

This project uses a layered Cypress structure so tests stay maintainable as UI evolves.

## Directory layout

- `cypress/e2e/shop/customer-journeys-e2e.cy.ts`: current Customer storefront journeys
- `cypress/e2e/partner/invitation-acceptance.cy.ts`: Partner invitation registration and acceptance
- `cypress/e2e/shop/catalog-search-e2e.cy.ts`: keyword search and empty results (no typo tolerance; see `db/src/queries/catalog/search.ts`)
- `cypress/e2e/shop/school-list-completeness.cy.ts`: published and archived List selections
- `cypress/quarantined/**`: retained legacy scenarios with tracked follow-ups
- `cypress/support/selectors/**`: stable selector contracts for UI elements
- `cypress/support/actions/**`: reusable UI/API actions (login, product creation, filtering)
- `cypress/support/assertions/**`: reusable assertions, separated from actions
- `cypress/support/utils/**`: route/data helpers and test data factories
- `cypress/support/scenario/**`: business/system scenario functions consumed by spec files
- `cypress/support/commands.ts`: custom Cypress commands composed from actions
- `cypress/coverage/**`: test execution artifacts (screenshots, videos, downloads)

## Naming conventions

- Specs: `<domain>-<scope>-e2e.cy.ts`
- Scenario functions: `should<BusinessBehavior>()`
- Selectors: `<domain>.selectors.ts`
- Actions: `<domain>.actions.ts`
- Assertions: `<domain>.assertions.ts`

## Execution

1. Ensure app and DB are running (seeded).
2. Run headless: `pnpm --filter @findeg/storefront e2e:run:ci`
3. Open runner: `pnpm --filter @findeg/storefront exec cypress open`

## Environment variables

Configured in `cypress.config.ts` (override through CLI/CI env):

- `LOCALE` (default `en`)
- `ADMIN_EMAIL` (default `admin@findeg.com`)
- `ADMIN_PASSWORD` (default `admin`)

## Strict release coverage and quarantine

`e2e/shop/customer-journeys-e2e.cy.ts` exercises current Customer UI journeys against
real seeded PostgreSQL: English/Arabic catalog and school routes, product slug
navigation, variant cart operations and persistence, checkout validation,
real COD Quote/Order Acceptance, acceptance failure, registration and guest account
protection. Runtime exceptions fail these tests.

One spec is retained under `quarantined/` with a `.quarantined.ts` name,
explicitly outside the `e2e/**/*.cy.{ts,tsx}` pattern:

- `shop-storefront-e2e.quarantined.ts`: [#346](https://github.com/3mrhussein/findeg/issues/346)
  tracks restoring PLP filters, sorting/pagination, typo fallback and signed-in order
  history after migrating removed REST catalog/cart endpoints and implementing
  missing PLP query semantics.

Architecture coverage from [#347](https://github.com/3mrhussein/findeg/issues/347)
lives at the lint and production-build seams, in `scripts/architecture/`:

- `pnpm test:scripts` exercises the storefront's real ESLint configuration: backend
  infrastructure and database imports fail; Client Components must import schema
  values from the client-safe entry point. Server factories and type-only imports
  remain allowed.
- `pnpm --filter @findeg/storefront build` asserts that every emitted client JavaScript
  chunk has module evidence and contains no database, backend infrastructure,
  Node-only modules or server dependency packages. Maps are removed after inspection.
  The unmapped browser polyfill must match the installed Next.js artifact byte for byte.
  The existing CI Build and strict E2E builds both run this command through Turbo.

The legacy architecture spec has been deleted. Live English/Arabic Customer journeys
continue to verify product slug navigation and the other current storefront routes.

Quarantine leaves these tracked coverage gaps open. Remove each retained file once
its follow-up restores meaningful coverage at the appropriate seam.
