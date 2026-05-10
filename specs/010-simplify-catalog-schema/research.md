# Research: Catalog Schema Simplification

**Created**: 2026-05-10  
**Feature**: Simplify Catalog Schema (branch `010-simplify-catalog-schema`)

## Decisions & Rationale

### 1. Attribute Definition Rename
- **Decision**: Rename `attribute_definitions` to `attributes`.
- **Rationale**: User requested a shorter, cleaner name. Join tables (`product_attributes`, `variant_attributes`) already provide context.
- **Alternatives considered**: `attribute_specs`, `attribute_catalog`.

### 2. Media Handling Transition
- **Decision**: Remove `mediaSet` from `products`. Add `mediaSet` to `product_variants`.
- **Rationale**: Variants often have different colors or designs that require specific imagery. Using the `default` variant as the fallback source for the "SPU" display is a standard e-commerce pattern.
- **Impact**: `ProductCard` and PDP must be updated to find the `default` variant and use its `mediaSet`.

### 3. Attribute Value Consolidation
- **Decision**: Remove `valueNum` and `valueBool` from all attribute join tables. Use `valueText` exclusively.
- **Rationale**: Simplifies schema and queries. Numeric or boolean values will be stored as strings and cast if necessary in the future.
- **Impact**: Domain entities and Zod schemas must be updated to expect only `valueText`.

### 4. Brand Simplification
- **Decision**: Remove `name` and `isActive` from `brands`.
- **Rationale**: `localizedName` is the source of truth for the name. `isActive` is redundant as brand visibility is controlled via product status.
- **Impact**: Admin services and repositories must be updated to use `localizedName.en` as a fallback for the old `name` field if needed, but primarily use the translation map.

### 5. Variant Clean-up
- **Decision**: Remove `lowStockThreshold` and `displayOrder`.
- **Rationale**: Not required for MVP. Reduces noise in the database and code.
- **Impact**: Remove from `VariantEntity`, `InventoryTable`, and admin forms.

## Technical Unknowns Resolved

- **Storefront Fallback**: `ProductCard` already has logic to find the `default` variant. It will be updated to prioritize `variant.mediaSet`.
- **Drizzle Rename**: `attributes` table name does not conflict with SQL keywords or existing tables in a way that prevents renaming.
- **Seed Data**: JSON seed files for brands, attributes, and products must be manually updated or transformed to match the new schema.
