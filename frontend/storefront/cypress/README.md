# Cypress E2E Structure

This project uses a layered Cypress structure so tests stay maintainable as UI evolves.

## Directory layout

- `cypress/e2e/shop/customer-journeys-e2e.cy.ts`: current Customer storefront journeys
- `cypress/e2e/shop/product-listing-e2e.cy.ts`: PLP brand/price filters, sorting, pagination and empty state on isolated fixtures
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
protection, and signed-in order history (including that one Customer cannot open
another's order). Runtime exceptions fail these tests.

`e2e/shop/product-listing-e2e.cy.ts` creates its own category, brands and price
ladder (the `createPlpCatalog` task) and asserts exact counts and order for brand and
price filters, price sorting, pagination and the empty state. Category filtering
matches the category itself, not its descendants; in-stock, rating and discount
filters are not applied by the PLP query and are not covered. Typo-tolerant search
fallback is not supported (see `db/src/queries/catalog/search.ts`).

One spec is retained under `quarantined/` with a `.quarantined.ts` name,
explicitly outside the `e2e/**/*.cy.{ts,tsx}` pattern:

- `architectural-boundaries.quarantined.ts`: [#347](https://github.com/3mrhussein/findeg/issues/347)
  tracks replacing log-only/inline-HTML architecture claims with meaningful static
  build assertions. The obsolete `/products` index is replaced by live product slug
  navigation in the Customer journeys.

Quarantine leaves this tracked coverage gap open. Remove the retained file once its
follow-up restores meaningful coverage at the appropriate seam.
