# Data Model

No new database tables or significant architectural data models are being added in this feature.

## Type Adjustments

### `ProductDetailPageData` (Storefront Layer)

- **Current Shape**: `ProductDetailPageData` (incorrectly assuming it is always present)
- **New Shape**: `ProductDetailPageData | null`
- **Validation Rules**: Standard Next.js server components pattern where the page checks `if (!data) return notFound();`.
