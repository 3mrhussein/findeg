# Cypress E2E Structure

This project uses a layered Cypress structure so tests stay maintainable as UI evolves.

## Directory layout

- `cypress/e2e/admin/admin-dashboard-e2e.cy.ts`: all admin dashboard E2E business scenarios
- `cypress/e2e/shop/shop-storefront-e2e.cy.ts`: all storefront E2E business scenarios
- `cypress/support/selectors/**`: stable selector contracts for UI elements
- `cypress/support/actions/**`: reusable UI/API actions (login, product creation, filtering)
- `cypress/support/assertions/**`: reusable assertions, separated from actions
- `cypress/support/utils/**`: route/data helpers and test data factories
- `cypress/support/scenario/**`: business/system scenario functions consumed by spec files
- `cypress/support/commands.ts`: custom Cypress commands composed from actions

## Naming conventions

- Specs: `<domain>-<scope>-e2e.cy.ts`
- Scenario functions: `should<BusinessBehavior>()`
- Selectors: `<domain>.selectors.ts`
- Actions: `<domain>.actions.ts`
- Assertions: `<domain>.assertions.ts`

## Execution

1. Ensure app and DB are running (seeded).
2. Run headless: `npm run e2e:run`
3. Open runner: `npm run e2e:open`

## Environment variables

Configured in `cypress.config.ts` (override through CLI/CI env):

- `LOCALE` (default `en`)
- `ADMIN_EMAIL` (default `admin@findeg.com`)
- `ADMIN_PASSWORD` (default `admin`)
