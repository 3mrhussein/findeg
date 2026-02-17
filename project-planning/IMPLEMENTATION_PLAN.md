# FindEg Implementation Plan (Current + Remaining Work)

Last updated: 2026-02-17

## Goal
Execute current-phase platform upgrades for MVP delivery:
- Multi-UoM support per product variant
- Customer-group price lists per variant/UoM
- Admin-driven category/sub-category linking during import (no supplier taxonomy mapping layer)
- Complete all planned features/subsystems and pass first UAT before starting automated testing

## Status Snapshot
- [x] Strategy/spec merge completed in `project-planning/SYSTEM_SPECIFICATION.md`
- [x] `PROJECT_STATUS.md` aligned with admin sub-category linking decision
- [x] Phase A baseline stabilization completed (`npm run type-check` + `npm run lint` passing)
- [x] Documentation modernization in progress (architecture playbook + feature UML/use-case docs)
- [x] Phase B schema uplift completed
- [x] Phase C domain/service adaptation completed
- [x] Phase D API/admin adaptation completed
- [ ] Phase G frontend static-first optimization in progress
- [ ] Phase E UAT readiness/review pending
- [ ] Phase F post-UAT automation planning deferred

## Execution Plan

### Phase A: Stabilization (Done)
- [x] Fix Zod v4 parsing error handling (`issues` vs `errors`)
- [x] Unify auth/session typing with strict role union
- [x] Resolve current TypeScript compile blockers
- [x] Resolve lint blockers

### Phase B: Database & Persistence (In Progress)
- [x] Add schema tables: `variant_sellable_uoms`, `variant_price_lists`
- [x] Add migration files for new tables
- [x] Validate migration application in local DB (up applied and verified)
- [x] Add repository methods for UoM + price-list read/write

### Phase C: Domain & Application
- [x] Extend domain model for variant-UoM structure and customer-group pricing
- [x] Update cart/order snapshots to persist `{ uom, customerGroup, unitPrice }`
- [x] Add service-layer pricing resolver by `{ productId, variantKey, uom, customerGroup }`

### Phase D: API & Admin UX
- [x] Extend cart item payload to support optional `uom` and `customerGroup`
- [x] Add pricing quote endpoint contract (`GET /api/v1/products/[id]/pricing/quote`)
- [x] Add admin endpoints for UoM and per-group pricing management
- [x] Update admin product form to structured UoM + price-list row editor (replacing JSON-only configuration)
- [x] Ensure all changed contracts are updated across all in-repo callers in the same change set

### Phase E: UAT Readiness & Rollout
- [ ] Complete UI review pass across public shop + admin dashboard
- [ ] Run first UAT cycle with business users
- [ ] Capture UAT gaps and prioritize fixes
- [ ] Apply UAT fixes and prepare acceptance sign-off
- [ ] Monitoring metrics: import success, valid sub-category links, UoM pricing errors
- [ ] Release checklist and rollback notes

### Phase G: Frontend Static-First Refactor (In Progress)
- [x] Add cached storefront query layer (`use cache` + `cacheTag` + `cacheLife`)
- [x] Move home/shop/categories/product detail to server-query-driven rendering
- [x] Apply `force-static` where page behavior allows static pre-rendering
- [x] Wire cache tag invalidation from admin mutations
- [x] Remove duplicated storefront card/list component implementations via shared re-exports
- [x] Add page metadata generation for SEO-critical storefront routes
- [x] Standardize loading/empty/error UX patterns with shared storefront state components
- [x] Split `ShopContent` and `Header` into controller/view architecture
- [x] Split product detail interaction modules (`ProductActions`, `ProductReviews`) into controller/view architecture
- [x] Extract `ProductCard` behavior into reusable controller hook
- [x] Extract `ProductListItem` behavior into reusable controller hook
- [x] Split `CheckoutContent` and `ReviewForm` into controller/view architecture
- [x] Implement storefront-first IA with school-list flow as secondary utility route (`/school-lists`)
- [x] Standardize action feedback patterns (localized toasts + pending/disabled states) in cart/review flows
- [x] Apply mobile usability improvements for tap targets and responsive controls in header/menu/filter/cart flows
- [x] Apply final responsive polish for sticky actions and dense layouts in product/checkout screens
- [x] Introduce shared storefront controller/view-model contracts and handler interfaces
- [x] Move default variant-selection logic to shared hook and remove duplicated logic from card/list controllers
- [x] Replace custom mobile menu/cart drawer shells with shadcn `Sheet`
- [x] Remove redundant storefront alias components and switch to direct shared imports
- [x] Add storefront frontend standards in planning docs (hooks/views, no inline business handlers, shadcn-first primitives)
- [ ] Reduce remaining unnecessary client components and split remaining logic-heavy client islands
- [ ] Complete storefront UI review checklist before UAT
- [ ] Add lint guardrails for storefront layering conventions (deferred follow-up task)

### Phase F: Post-UAT Test Automation Program (Deferred)

Automation work starts only after:
- [ ] Feature set is functionally complete for initial release scope
- [ ] First UAT cycle is accepted
- [ ] Major DB and UI/UX churn has slowed

Deferred automation backlog (not active now):
- [ ] Unit test framework and service/domain coverage
- [ ] Cypress E2E for critical shopper/admin journeys
- [ ] CI quality gates and flake policy

## Current Priority Queue
1. Continue Phase G frontend optimization and UI/UX refactor (see `project-planning/FRONTEND_REFACTOR_PLAN.md`)
2. Run UAT-first workflow (review, feedback, fixes, acceptance)
3. Start automation only after UAT acceptance and stabilization gate

## Risks / Notes
- Variants are currently JSON-based; until normalized variant rows exist, pricing tables use `variant_key` to identify a variant deterministically.
- MVP stage: backward compatibility with external systems is not currently required.
- Automated test implementation is intentionally deferred until post-UAT stable baseline to avoid rework from ongoing DB and UI/UX changes.
