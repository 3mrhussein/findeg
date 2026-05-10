# Feature Specification: Remove Variant Price Lists & Sellable UOMs

**Feature Branch**: `009-remove-variant-pricing-uom`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "Remove variant_price_lists and variantSellableUoms from the entire system starting from the schema and seeding data, all related logic at all layers database and backend & frontend"

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Removal spans all 4 layers (domain/application/infrastructure/presentation); changes follow existing feature boundaries
- **II. Server-Components First**: No new UI components; removal of existing UI sections only
- **III. Bilingual & RTL-First**: Translation keys related to UOM/pricing tabs removed from BOTH `en.json` and `ar.json`
- **IV. Feature-Oriented Core Kernel**: Changes scoped to `catalog`, `cart`, `administration`, `order`, and `core` features
- **V. Type-Safe & Testable**: All removed types/schemas cleaned from Zod validators and TypeScript interfaces; type-check passes cleanly
- **VI. DRY Principle**: Elimination of unused abstractions reduces complexity
- **VII. SOLID Design**: Interfaces simplified by removing unused method signatures

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Schema Simplification (Priority: P1)

As a developer, I want the `variant_price_lists` and `variant_sellable_uoms` database tables removed so that the data model is simpler and easier to maintain. The system currently uses only the `base_price`, `strike_price`, and `cost_price` columns directly on the `product_variants` table for all pricing needs; the price list and UOM tables are unused overhead.

**Why this priority**: The database schema is the foundation. All other layers depend on it. Removing these tables first prevents any new code from referencing them and establishes the simplified data contract.

**Independent Test**: Run a fresh database migration. Verify the `catalog.variant_price_lists` and `catalog.variant_sellable_uoms` tables no longer exist. Verify `product_variants` still functions correctly with its inline pricing columns.

**Acceptance Scenarios**:

1. **Given** the current schema includes `variant_price_lists` and `variant_sellable_uoms` tables, **When** the migration runs, **Then** both tables are dropped and no longer exist in the database
2. **Given** the schema barrel file exports these tables, **When** the exports are removed, **Then** no compile-time errors occur in the `db` package
3. **Given** seed data includes entries for these tables, **When** the seed script runs, **Then** it completes successfully without referencing the removed tables

---

### User Story 2 - Backend Logic Cleanup (Priority: P1)

As a developer, I want all backend domain entities, application services, repository implementations, and interfaces that reference variant price lists, sellable UOMs, or customer-group-based pricing to be cleaned up so that the codebase has no dead code or broken references.

**Why this priority**: Backend services are consumers of the schema. Removing references here prevents runtime errors and eliminates dead code paths that confuse future development.

**Independent Test**: Run `pnpm type-check` on the `@findeg/backend` package. Verify zero type errors. Verify the `AdminProductService`, `DrizzleVariantRepository`, `VariantService`, `CartService`, and related interfaces compile and function without UOM/price-list references.

**Acceptance Scenarios**:

1. **Given** `DrizzleVariantRepository` queries `variantPriceLists` and `variantSellableUoms`, **When** those references are removed, **Then** the repository compiles and variant queries still return correct data using inline pricing
2. **Given** `AdminProductService` creates/updates price list entries during product creation, **When** that logic is removed, **Then** product create/update still works using the variant's own `base_price`, `strike_price`, `cost_price`
3. **Given** `CartService` and `Cart` entity reference `uomCode` and `customerGroup` for price resolution, **When** those references are simplified, **Then** cart operations still calculate prices correctly from the variant's inline pricing
4. **Given** `VariantInput` and `ProductInput` types include UOM and price list fields, **When** those fields are removed, **Then** the types compile cleanly and all form submissions remain functional

---

### User Story 3 - Frontend Cleanup (Priority: P2)

As a developer, I want all frontend components in both the Dashboard and Storefront that reference UOM codes, customer groups, or price list data to be simplified so that the UI no longer displays or accepts data for these removed concepts.

**Why this priority**: Frontend changes are less risky than backend/schema changes but still necessary for a clean user experience. Users should not see form sections or display fields for concepts that no longer exist.

**Independent Test**: Open the product creation/edit form in the Dashboard. Verify no UOM section or pricing tab references price lists. Open the Storefront product detail page. Verify pricing displays correctly from the variant's inline prices.

**Acceptance Scenarios**:

1. **Given** the Dashboard product form includes a "UoM Section" component, **When** UOM support is removed, **Then** the section no longer appears in the product form
2. **Given** the Dashboard pricing tab references customer groups and price lists, **When** those references are removed, **Then** the pricing tab shows only the variant's inline pricing fields
3. **Given** the Storefront cart and product components reference `uomCode`, **When** the cart system is simplified, **Then** all products are treated as single-unit items (EA) and prices come directly from the variant
4. **Given** the order display components show UOM codes per line item, **When** UOM is removed, **Then** order line items display quantity and price without unit-of-measure labels

---

### Edge Cases

- What happens to existing orders in the database that have `uom_code` columns? The `uom_code` and `uom_factor` columns are removed from `order_items` since the UOM feature was never active in production; no historical data needs preservation
- How does the cart handle items that were previously added with a specific UOM? The cart is session-based and ephemeral; no migration of cart data is needed
- What happens to the `uomCodeEnum` and `customerGroupEnum` in the enums file? The `uomCodeEnum` is removed if no other tables reference it. The `customerGroupEnum` is removed if only used by `variant_price_lists`

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST drop the `catalog.variant_sellable_uoms` database table via migration
- **FR-002**: System MUST drop the `catalog.variant_price_lists` database table via migration
- **FR-003**: System MUST remove all Drizzle schema definitions, relations, and type exports for both tables from `variant-pricing.ts`
- **FR-004**: System MUST remove or simplify the `variant-pricing.ts` file (delete entirely if both tables are the only content)
- **FR-005**: System MUST update the catalog schema barrel (`db/src/schema/catalog/index.ts`) to stop exporting removed entities
- **FR-006**: System MUST remove `variantSellableUoms` relations from `product-variants.ts`
- **FR-007**: System MUST remove all seed data referencing `variant_price_lists` and `variant_sellable_uoms` from `db/seeds/catalog.ts` and `db/seeds/helpers/constants.ts`
- **FR-008**: System MUST clean up `DrizzleVariantRepository` to remove price list and UOM queries
- **FR-009**: System MUST clean up `AdminProductService` to remove price list and UOM creation/update logic
- **FR-010**: System MUST simplify `CartService`, `Cart` entity, and `AddCartItem` schema to remove `uomCode` and `customerGroup` dependencies
- **FR-011**: System MUST simplify `VariantService`, `IVariantRepository`, and `IVariantService` interfaces to remove UOM/price-list method signatures
- **FR-012**: System MUST clean up `VariantInput`, `ProductInput`, and `UoMTypes` domain types
- **FR-013**: System MUST simplify `Variant` domain entity and `Pricing` value object to remove customer-group pricing resolution
- **FR-014**: System MUST remove or simplify `common.ts` types in `core/domain/types` that reference `uomCode` or `customerGroup`
- **FR-015**: System MUST remove the UoM Section component from the Dashboard product form
- **FR-016**: System MUST simplify the Dashboard Pricing Tab to remove price list references
- **FR-017**: System MUST simplify Storefront cart components (`CartProvider`, `CartDrawer`, `CartItem`, `AddToCartButton`) to remove UOM references
- **FR-018**: System MUST simplify Storefront product components to remove UOM display logic
- **FR-019**: System MUST update Storefront `catalog.ts` actions and `queries.ts` data layer to remove UOM/customer-group logic
- **FR-020**: System MUST update Dashboard and Storefront `interfaces.ts` to remove UOM/pricing-related type definitions
- **FR-021**: System MUST clean up Cypress test support files (`cart.actions.ts`, `admin.ts`) in both Dashboard and Storefront
- **FR-022**: System MUST remove unused enum definitions (`uomCodeEnum`, `customerGroupEnum`) if no other tables reference them
- **FR-023**: System MUST remove related type definitions from `db/src/types/pricing.ts` and `db/src/types/catalog.ts`
- **FR-024**: System MUST pass `pnpm type-check` with zero errors after all changes
- **FR-025**: System MUST pass `pnpm build` successfully after all changes
- **FR-026**: All documentation (READMEs, SCHEMA.md, ARCHITECTURE_PLAYBOOK.md, CHANGELOG.md) MUST be updated to remove any mention of UOM, price lists, customer groups, or variant pricing — docs must read as if these concepts never existed (MVP-clean)
- **FR-027**: System MUST remove `uom_code` and `uom_factor` columns from the `order_items` schema
- **FR-028**: Inline code comments referencing UOM or price lists MUST be removed or rewritten
- **FR-029**: System MUST remove `sku` and `sku_prefix` columns from the `products` table — SKU belongs only on `product_variants`
- **FR-030**: All backend domain entities, services, repositories, admin input types, and frontend components that reference `product.sku` or `product.skuPrefix` MUST be updated to remove those references

### Key Entities

- **ProductVariant**: Retains its inline pricing columns (`base_price`, `strike_price`, `cost_price`) and its own `sku` column (the single source of truth for SKU). Loses its relations to `variantSellableUoms` and `variantPriceLists`
- **Product (SPU)**: `sku` and `sku_prefix` columns removed — SKU is a variant-level concept, not a product-level concept
- **VariantSellableUom** _(REMOVED)_: Table defining multi-unit packaging (PACK_3, BOX_12) per variant. Being removed entirely
- **VariantPriceList** _(REMOVED)_: Table defining customer-group-specific tiered pricing per variant/UOM combination. Being removed entirely
- **Cart / CartItem**: Simplified to use direct variant pricing instead of resolving prices through UOM + customer group lookups
- **Order / OrderItem**: `uom_code` and `uom_factor` columns removed from `order_items` since UOM was never active in production

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The monorepo type-check (`pnpm type-check`) passes with zero errors across all packages
- **SC-002**: The monorepo build (`pnpm build`) completes successfully for all packages
- **SC-003**: The database migration runs without errors, dropping both tables cleanly
- **SC-004**: The seed script executes successfully without referencing removed tables
- **SC-005**: Product creation and editing in the Dashboard works correctly using only inline variant pricing
- **SC-006**: The Storefront cart flow (add, update quantity, view, checkout) works correctly using direct variant prices
- **SC-007**: The total number of files modified or deleted is documented and verified against the impact analysis

## Assumptions

- The system currently does NOT rely on `variant_price_lists` for any active pricing logic in production; all pricing is handled via the variant's inline `base_price`, `strike_price`, and `cost_price` columns
- The `uomCodeEnum` and `customerGroupEnum` are safe to delete — no surviving tables reference them after removing UOM columns from `order_items`
- The UOM feature was never active in production, so no historical data preservation is needed for `order_items.uom_code` or `uom_factor`
- The cart is session-based (not persisted to database), so no cart data migration is required
- The `variant-pricing.ts` file can be deleted entirely since both tables it defines are being removed
- Database migration will be a new Drizzle migration that drops both tables
