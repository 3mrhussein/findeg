# Cypress E2E Structure

This project uses a layered Cypress structure so tests stay maintainable as UI evolves.

## Directory layout

- `cypress/e2e/admin/admin-dashboard-e2e.cy.ts`: all admin dashboard E2E business scenarios
- `cypress/e2e/shop/shop-storefront-e2e.cy.ts`: all storefront E2E business scenarios
- `cypress/support/selectors/**`: stable selector contracts for UI elements
- `cypress/support/actions/**`: reusable UI/API actions (login, product creation, filtering)
- `cypress/support/assertions/**`: reusable assertions, separated from actions
- `cypress/support/utils/**`: route/data helpers and test data factories
- `cypress/support/scenarios/**`: business/system scenario functions consumed by spec files
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
2. Run headless: `npm run e2e:run`
3. Open runner: `npm run e2e:open`

## Environment variables

Configured in `cypress.config.ts` (override through CLI/CI env):

- `LOCALE` (default `en`)
- `ADMIN_EMAIL` (default `admin@findeg.com`)
- `ADMIN_PASSWORD` (default `password123`)

## Strict release baseline (#323)

The active `auth/identity-phase-3.cy.ts` and `dashboard-journeys-e2e.cy.ts` specs
run real seeded staff authentication, Current Session persistence,
logout, unauthenticated and invalid-session redirects, and English/Arabic catalog
search and order filtering against the production dashboard. The seeded default
staff password is `password123`. Run `pnpm --filter @findeg/dashboard e2e:run:ci`.

The active `orders/order-operations-phase-4.cy.ts` spec ([#344](https://github.com/3mrhussein/findeg/issues/344)) creates its own Order per test through `cy.task('createTestOrder')` (direct SQL; `DATABASE_URL` or the repo-root `.env`) and covers status and payment updates, invalid transitions, list revalidation, read-only Staff rejection and failed server actions in `en` and `ar`.

No spec is excluded. Failures and exceptions from the suite are never suppressed.
