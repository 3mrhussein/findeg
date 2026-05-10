# Data Model Changes: Remove Variant Price Lists & Sellable UOMs

**Branch**: `009-remove-variant-pricing-uom` | **Date**: 2026-05-10

## Tables REMOVED

### `catalog.variant_sellable_uoms` (DROP)

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | — |
| variant_id | integer FK → product_variants | CASCADE delete |
| uom_code | uom_code enum | pcs, pack, carton |
| factor_to_base | decimal(12,4) | Conversion factor |
| localized_label | jsonb | TranslationMap |
| barcode | text | UOM-specific barcode |
| is_enabled | boolean | — |
| created_at | timestamp | — |
| updated_at | timestamp | — |

### `catalog.variant_price_lists` (DROP)

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | — |
| variant_id | integer FK → product_variants | CASCADE delete |
| customer_group | customer_group enum | public_b2c, school_b2b, wholesale |
| uom_code | uom_code enum | pcs, pack, carton |
| currency | text | Default 'EGP' |
| unit_price | decimal(12,2) | — |
| min_qty | integer | Tiered pricing breakpoint |
| is_sellable | boolean | — |
| starts_at | timestamp | Time-bounded pricing |
| ends_at | timestamp | Time-bounded pricing |
| created_at | timestamp | — |
| updated_at | timestamp | — |

## Enums REMOVED

| Enum | Values | Used By After Removal |
|------|--------|----------------------|
| `uom_code` | pcs, pack, carton | **Nothing** — safe to drop |
| `customer_group` | public_b2c, school_b2b, wholesale | **Nothing** — safe to drop |

## Tables MODIFIED

### `catalog.products` (MODIFIED — drop SPU-level SKU)

| Column | Type | Status |
|--------|------|--------|
| sku | text (unique) | **REMOVED** — SKU belongs on `product_variants` only |
| sku_prefix | text | **REMOVED** — no longer needed without SPU-level SKU |

The `products` table is the SPU (Standard Product Unit) level. SKU is a variant-level identifier and already exists on `product_variants.sku`.

### `catalog.product_variants` (relations only)

**No column changes.** Remove the `sellableUoms` and `priceLists` relations from the Drizzle relations definition. The table retains its inline pricing columns:

| Column | Type | Status |
|--------|------|--------|
| base_price | decimal(12,2) | **KEPT** — primary pricing source |
| strike_price | decimal(12,2) | **KEPT** — display was-price |
| cost_price | decimal(12,2) | **KEPT** — internal cost |

### `sales.order_items` (MODIFIED — drop UOM columns)

| Column | Type | Status |
|--------|------|--------|
| uom_code | text | **REMOVED** — UOM no longer supported |
| uom_factor | decimal(12,4) | **REMOVED** — UOM no longer supported |

These columns are dropped since the system never supported UOMs in production. No historical data preservation needed.

## Types REMOVED from `db/src/types/`

### `catalog.ts`
- `UomCodeSchema` (Zod)
- `UomCode` (TypeScript type)
- `CustomerGroupSchema` (Zod)
- `CustomerGroup` (TypeScript type)

### `pricing.ts`
- `PricingCustomerGroupSchema` and `PricingCustomerGroup` — REMOVE
- `PricingTierSchema` and `PricingTier` — REMOVE
- `PersistedPricingSchema.tiers` field — REMOVE (keep `base`, `cost`, `wholesale`)

### Types KEPT in `pricing.ts`
- `PersistedPricingSchema` (simplified: remove `tiers` array)
- `DiscountTypeSchema`, `DiscountRuleSchema` — KEEP (unrelated)
- `AppliedDiscountSchema`, `ResolvedPricingSchema` — KEEP (unrelated)

## Relationship Diagram (After)

```
product_variants
  ├── variant_images (many)
  ├── variant_attributes (many)
  ├── [REMOVED] sellableUoms
  └── [REMOVED] priceLists
```
