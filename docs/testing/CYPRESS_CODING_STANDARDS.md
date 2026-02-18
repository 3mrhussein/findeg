# Cypress Coding Standards

This document defines mandatory standards for Cypress E2E work in this repository.
All agents and contributors should follow this structure to keep tests stable, readable, and reusable.

## 1. Core Principles

1. Use scenario-first tests: specs describe business/system behavior, not UI implementation details.
2. Reuse before creating: prefer existing selectors/actions/assertions/constants/helpers.
3. Keep single source of truth for routes, messages, and test data.
4. Avoid fragile selectors and timing assumptions.
5. Keep secure Cypress env mode enabled (`allowCypressEnv: false`).

## 2. Required Cypress Architecture

Use the existing layered structure:

- `cypress/e2e/**` for grouped spec files only
- `cypress/support/scenario/**` for business flows
- `cypress/support/actions/**` for page/API interactions
- `cypress/support/selectors/**` for selector maps only
- `cypress/support/assertions/**` for reusable assertions
- `cypress/support/constants/**` for shared constants
- `cypress/support/utils/**` for generic helpers
- `cypress/support/commands.ts` for custom Cypress commands

Do not mix responsibilities between layers.

## 3. Spec Organization Rules

1. Group tests by domain/use-case:
- `cypress/e2e/admin/admin-dashboard-e2e.cy.ts`
- `cypress/e2e/shop/shop-storefront-e2e.cy.ts`

2. `describe` and `it` names must express business intent.

3. Specs should call scenario functions, not raw UI steps.

Example:

```ts
it("should allow guest checkout submission", () => {
  shouldAllowGuestCheckoutSubmission();
});
```

## 4. Constants-First Policy

Never hardcode repeated strings in scenarios/actions when a constant can be used.

Use:

- `cypress/support/constants/routes.ts`
- `cypress/support/constants/messages.ts`
- `cypress/support/constants/test-data.ts`
- `cypress/support/constants/api-query.ts`

If a value appears in multiple files, move it to constants.

## 5. Environment and Config Rules

1. Keep `allowCypressEnv: false`.
2. Do not use `Cypress.env()` directly.
3. Use config-safe helpers:
- `resolveCypressEnv(...)`
- `resolveLocale(...)`
4. Keep local output readable:
- `e2e:run` uses `spec` reporter
5. Keep CI output machine-readable:
- `e2e:run:ci` uses JUnit reporter (XML in `cypress/reports`)

## 6. Selector Standards

1. Prefer stable `data-testid` selectors.
2. Avoid selectors tied to transient styles or layout depth.
3. Keep selectors centralized in selector modules.
4. When needed, expose new `data-testid` from UI components instead of adding brittle selectors.

## 7. Actions and Assertions Standards

1. Actions should do one interaction concern and include meaningful waits/assertions.
2. Assertions should be reusable and domain-oriented (`expectSummaryToEqual`, `expectCartQuantity`).
3. Avoid arbitrary waits (`cy.wait(1000)`); wait on state change, URL, element state, or API result.
4. Re-query after actions that can re-render (React detachment-safe patterns).

## 8. Scenario Authoring Standards

1. Scenarios represent complete business/system use cases.
2. Keep setup and cleanup deterministic.
3. Validate key outcomes, not incidental UI details.
4. Prefer API-backed setup for deterministic state when UI setup is noisy.
5. Use URL-driven filter assertions when UI control interaction is unstable but query contract is core behavior.

## 9. Data Management Standards

1. Use unique test entities (`buildTestProduct()`) for create/delete flows.
2. Cleanup created entities (`cleanupProductBySku`) in same scenario.
3. Use centralized form payloads from `test-data.ts`.
4. For cart tests, derive the actionable cart item from current API/UI state instead of assuming IDs.

## 10. Failure Readability Standards

1. Local runs must be human-readable (`spec` reporter).
2. Keep screenshots and videos enabled for failures.
3. CI uses JUnit XML artifacts for pipeline parsing.
4. Error messages in expectations should include context (actual path, expected state, item id).

## 11. Definition of Done (E2E Change)

An E2E change is complete only if:

1. `npm run type-check:e2e` passes.
2. Updated specs run without infra errors.
3. New/changed logic is extracted to proper layer (scenario/action/assertion/constants).
4. No duplicate literals exist for routes/messages/test data where constants apply.
5. Tests remain readable and business-aligned.

## 12. Quick Contributor Checklist

Before opening a PR:

1. Did I reuse existing selectors/actions/assertions/constants?
2. Did I avoid `Cypress.env()` direct usage?
3. Did I avoid hardcoded repeated strings?
4. Did I keep spec files thin and scenario-driven?
5. Did I run `npm run type-check:e2e`?
6. Did I keep failure output actionable?

