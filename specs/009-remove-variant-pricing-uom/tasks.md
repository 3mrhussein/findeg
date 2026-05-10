# Tasks: Remove Variant Price Lists, Sellable UOMs & Product SKU

**Input**: Design documents from `/specs/009-remove-variant-pricing-uom/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md
**Constitution**: All tasks satisfy FindEg.com Constitution principles

**Tests**: Not explicitly requested — no test-first tasks generated. Cypress support files are cleaned as part of the removal.

**Organization**: Tasks are grouped by user story (US1=Schema, US2=Backend, US3=Frontend) with a documentation phase.

---

## Phase 1: Foundational — Database Schema & Types

**Purpose**: Remove tables, columns, enums, and type definitions. This MUST complete before backend/frontend cleanup since all other layers import from `@findeg/db`.

**⚠️ CRITICAL**: No backend or frontend work can begin until this phase is complete.

- [x] T001 [US1] Delete file `db/src/schema/catalog/variant-pricing.ts` (removes `variantSellableUoms`, `variantPriceLists` tables, relations, and type exports)
- [x] T002 [US1] Remove `export * from './variant-pricing'` from `db/src/schema/catalog/index.ts`
- [x] T003 [US1] Remove `variantSellableUoms` and `variantPriceLists` import and relations (`sellableUoms`, `priceLists`) from `db/src/schema/catalog/product-variants.ts`
- [x] T004 [US1] Remove `sku` and `skuPrefix` columns from `db/src/schema/catalog/products.ts`
- [x] T005 [US1] Remove `uomCode` and `uomFactor` columns from `order_items` in `db/src/schema/sales/orders.ts`
- [x] T006 [US1] Remove `uomCodeEnum` and `customerGroupEnum` definitions from `db/src/schema/enums.ts`
- [x] T007 [US1] Remove `UomCodeSchema`, `UomCode`, `CustomerGroupSchema`, `CustomerGroup` from `db/src/types/catalog.ts` (keep `MatchRulesDraft`)
- [x] T008 [US1] Remove `PricingCustomerGroupSchema`, `PricingCustomerGroup`, `PricingTierSchema`, `PricingTier` from `db/src/types/pricing.ts`; remove `tiers` field from `PersistedPricingSchema` (keep `base`, `cost`, `wholesale`, discount types)
- [x] T009 [US1] Remove `sku` and `skuPrefix` from `db/src/types/catalog/IProduct.interface.ts`
- [x] T010 [US1] Remove all `variant_price_lists`, `variant_sellable_uoms`, and related seed data from `db/seeds/catalog.ts`
- [x] T011 [US1] Remove price-list constants from `db/seeds/helpers/constants.ts`
- [x] T012 [US1] Run `pnpm --filter @findeg/db type-check` — verify zero errors in db package

**Checkpoint**: Database layer is clean. All removed tables, columns, enums, and types are gone. Run `db:push` to sync database.

---

## Phase 2: Backend Logic Cleanup

**Purpose**: Remove all backend domain entities, services, repositories, and interfaces that reference removed concepts. Simplify pricing to use variant inline fields only.

### Catalog Feature

- [ ] T013 [P] [US2] Remove `uomCode`, `customerGroup`, and price-list fields from `backend/src/features/catalog/domain/entities/Variant.ts`; simplify to inline pricing only
- [ ] T014 [P] [US2] Remove `sku`, `skuPrefix` fields from `backend/src/features/catalog/domain/entities/Product.ts`
- [ ] T015 [P] [US2] Delete or empty `backend/src/features/catalog/domain/types/UoMTypes.ts` (remove all UOM type definitions)
- [ ] T016 [US2] Remove UOM/price-list method signatures from `backend/src/features/catalog/application/interfaces/IVariantRepository.ts`
- [ ] T017 [US2] Remove UOM/price-list method signatures from `backend/src/features/catalog/application/interfaces/IVariantService.ts`
- [ ] T018 [US2] Remove UOM/price-list logic from `backend/src/features/catalog/application/services/VariantService.ts`
- [ ] T019 [US2] Remove `skuPrefix` from search fields in `backend/src/features/catalog/application/utils/fuzzy-search.ts`
- [ ] T020 [US2] Remove `sku`/`skuPrefix` selects and UOM/price-list queries from `backend/src/features/catalog/infrastructure/persistence/DrizzleProductRepository.ts`
- [ ] T021 [US2] Remove price-list and UOM joins/queries from `backend/src/features/catalog/infrastructure/persistence/DrizzleVariantRepository.ts`

### Administration Feature

- [ ] T022 [P] [US2] Remove UOM/price-list fields and `sku`/`skuPrefix` from `backend/src/features/administration/domain/types/ProductInput.ts`
- [ ] T023 [P] [US2] Remove UOM fields from `backend/src/features/administration/domain/types/VariantInput.ts`
- [ ] T024 [US2] Remove UOM/price-list creation/update logic, `uomCodeEnum` import, and `sku`/`skuPrefix` handling from `backend/src/features/administration/application/services/AdminProductService.ts`

### Notifications Feature

- [ ] T024a [US2] Remove `product.sku` references from notification templates in `backend/src/features/notifications/application/services/NotificationEventService.ts` (use variant SKU or product name instead)

### Cart Feature

- [ ] T025 [P] [US2] Remove `uomCode` and `customerGroup` from `backend/src/features/cart/domain/entities/Cart.ts`
- [ ] T026 [P] [US2] Remove `uomCode` and `customerGroup` from `backend/src/features/cart/domain/schemas/AddCartItem.ts`
- [ ] T027 [US2] Remove `uomCode`/`customerGroup` from `backend/src/features/cart/application/interfaces/ICartService.ts`
- [ ] T028 [US2] Remove price-resolution-by-group logic from `backend/src/features/cart/application/services/CartService.ts`; use variant `basePrice` directly

### Order Feature

- [ ] T029 [P] [US2] Remove `uomCode` references from `backend/src/features/order/domain/entities/Order.ts`
- [ ] T030 [US2] Remove `uomCode`/`uomFactor` from order-item mapping in `backend/src/features/order/infrastructure/persistence/DrizzleOrderRepository.ts`

### Core Feature

- [ ] T031 [P] [US2] Remove `uomCode` and `customerGroup` from `backend/src/features/core/domain/types/common.ts`
- [ ] T032 [P] [US2] Simplify `backend/src/features/core/domain/value-objects/Pricing.ts` to remove customer-group pricing resolution
- [ ] T033 [US2] Update `backend/src/features/core/domain/value-objects/index.ts` if Pricing exports changed
- [ ] T034 [US2] Run `pnpm --filter @findeg/backend type-check` — verify zero errors in backend package

**Checkpoint**: Backend layer is clean. All services, entities, and repositories use simplified inline pricing.

---

## Phase 3: Dashboard Frontend Cleanup

**Purpose**: Remove UOM section, simplify pricing tab, remove product SKU fields from forms and tables.

### Product Form

- [ ] T035 [US3] Delete file `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductForm/uom/UoMSection.tsx`
- [ ] T036 [US3] Remove UoMSection import/usage and `uomCode`/`customerGroup` from `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductForm/index.tsx`
- [ ] T037 [US3] Remove UOM tab references from `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductForm/ProductFormTabs.tsx`
- [ ] T038 [US3] Remove price-list references from `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductForm/tabs/PricingTab.tsx`
- [ ] T039 [US3] Remove `sku`/`skuPrefix` form fields from `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductForm/tabs/InfoTab.tsx`
- [ ] T040 [US3] Remove `skuPrefix` references from `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductForm/zones/VariantsZone.tsx`

### Product List & Display

- [ ] T041 [P] [US3] Remove `uomCode`/`customerGroup` and `product.sku` from `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductVariants.tsx`
- [ ] T042 [P] [US3] Remove `product.sku` display from `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductCompact.tsx`
- [ ] T043 [P] [US3] Remove `product.sku` display from `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductRow.tsx`
- [ ] T044 [P] [US3] Remove SKU column from `frontend/dashboard/src/app/[locale]/(dashboard)/products/ProductTable/ProductTableColumns.tsx`

### Orders & Cart

- [ ] T045 [P] [US3] Remove `uomCode` display from `frontend/dashboard/src/app/[locale]/(dashboard)/orders/_components/OrderRow.tsx`
- [ ] T046 [P] [US3] Remove `uomCode` display from `frontend/dashboard/src/app/[locale]/(dashboard)/orders/_components/OrderDetailDrawer.tsx`
- [ ] T047 [US3] Remove `uomCode`/`customerGroup` from `frontend/dashboard/src/providers/CartProvider.tsx`

### Types & Tests

- [ ] T048 [US3] Remove UOM/pricing/SKU-related type definitions from `frontend/dashboard/src/interfaces.ts`
- [ ] T049 [P] [US3] Clean `uomCode`/`customerGroup` from `frontend/dashboard/cypress/support/actions/cart.actions.ts`
- [ ] T050 [P] [US3] Clean `uomCode`/`customerGroup`/`product.sku` from `frontend/dashboard/cypress/support/scenario/admin.ts`
- [ ] T050a [P] [US3] Remove UOM/price-list translation keys (`uomDesc`, `addUom`, `noCustomUoms`, `priceLists`, `priceListDesc`, `priceListIntegrated`) from `frontend/dashboard/messages/en.json`; rename "Pricing & UoMs" tab label to "Pricing"
- [ ] T050b [P] [US3] Remove UOM/price-list translation keys from `frontend/dashboard/messages/ar.json`
- [ ] T051 [US3] Run `pnpm --filter @findeg/dashboard type-check` — verify zero errors in dashboard package

**Checkpoint**: Dashboard is clean. Product forms show only inline pricing. No UOM or product-level SKU references remain.

---

## Phase 4: Storefront Frontend Cleanup

**Purpose**: Simplify cart, product display, and checkout components to use direct variant pricing.

### Data Layer

- [ ] T052 [P] [US3] Remove `uomCode`/`customerGroup` from `frontend/storefront/src/data/catalog/types.ts`
- [ ] T053 [US3] Remove UOM/customer-group query logic from `frontend/storefront/src/data/catalog/queries.ts`

### Actions

- [ ] T054 [P] [US3] Remove `uomCode`/`customerGroup` from `frontend/storefront/src/app/[locale]/(storefront)/_actions/catalog.ts`
- [ ] T055 [P] [US3] Remove `uomCode`/`customerGroup` from `frontend/storefront/src/app/[locale]/(storefront)/_actions/cart.ts`

### Cart Components

- [ ] T056 [US3] Remove `uomCode`/`customerGroup` from `frontend/storefront/src/providers/CartProvider.tsx`
- [ ] T057 [P] [US3] Remove UOM references from `frontend/storefront/src/app/[locale]/(storefront)/_components/AddToCartButton.tsx`
- [ ] T058 [P] [US3] Remove UOM references from `frontend/storefront/src/app/[locale]/(storefront)/_components/CartDrawer/CartDrawer.tsx`
- [ ] T059 [P] [US3] Remove UOM references from `frontend/storefront/src/app/[locale]/(storefront)/_components/CartDrawer/CartItem.tsx`
- [ ] T060 [P] [US3] Remove UOM from `frontend/storefront/src/app/[locale]/(storefront)/_components/CartDrawer/CartDrawer.interface.ts`

### Product Display

- [ ] T061 [P] [US3] Remove UOM/`product.sku` from `frontend/storefront/src/app/[locale]/(storefront)/_components/ProductCard.tsx`
- [ ] T062 [P] [US3] Remove UOM/`product.sku` from `frontend/storefront/src/app/[locale]/(storefront)/shop/_components/ProductCard.tsx`
- [ ] T063 [P] [US3] Remove UOM from `frontend/storefront/src/app/[locale]/(storefront)/shop/products/[slug]/_components/ProductDetailClient.tsx`
- [ ] T064 [P] [US3] Remove UOM from `frontend/storefront/src/app/[locale]/(storefront)/school/_components/SchoolListResults.tsx`
- [ ] T065 [P] [US3] Remove UOM from `frontend/storefront/src/app/[locale]/(storefront)/products/[slug]/_components/AddToCartSection.tsx`
- [ ] T066 [P] [US3] Remove UOM from `frontend/storefront/src/app/[locale]/(storefront)/(user)/dashboard/_components/DashboardProductListItem.tsx`

### Tests

- [ ] T067 [P] [US3] Clean `uomCode`/`customerGroup` from `frontend/storefront/cypress/support/actions/cart.actions.ts`
- [ ] T068 [P] [US3] Clean `uomCode`/`customerGroup`/`product.sku` from `frontend/storefront/cypress/support/scenario/admin.ts`
- [ ] T068a [P] [US3] Remove `product.skuPrefix` from `frontend/storefront/src/app/[locale]/(storefront)/shop/products/[slug]/page.tsx`
- [ ] T068b [P] [US3] Remove `product.sku` display from `frontend/storefront/src/app/[locale]/(storefront)/products/[slug]/_components/ProductTabs.tsx`
- [ ] T069 [US3] Run `pnpm --filter @findeg/storefront type-check` — verify zero errors in storefront package

**Checkpoint**: Storefront is clean. Cart uses direct variant pricing. No UOM or product-level SKU references remain.

---

## Phase 5: Documentation Cleanup (MVP-Clean)

**Purpose**: Update all documentation to read as if UOM, price lists, and product-level SKU never existed. This is MVP — no "removed" or "deprecated" language.

- [ ] T070 [P] Remove UOM/price-list table sections (§13, §14), enum entries (`uom_code`, `customer_group`), and flow diagram UOM references from `db/src/schema/catalog/README.md`
- [ ] T071 [P] Remove `variant_pricing` relationship, `uom_code`, and customer group mentions from `db/docs/SCHEMA.md`
- [ ] T072 [P] Remove UOM/price-list references from `docs/architecture/ARCHITECTURE_PLAYBOOK.md`
- [ ] T073 [P] Remove UOM admin references from `backend/src/features/administration/README.md`
- [ ] T074 [P] Remove UOM changelog entries from `CHANGELOG.md`
- [ ] T075 Remove inline code comments referencing UOM, price lists, or customer groups across all modified files (scan during implementation)

**Checkpoint**: All documentation reads as if UOM and product-level SKU never existed.

---

## Phase 6: Verification & Polish

**Purpose**: Full monorepo verification and database sync.

- [ ] T076 Run `pnpm type-check` across entire monorepo — verify zero errors
- [ ] T077 Run `pnpm build` across entire monorepo — verify successful build
- [ ] T078 Run `pnpm db:push` to sync database schema (drop tables/columns)
- [ ] T079 Run `pnpm db:seed` to verify seed script completes without errors
- [ ] T080 Verify product create/edit flow in Dashboard works with inline pricing only
- [ ] T081 Verify Storefront cart flow (add, update, view) works with direct variant prices

**Checkpoint**: All success criteria (SC-001 through SC-007) verified.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Schema)**: No dependencies — start immediately
- **Phase 2 (Backend)**: Depends on Phase 1 completion — BLOCKS frontend work
- **Phase 3 (Dashboard)**: Depends on Phase 2 completion
- **Phase 4 (Storefront)**: Depends on Phase 2 completion; can run in PARALLEL with Phase 3
- **Phase 5 (Docs)**: Can run in PARALLEL with Phases 3-4
- **Phase 6 (Verification)**: Depends on ALL phases completing

### Within Phase 2 (Backend)

- Catalog, Cart, Order, and Core feature cleanups can run in parallel (separate files)
- Administration depends on Catalog domain types being cleaned first (T013-T015 before T022-T024)

### Within Phase 3+4 (Frontend)

- All tasks marked [P] within the same phase can run in parallel (different files)
- Type-check verification tasks (T051, T069) must run after all other tasks in their phase

### Parallel Opportunities

```
Phase 1 (Schema) ─────────────────► Phase 2 (Backend) ──┬──► Phase 3 (Dashboard) ──► Phase 6
                                                         ├──► Phase 4 (Storefront) ──►
                                                         └──► Phase 5 (Docs) ─────────►
```

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2 Only)

1. Complete Phase 1: Schema cleanup
2. Complete Phase 2: Backend cleanup
3. **STOP and VALIDATE**: `pnpm --filter @findeg/db type-check && pnpm --filter @findeg/backend type-check`
4. This alone ensures the data model and business logic are clean

### Incremental Delivery

1. Phase 1 → Schema clean → `db:push` to sync DB
2. Phase 2 → Backend clean → Backend type-checks pass
3. Phase 3 + Phase 4 (parallel) → Frontend clean → Full type-check passes
4. Phase 5 (parallel with 3+4) → Docs clean
5. Phase 6 → Full verification → Build + seed + manual testing

---

## Notes

- [P] tasks = different files, no dependencies — safe to execute in parallel
- [US1] = Schema Simplification, [US2] = Backend Cleanup, [US3] = Frontend Cleanup
- Total: **86 tasks** across 6 phases
- **Documentation rule**: Do NOT write "removed" or "was previously" — write docs as if the removed concepts never existed (MVP-clean)
- Commit after each phase checkpoint
- T075 (comment cleanup) is best done incrementally during implementation rather than as a separate pass
