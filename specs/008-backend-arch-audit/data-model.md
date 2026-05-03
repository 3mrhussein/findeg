# Data Model: Backend Architectural Refactoring (Phase 1)

## Read Models (DTOs)

The following Read Models are used to decouple the Application layer from the Infrastructure schema.

### CatalogHealthStats
| Field | Type | Description |
| :--- | :--- | :--- |
| `totalProducts` | `number` | Total count of all products. |
| `missingCategory` | `number` | Count of products without a category. |
| `missingImages` | `number` | Count of products without images in any variant. |
| `missingPrice` | `number` | Count of products without a price in any variant. |
| `draftProducts` | `number` | Count of inactive products. |
| `fullyComplete` | `number` | Count of active products with category, price, and images. |
| `totalCategories` | `number` | Total count of categories. |
| `totalBrands` | `number` | Total count of brands. |

### CategoryProductDistribution
| Field | Type | Description |
| :--- | :--- | :--- |
| `categoryId` | `string` | Unique identifier of the category. |
| `categoryName` | `string` | Localized name or slug of the category. |
| `productCount` | `number` | Number of products in this category. |
| `percentage` | `number` | Percentage of total products. |

## Raw Database Functions (@findeg/db)

- **`getCatalogHealthRaw()`**: Returns raw counts for product completion states.
- **`getCategoryDistributionRaw(limit: number)`**: Returns aggregated product counts per category.
