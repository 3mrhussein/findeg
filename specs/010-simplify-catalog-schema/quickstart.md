# Quickstart: Catalog Schema Simplification

**Created**: 2026-05-10  
**Feature**: Simplify Catalog Schema (branch `010-simplify-catalog-schema`)

## Setup

1. **Apply Schema Changes**:
   ```bash
   cd db
   npm run db:push
   ```
   *Note: This will perform a destructive update as per MVP rules (no backward compatibility).*

2. **Seed Data**:
   ```bash
   npm run seed
   ```
   *Note: The seeder has been updated to handle the new schema and JSON data formats.*

## Verification Steps

### Backend
1. Check `backend/src/features/catalog/domain/entities/` for updated types.
2. Run `npm run type-check` in the backend package.

### Admin Dashboard
1. Navigate to `/products`.
2. Verify that `lowStockThreshold` and `displayOrder` fields are gone from the variant form.
3. Verify that Brands show only `localizedName`.

### Storefront
1. Open the homepage or shop page.
2. Ensure product cards display images (sourced from the `default` variant's `mediaSet`).
3. Ensure prices are correctly displayed from the `default` variant.

## Key Files to Watch

- `db/src/schema/catalog/`: Source of truth for database structure.
- `backend/src/features/catalog/domain/entities/`: Domain mapping of database entities.
- `frontend/storefront/src/app/[locale]/(storefront)/_components/ProductCard.tsx`: Fallback rendering logic.
