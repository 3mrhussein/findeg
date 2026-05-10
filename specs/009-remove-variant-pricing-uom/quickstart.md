# Quickstart: Remove Variant Price Lists & Sellable UOMs

**Branch**: `009-remove-variant-pricing-uom`

## What Changed

Removed the `variant_price_lists` and `variant_sellable_uoms` tables and all related logic from the system. Product pricing now relies exclusively on the `product_variants` table's inline columns: `base_price`, `strike_price`, and `cost_price`.

## Layers Affected

| Layer | Scope |
|-------|-------|
| **Database** | Drop 2 tables, 2 enums, remove type exports |
| **Backend** | Simplify domain entities, services, repositories, interfaces |
| **Dashboard** | Remove UoM Section, simplify Pricing Tab |
| **Storefront** | Simplify cart, product display, and checkout components |
| **Tests** | Update Cypress support files |

## Key Design Decision

Pricing is now a **flat structure** on the variant: `{ basePrice, strikePrice, costPrice }`. There are no longer customer-group-based pricing tiers or multi-unit packaging concepts. This dramatically simplifies the entire data flow from database → backend → frontend.

## How to Verify

```bash
# 1. Push schema changes to database
pnpm db:push

# 2. Re-seed the database
pnpm db:seed

# 3. Type-check the entire monorepo
pnpm type-check

# 4. Build all packages
pnpm build
```

## Files Deleted
- `db/src/schema/catalog/variant-pricing.ts`
- `frontend/dashboard/src/app/[locale]/(dashboard)/products/_components/ProductForm/uom/UoMSection.tsx`

## Columns Removed from `order_items`
- `uom_code` and `uom_factor` columns dropped — UOM was never active in production
