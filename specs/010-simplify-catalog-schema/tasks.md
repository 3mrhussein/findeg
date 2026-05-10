# Tasks: Simplify Catalog Schema

**Input**: Design documents from `/specs/010-simplify-catalog-schema/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md
**Constitution**: All tasks must satisfy FindEg.com Constitution principles (see `.specify/memory/constitution.md`)

**Tests**: Primary verification via `npm run type-check` and `npm run seed`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Initialize `tasks.md` and verify environment readiness

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema and data changes including enforcement of Catalog Invariants.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Update Drizzle schema in `db/src/schema/catalog/brands.ts` (remove `name`, `isActive`, set `localizedName` as NOT NULL)
- [x] T003 [P] Update Drizzle schema in `db/src/schema/catalog/products.ts` (remove `mediaSet`)
- [x] T004 [P] Update Drizzle schema in `db/src/schema/catalog/product-variants.ts` (add `mediaSet`, add `isDefault`, rename `displayOrder` to `sortOrder`, remove `lowStockThreshold`)
- [x] T005 Update Drizzle schema in `db/src/schema/catalog/product-attributes.ts` (rename table to `attributes`, remove `scope`, `isVariantDefining`, `valueNum`, `valueBool`)
- [x] T006 Add partial unique index for `isDefault` in `db/src/schema/catalog/product-variants.ts`: `(productId) WHERE (isDefault = true)`
- [x] T007 Update `db/src/schema/index.ts` to export `attributes` instead of `attributeDefinitions`
- [x] T008 Apply schema changes using `npm run db:push` in `db/` package
- [x] T009 [P] Update seed data files (brands, products, attributes) to remove legacy fields
- [x] T010 [P] Update seed data file `db/seeds/data/product_variants.json` (add `mediaSet`, `isDefault: true` for default variants, update `sortOrder`)
- [x] T011 [P] Update join tables seed data (ensure only `valueText` is used)
- [x] T012 Update `db/seeds/catalog.ts` to handle table rename and backfill `isDefault`/`sortOrder` logic
- [x] T013 Run `npm run seed` in `db/` package and verify exactly one default variant per product exists

---

## Phase 3: User Story 1 - Simplified Product Data Model (Priority: P1) 🎯 MVP

**Goal**: Align backend domain logic and admin services with the simplified schema and invariants.

- [x] T014 [US1] Update `backend/src/features/catalog/domain/entities/Product.ts` (remove `mediaSet`, add getter for `defaultVariant`)
- [x] T015 [US1] Update `backend/src/features/catalog/domain/entities/Variant.ts` (add `mediaSet`, `isDefault`, `sortOrder`, remove `lowStockThreshold`)
- [x] T016 [US1] Update `backend/src/features/catalog/domain/entities/Attribute.ts` (rename from `AttributeDefinition`, remove legacy fields)
- [x] T017 [US1] Update `backend/src/features/catalog/domain/entities/Brand.ts` (remove `name`, `isActive`, ensure `localizedName` validation)
- [x] T018 [P] [US1] Update Zod schemas in `backend/src/features/administration/domain/types/ProductInput.ts`
- [x] T019 [P] [US1] Update Zod schemas in `backend/src/features/administration/domain/types/VariantInput.ts` (enforce `isDefault` rules and **unique sequential `sortOrder`**)
- [x] T020 [US1] Update `backend/src/features/catalog/infrastructure/persistence/DrizzleProductRepository.ts` (join `isDefault` variant; **filter out products with zero variants**; implement fail-safe fallback)
- [x] T021 [US1] Update `backend/src/features/catalog/infrastructure/persistence/DrizzleVariantRepository.ts`
- [x] T022 [US1] Update `backend/src/features/catalog/infrastructure/persistence/DrizzleBrandRepository.ts`
- [x] T023 [US1] Update `backend/src/features/catalog/infrastructure/persistence/DrizzleAttributeRepository.ts`
- [x] T024 [US1] Update `backend/src/features/administration/application/services/AdminProductService.ts` (ensure Product + Default Variant are created in an ATOMIC transaction; validate exactly one default)
- [x] T025 [US1] Update `backend/src/features/administration/application/services/AdminInventoryService.ts` (remove `lowStockThreshold` references)
- [x] T026 [US1] Update `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductForm/tabs/VariantsTab.tsx` (add `isDefault` toggle, update `sortOrder` field)
- [x] T027 [US1] Update `frontend/dashboard/src/app/[locale]/(dashboard)/inventory/_components/InventoryTable/InventoryTable.tsx` (remove threshold column)

---

## Phase 4: User Story 2 - Default Variant Fallback Pattern (Priority: P1)

**Goal**: Implement robust fallback logic in storefront and dashboard using `isDefault`.

- [x] T028 [US2] Update `frontend/storefront/src/app/[locale]/(storefront)/_components/ProductCard.tsx` to strictly use `defaultVariant` for price and media
- [x] T029 [US2] Update `frontend/storefront/src/app/[locale]/(storefront)/shop/products/[slug]/_components/ProductDetailClient.tsx` (ensure SSR provides the `isDefault` variant)
- [x] T030 [US2] Update `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductCompact.tsx` to use `isDefault` variant hero
- [x] T031 [US2] Update `frontend/dashboard/src/app/[locale]/(dashboard)/products/[id]/edit/_components/MediaTab.tsx` to source gallery from variants

---

## Phase 5: User Story 3 - Attribute Table Rename (Priority: P2)

- [x] T032 [US3] Global search and replace `attributeDefinitions` with `attributes`
- [x] T033 [US3] Global search and replace `AttributeDefinition` entity with `Attribute`
- [x] T034 [US3] Update all queries and documentation to use `attributes`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T035 Update `db/src/schema/catalog/README.md`
- [x] T036 Run full verification: `npm run type-check && npm run lint && npm run build`
- [x] T037 Validate Catalog Invariants in running app

---

## Dependencies & Execution Order

- **Phase 2 (Foundational)**: BLOCKS everything. MUST enforce `isDefault` uniqueness here.
- **Phase 3 (MVP)**: Update domain logic to delegate to `isDefault` variant.
- **Phase 4 (UI)**: Consume the joined `defaultVariant` for SEO-friendly SSR.
