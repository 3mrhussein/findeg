# Feature Specification: Simplify Catalog Schema

**Feature Branch**: `010-simplify-catalog-schema`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "Remove scope from attributeDefinitions, remove lowStockThreshold, remove valueNum & valueBool from attribute values, remove mediaSet from products and use it in variants table where the fallback values for variants prices & mediaSet is the variant with variantKey='default', remove displayOrder from product-variants, remove isActive/name from brands table, remove isVariantDefining since there is already product_variants & product_attributes, starting from the schema and seeding data, all related logic at all layers database and backend & frontend & update related docs, rename attribute_definitions to attributes"

## Clarifications

### Session 2026-05-10

- Q: What should `attribute_definitions` be renamed to? → A: `attributes` — concise, unambiguous given the join table names.
- Q: Should backward compatibility be maintained? → A: No. MVP phase — no production data. Use `drizzle-kit push` or fresh migration.
- Q: How to handle admin deselection of the only default variant? → A: Strict Rejection: Block the update and return a validation error.
- Q: What action should the repository take on fail-safe fallback? → A: Alert and Log: Emit a critical log warning for manual cleanup.
- Q: Should `sortOrder` be unique per product? → A: Strict Sequence: System MUST ensure unique sequential integers (1, 2, 3...) per product.
- Q: How to handle products with zero variants in the storefront? → A: Hide / Filter out: Automatically hide the product from listings and search.

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Feature uses 4-layer structure (domain/application/infrastructure/presentation); no cross-feature infrastructure imports
- **II. Server-Components First**: All new UI uses Server Components by default; Client Components justified for interactivity only
- **III. Bilingual & RTL-First**: All UI text added to BOTH `en.json` and `ar.json`; logical Tailwind classes used
- **IV. Feature-Oriented Core Kernel**: Feature is self-contained in `src/features/[feature]/`; dependencies on `core` only
- **V. Type-Safe & Testable**: Zod schemas at boundaries; TypeScript strict mode; tests for critical paths
- **VI. DRY Principle**: No duplicated logic, components, or utilities; single source of truth for all abstractions
- **VII. SOLID Design**: Single Responsibility verified; Open/Closed principle applied; Liskov Substitution, Interface Segregation, Dependency Inversion evident

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Simplified Product Data Model (Priority: P1)

As a developer maintaining the catalog, I need a leaner database schema that removes columns our MVP doesn't use, so the codebase is easier to understand, seed data is simpler, and there are no misleading fields that suggest features we don't support.

**Why this priority**: The schema is the foundation of every layer. All backend services, storefront queries, and dashboard forms depend on it. Removing unused columns first unblocks all downstream cleanup.

**Independent Test**: After migration, every database operation (seed, CRUD, listing, filtering) works correctly with the simplified schema. Type-check passes across all packages with zero errors.

**Acceptance Scenarios**:

1. **Given** the current schema has `scope`, `isVariantDefining` on `attribute_definitions`, **When** the migration runs, **Then** those columns no longer exist in the database and all referencing code has been updated.
2. **Given** `product_variants` has `lowStockThreshold` and `displayOrder`, **When** the migration runs, **Then** those columns are removed and no code references them.
3. **Given** `brands` has `isActive` and `name`, **When** the migration runs, **Then** those columns are removed and the `localizedName` field is the sole source of brand naming.
4. **Given** `product_attributes` and `variant_attributes` have `valueNum` and `valueBool` columns, **When** the migration runs, **Then** only `valueText` remains — all attribute values are stored as text strings.
5. **Given** `products` has a `mediaSet` column, **When** the migration runs, **Then** `mediaSet` is removed from `products` and added to `product_variants` instead.

---

### User Story 2 - Default Variant Fallback Pattern (Priority: P1)

As a storefront developer, when rendering a product listing or product detail page, I need a convention for which variant provides the "hero" image and display price so that I can render product cards without selecting a specific variant.

**Why this priority**: Moving `mediaSet` from the product to variants means the storefront needs a clear rule for which variant's data to display before the customer selects one. Without this, product cards would have no image or price.

**Independent Test**: Product listing pages render correctly using the default variant's `mediaSet` and `basePrice` as the hero image and starting price.

**Acceptance Scenarios**:

1. **Given** a product with multiple variants including one where `variantKey = 'default'`, **When** the product listing page renders, **Then** the default variant's `mediaSet` and `basePrice` are used for the product card.
2. **Given** a product where no variant has `variantKey = 'default'`, **When** the product listing page renders, **Then** the first variant (by database ID or lowest price) is used as the fallback.
3. **Given** a simple product with a single variant (`variantKey = 'default'`), **When** the PDP renders, **Then** the variant's `mediaSet` is shown as the hero gallery and its `basePrice` is shown as the product price.

---

### User Story 3 - Attribute Table Rename (Priority: P2)

As a developer, I need the `attribute_definitions` table to be renamed to a clearer, more concise name so that code referencing it is easier to read and write.

**Why this priority**: Renaming a table touches all layers (schema, queries, imports, docs) but is lower risk than structural changes. It should be done alongside the other schema changes to avoid multiple migrations.

**Independent Test**: All imports, queries, and references use the new table name. Type-check passes. Seed data inserts correctly.

**Acceptance Scenarios**:

1. **Given** the table is currently called `attribute_definitions`, **When** the rename migration runs, **Then** the table is renamed to `attributes` and all code references (schema, queries, imports, docs) are updated.

---

### Edge Cases

- **Missing Default Variant**: What happens when a product has variants but none has `isDefault = true`? → The system falls back to the first variant by ID during read operations, but the admin validation MUST prevent this state during write operations. **If an admin tries to deselect the only default, the system rejects the update with a validation error.**
- **Empty Variant State**: What happens to products with zero variants? → They are automatically filtered out from all storefront listings and search results.
- **Fail-safe Logging**: What happens on repository fallback? → A critical log warning is emitted for manual or scripted cleanup.

## Catalog Invariants (Critical Rules)

These rules MUST be enforced at the database or application layer to ensure system integrity:

1.  **Default Variant Invariant**: Every product MUST have exactly one variant with `isDefault = true`.
    *   **Enforcement (Database)**: A partial unique index: `CREATE UNIQUE INDEX ON product_variants (product_id) WHERE (is_default = true)`. This prevents multiple defaults.
    *   **Enforcement (Application)**: Atomic transactions in the Service/Repository layer MUST ensure that every Product creation includes at least one variant marked as `isDefault`.
    *   **Enforcement (Seeder)**: Seed data MUST be validated to provide exactly one default per product.
    *   **Fail-safe (Read)**: If a product is fetched and no `isDefault` variant is found (due to legacy data or corruption), the repository MUST fallback to the first variant by ID and log a critical data integrity warning.
2.  **Pricing Invariant**: Products DO NOT store or calculate prices. All pricing logic (base, strike, cost) resides in the variant. The system resolves product-level "starting price" by querying the `isDefault` variant.
3.  **Media Invariant**: Primary product imagery is sourced from the `isDefault` variant's `mediaSet`. If the default variant has no media, the system falls back to the first variant with available media.
4.  **Attribute Invariant**: An attribute MUST NOT be assigned to both the product (SPU) and its variants (SKU) for the same product instance.
5.  **Brand Identity Invariant**: Every brand MUST have a `localizedName` containing at least an English entry. This is the primary display field for admin and storefront.

## Requirements _(mandatory)_

### Functional Requirements

#### Schema Removals

- **FR-001**: System MUST remove `scope` column from `attributes` table.
- **FR-002**: System MUST remove `isVariantDefining` column from `attributes` table.
- **FR-003**: System MUST remove `lowStockThreshold` column from `product_variants` table.
- **FR-004**: System MUST rename `displayOrder` to `sortOrder` in `product_variants`. The system MUST enforce a **unique sequential integer sequence** (1, 2, 3...) per product for this field.
- **FR-005**: System MUST remove `valueNum` and `valueBool` columns from both `product_attributes` and `variant_attributes` tables. All attribute values will be stored as text strings in `valueText`.
- **FR-006**: System MUST remove `isActive` and `name` columns from `brands` table. `localizedName` becomes the sole source of truth.

#### Schema Additions/Moves

- **FR-007**: System MUST remove `mediaSet` column from `products` table.
- **FR-008**: System MUST add `mediaSet` column (JSONB, nullable) to `product_variants` table.
- **FR-009**: System MUST add `isDefault` (boolean, default false) to `product_variants` and enforce exactly one default per product.

#### Rename

- **FR-010**: System MUST rename the `attribute_definitions` table to `attributes`.

#### Cross-Layer Updates

- **FR-011**: System MUST update all Drizzle ORM schema definitions.
- **FR-012**: System MUST update all seed data files and seeder logic to backfill `isDefault` and `sortOrder`.
- **FR-013**: System MUST update all backend domain entities and services to enforce Catalog Invariants.
- **FR-014**: System MUST update all storefront data queries to join the `isDefault` variant during SSR to prevent hydration flicker and SEO loss.
- **FR-015**: System MUST update all dashboard admin forms to support `isDefault` and `sortOrder` management.
- **FR-016**: System MUST update the catalog README documentation.

### Key Entities

- **Product (SPU)**: Metadata container with localized content, category, brand. No longer holds pricing or media; delegates these to the `isDefault` variant.
- **Product Variant (SKU)**: Primary business entity for trade. Gains `mediaSet` and `isDefault` flag. Loses `lowStockThreshold`. Uses `sortOrder` for UI positioning.
- **Attributes** (renamed from `attribute_definitions`): Global attribute dictionary. Values are text-only.
- **Brand**: Simplified to `slug`, `localizedName` (NOT NULL), `localizedDescription`, `logoUrl`, and timestamps.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All packages (`@findeg/db`, `@findeg/backend`, `@findeg/storefront`, `@findeg/dashboard`) pass type-check with zero errors after the schema changes.
- **SC-002**: Database seed completes successfully with the simplified schema, inserting all products and variants correctly.
- **SC-003**: Product listing pages render correctly, showing the default variant's image and price for each product card.
- **SC-004**: The admin product form creates and edits products without referencing any removed fields.
- **SC-005**: The catalog README documentation accurately describes the final schema with no references to removed columns or tables.

## Assumptions

- This is an MVP project in active development — there are no production databases to migrate. No backward compatibility is required. Schema changes can be applied via `drizzle-kit push` or a fresh migration.
- All attribute values can be represented as text strings. Numeric filtering (e.g., "tip size between 0.5 and 1.0") can be done with string-to-number casting at the query layer if needed in the future.
- Low-stock alerting will be a separate feature in a future iteration, not part of the current MVP.
- Brand visibility is inherently controlled by whether any active product references the brand — a separate `isActive` flag is unnecessary.
- The non-localized `name` on brands was redundant with `localizedName.en` and can be removed.
- Variant display ordering is not needed because the frontend can sort by variant key or creation order.
