# Retrospective: Dashboard List Publishing, Clone, Replacement, Archive, and Offers (#431)

Date: 2026-10-13. Scope: the coding session implementing [Issue #431: "Dashboard: publish, clone, replace and archive lists, and List Offers"](https://github.com/3mrhussein/findeg/issues/431) under parent [Spec #401 ("Spec: a full working Dashboard on the real database")](https://github.com/3mrhussein/findeg/issues/401).

Integration branch: `feat/431-dashboard-list-publishing-offers` merged into `feat/spec-401-dashboard-real-database` in commit `452700e15`.

This retrospective applies the repository's [retro skill](../../.agents/skills/retro/SKILL.md) and [writing-for-agents guide](../../.agents/skills/writing-for-agents/SKILL.md). It proposes concrete environment and harness improvements to eliminate friction for future agent runs. Recommendations below have not been implemented as part of this retrospective.

---

## 1. Outcome and Evidence

The session implemented full list lifecycle operations (publish with eligibility/stock validation, clone to draft, replacement archiving incumbent with offer transfer, archive across partner statuses), list offer percentage/window configuration with shared Money preview, complete bilingual localization (English and Arabic with zero raw JSX literals), security unit tests, and real-database Cypress E2E coverage.

Final verification passed:
- **119 unit tests** across 16 test files (`pnpm --filter @findeg/dashboard test`), including all permission and lifecycle scenarios in `security-actions.test.ts`.
- **TypeScript type checking** with zero errors (`pnpm --filter @findeg/dashboard type-check`).
- **ESLint checks** with zero warnings or errors (`findeg-lint . --pass-on-unpruned-suppressions`).
- **16 Cypress E2E tests in real PostgreSQL** (`school-list-lifecycle-offers.cy.ts` 10/10, `school-list-operations.cy.ts` 6/6) in both English and Arabic.

Several critical obstacles appeared during verification on real database and real Next.js browser execution:

| Observation | Evidence | Resolution During Session |
| --- | --- | --- |
| Next.js SSR static buttons dropped Cypress clicks | Cypress clicked `<button>` within 15ms of page render before React client hydration attached synthetic listeners | Added `mounted` state tracking (`data-hydrated="true"`, `disabled={!mounted}`) in `ItemsEditor` and `ListLifecycleActions`; updated Cypress specs to assert `.should('be.visible').and('not.be.disabled').click()` |
| Next.js Data Cache poisoned by direct DB fixture tasks | Test 1 visited an empty draft, Next.js cached `getSchoolSupplyListById` under tag `'school-lists'`. Fixture `addTestSupplyListItem` inserted an item directly via PostgreSQL; subsequent `cy.reload()` served stale cached empty list | Added item through the Dashboard UI dialog, which executed Server Action `addItemAction` that calls `revalidateTag('school-lists', 'max')` |
| Soft navigation duplicated locators across unmounting pages | `cloneListAction` navigated via `router.push()`. Cypress `cy.get('[data-testid="item-row"]')` found 2 rows (one in unmounting outgoing page, one in incoming page) | Scoped selector to active/visible elements with `cy.get('[data-testid="item-row"]:visible').should('have.length', 1)` |
| PostgreSQL constraint `ck_supply_list_publication` failed fixture updates | `setTestSupplyListStatus` updated status to `published`/`archived` without matching the 32-hex `public_code` and timestamp constraints | Updated `partner-fixtures.ts` to generate lowercase 32-hex code (`randomBytes(16).toString('hex')`) and set `published_at = now()` |
| PostgreSQL trigger froze items on published lists | Fixtures attempting to insert items into published lists were rejected by database trigger `Items of a published or archived School Supply List are frozen` | Reordered test setup: create list as `draft`, insert items, then transition to `published` |
| Test state pollution across spec runs | Test 4 set default variant 13 inactive/out-of-stock, causing subsequent tests using variant 13 to fail on prerequisite checks | Added explicit variant activation (`setTestVariantStatus`) and stock replenishment (`setTestVariantStock`) in test suite `beforeEach` |

---

## 2. Existing Guardrails

The repository maintains robust core guardrails:
- **Worktree Lifecycle**: `scripts/worktree.mjs` (`pnpm wt:new`, `pnpm wt:rm`) enforces branch naming conventions, develop sync, and atomic teardown of build debris.
- **Strict Linting**: `findeg-lint` enforces `react/jsx-no-literals` (preventing unlocalized text), client/server boundary import rules, and formatting standards.
- **Pre-commit Automation**: Husky + lint-staged runs Prettier formatting on staged files.
- **Turborepo & Packaging**: Monorepo targets enforce isolated package dependencies and build-cache integrity.
- **Permission & Security Gates**: Server Actions require staff session validation (`requireStaffAction`) with granular permission codes.

---

## 3. Remaining Improvements, Ordered by Priority

Priority indicates recurrence risk and detection cost for future agent runs. P1 is the highest-value environment improvement; P2 follows; P3 is an optimization.

### R1 — P1: Provide a Cache Invalidation Hook in E2E Fixture Tasks
- **Category:** Automated checks / Test environment
- **Owner:** Dashboard E2E / Next.js infrastructure maintainer
- **Evidence:** Direct database writes via Cypress `cy.task` (`addTestSupplyListItem`, `setTestSupplyListStatus`, `setTestPartnerStatus`) modify PostgreSQL rows, but Next.js Data Cache (`cacheTag('school-lists')`, `cacheLife('minutes')`) has no knowledge of direct database transactions. When Cypress tests reload the browser page, Next.js serves stale cached server components. Agents are forced to either run unnecessary UI form flows just to trigger Server Action cache revalidations or diagnose silent staleness.
- **Change:** Add a development/test-only internal route or task helper (e.g. `POST /api/test/revalidate-tag` or a fixture utility invoking Next.js `revalidateTag`) accessible by Cypress tasks. When any fixture mutates database tables, the task automatically revalidates relevant tags (`school-lists`, `partners`, etc.).
- **Completion:** A Cypress test creating or modifying records via `cy.task` followed by `cy.reload()` immediately renders updated data without workarounds.

### R2 — P1: Standardize React Client Hydration Guards Across Dashboard Components
- **Category:** Coding standards / Automated checks
- **Owner:** Frontend architecture maintainer
- **Evidence:** In Next.js Server-Side Rendering (SSR), buttons and interactive elements render in the initial HTML before client scripts hydrate. Cypress executes interactions in under 20ms, clicking buttons when synthetic event listeners are not yet active. This led to intermittent test failures where button clicks produced zero state transition.
- **Change:** Standardize the pattern for all interactive client components:
  1. Use `data-hydrated={mounted ? 'true' : 'false'}` on root client component containers.
  2. Disable action buttons until hydrated (`disabled={!mounted || isPending}`).
  3. Update Cypress custom commands (or documentation guidelines) to mandate `.should('be.visible').and('not.be.disabled')` before `.click()`.
- **Completion:** Zero dropped clicks in headless CI/Cypress runs across all locales and network throttling tiers.

### R3 — P2: Add Transition-Aware Scoping for Cypress Page Navigation
- **Category:** Tool economy / Automated checks
- **Owner:** E2E testing maintainer
- **Evidence:** During client-side navigation via Next.js `router.push()`, React Concurrent features and App Router transitions keep outgoing DOM segments attached temporarily while the new route loads. Queries like `cy.get('[data-testid="item-row"]')` match both the disappearing row and the new row, triggering `Too many elements found: expected 1, found 2`.
- **Change:** Provide a Cypress utility or selector convention that scopes assertions to the active, visible main viewport container (e.g. `cy.get('[data-testid="item-row"]:visible')` or scoped to `[data-testid="items-editor-section"]`). Add an explicit check in Cypress best practices for Next.js App Router tests.
- **Completion:** Route transitions with cloned or replaced resources assert on exact element counts without collision from outgoing DOM nodes.

### R4 — P2: Mirror Domain Invariants in E2E Test Fixtures
- **Category:** Information access / Automated checks
- **Owner:** Backend & test fixture maintainer
- **Evidence:** Test fixtures in `cypress/support/tasks/partner-fixtures.ts` performed raw SQL queries that bypassed PostgreSQL check constraints (`ck_supply_list_publication`) and database triggers (freezing items on published lists). The agent had to reverse-engineer database schema DDL constraints to find why raw SQL updates failed.
- **Change:** Implement fixture tasks using domain aggregate factories or reusable backend test helpers (such as `SchoolSupplyListService` or dedicated test helpers) rather than raw `sql` strings that drift from domain invariants.
- **Completion:** Test fixture tasks enforce valid domain states by construction, preventing raw SQL constraint violations during test setup.

### R5 — P3: Integrate Prettier Check Auto-Fix into Lint Command
- **Category:** Tool economy
- **Owner:** Repository tooling maintainer
- **Evidence:** `findeg-lint` failed with exit code 1 due to a single line-wrap formatting difference (`prettier/prettier` error at line 142). The agent had to spend a full tool-call cycle executing `prettier --write` followed by another `findeg-lint` run.
- **Change:** Support auto-fixing formatting during `findeg-lint --fix` or configure the lint script to run `prettier --check` with actionable auto-fix suggestions in one invocation.
- **Completion:** Minor formatting deviations are automatically formatted during development workflows without interrupting verification.
