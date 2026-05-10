# Research: Remove Variant Price Lists & Sellable UOMs

**Branch**: `009-remove-variant-pricing-uom` | **Date**: 2026-05-10

## R1: Enum Dependency Analysis

**Decision**: Both `uomCodeEnum` and `customerGroupEnum` can be safely deleted from `db/src/schema/enums.ts`.

**Rationale**: 
- `uomCodeEnum` is only used by `variant-pricing.ts` (which is being deleted) and `AdminProductService.ts` (which will be cleaned up). The `orderItems.uomCode` column uses `text("uom_code")`, NOT the enum type — so no dependency.
- `customerGroupEnum` is only used by `variant-pricing.ts` (being deleted). No other schema tables reference it.

**Alternatives considered**: Keeping the enums "just in case" — rejected because dead enum types in the PostgreSQL schema create confusion and the enum values can be re-created later if needed via a new migration.

## R2: Order Items UOM Columns

**Decision**: The `uomCode` and `uomFactor` columns on `orderItems` are **removed** via schema change.

**Rationale**: The UOM feature was never active in production. There is no meaningful historical data to preserve in these columns. Keeping dead columns creates confusion for future developers.

**Alternatives considered**: Preserving them for "historical integrity" — rejected because the system never shipped UOM support, so there is no real history to protect.

## R3: Cart System Simplification

**Decision**: Remove `uomCode` and `customerGroup` from the Cart domain entity, `AddCartItem` schema, and `CartService`. All cart pricing resolves directly from `variant.basePrice`.

**Rationale**: The cart is session-based (in-memory/cookie), not persisted to the database. There is no historical data concern. The `CartService` currently looks up pricing through the variant's price lists, but since all pricing already exists on the `product_variants` table (`base_price`, `strike_price`, `cost_price`), the price-list resolution path is dead code.

## R4: Backend Variant Domain Simplification

**Decision**: The `Variant` domain entity, `Pricing` value object, `UoMTypes`, `IVariantRepository`, `IVariantService`, and `VariantService` will be simplified to remove UOM/customer-group concepts. Pricing becomes a simple `{ basePrice, strikePrice, costPrice }` structure.

**Rationale**: The variant already has inline pricing. The elaborate `Pricing` value object that resolves prices through customer groups and UOM tiers is unused overhead.

## R5: Dashboard UOM Section & Pricing Tab

**Decision**: The `UoMSection` component is deleted entirely. The `PricingTab` is simplified to show only the variant's inline pricing fields (`basePrice`, `strikePrice`, `costPrice`).

**Rationale**: These UI components create/edit data for tables that no longer exist. The pricing tab should remain but only show the simple pricing fields.

## R6: Migration Strategy

**Decision**: Use Drizzle's `db:push` approach (schema-driven) rather than manual SQL migration files. Delete the Drizzle schema definitions first, then run `drizzle-kit push` to sync the database.

**Rationale**: The project uses `db:push` for development (confirmed by `package.json` scripts: `db:setup` → `db:push`). Drizzle will detect the removed tables and generate the appropriate DROP TABLE statements.

**Alternatives considered**: Writing manual SQL migration — rejected because the project's workflow uses schema-first push, not migration files.
