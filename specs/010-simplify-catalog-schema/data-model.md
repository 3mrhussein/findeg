# Data Model: Simplified Catalog

**Created**: 2026-05-10  
**Feature**: Simplify Catalog Schema (branch `010-simplify-catalog-schema`)

## Modified Entities

### 1. Brands (`brands`)
| Field | Type | Notes |
|-------|------|-------|
| id | serial | PK |
| slug | text | Unique |
| localizedName | jsonb | `TranslationMap` (NOT NULL, Source of truth) |
| localizedDescription | jsonb | `TranslationMap` |
| logoUrl | text | Nullable |
| createdAt/updatedAt | timestamp | |

### 2. Attributes (`attributes`) - renamed from `attribute_definitions`
| Field | Type | Notes |
|-------|------|-------|
| id | serial | PK |
| key | text | Unique (e.g., "color") |
| dataType | text | e.g., "text", "color", "number" |
| unit | text | Optional unit |
| localizedLabel | jsonb | `TranslationMap` |
| enumValues | jsonb | Optional predefined values |
| isFilterable | boolean | Default true |
| sortOrder | integer | Default 0 |
| isActive | boolean | Default true |
| createdAt/updatedAt | timestamp | |

### 3. Products (`products`)
| Field | Type | Notes |
|-------|------|-------|
| id | serial | PK |
| slug | text | Unique |
| localizedName/Description/LongDescription | jsonb | `TranslationMap` |
| categoryId | integer | FK categories |
| brandId | integer | FK brands |
| isActive | boolean | |
| rating/reviewsCount | decimal/int | |
| createdAt/updatedAt | timestamp | |
| ~~mediaSet~~ | | **REMOVED** |

### 4. Product Variants (`product_variants`)
| Field | Type | Notes |
|-------|------|-------|
| id | serial | PK |
| productId | integer | FK products |
| sku | text | Unique |
| variantKey | text | e.g., "default", "blue-0.7" |
| localizedLabel | jsonb | `TranslationMap` |
| isActive | boolean | |
| isDefault | boolean | Default false (Enforced unique per product) |
| sortOrder | integer | Default 0 |
| basePrice/strikePrice/costPrice | decimal | |
| weightGrams/barcode | int/text | |
| mediaSet | jsonb | `ResponsiveMediaSet` (Added here) |
| createdAt/updatedAt | timestamp | |
| ~~lowStockThreshold~~ | | **REMOVED** |
| ~~displayOrder~~ | | **REPLACED by sortOrder** |

### 5. Product/Variant Attributes (`product_attributes`, `variant_attributes`)
| Field | Type | Notes |
|-------|------|-------|
| productId/variantId | integer | FK |
| attributeId | integer | FK attributes |
| valueText | text | **Only source of truth for value** |
| ~~valueNum~~ | | **REMOVED** |
| ~~valueBool~~ | | **REMOVED** |

## Relationships

- `products.brandId` → `brands.id`
- `product_variants.productId` → `products.id`
- `product_attributes.attributeId` → `attributes.id`
- `variant_attributes.attributeId` → `attributes.id`
