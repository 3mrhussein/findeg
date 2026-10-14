# Cache Invalidation Strategy

This document describes normalized cache tag usage across the Dashboard data layer (`src/data/**`).
Adheres to Next.js 16 `"use cache"` and `updateTag()` semantics.

## Canonical Resource Cache Tags

Each resource has exactly one normalized cache tag:

| Resource | Cache Tag | Queries Layer | Mutations Layer |
| :--- | :--- | :--- | :--- |
| **Products** | `products` | `src/data/products/queries.ts` | `src/data/products/actions.ts` |
| **Categories** | `categories` | `src/data/categories/queries.ts`, `src/data/resources/queries.ts` | `src/data/categories/actions.ts` |
| **Brands** | `brands` | `src/data/resources/queries.ts` | `src/data/brands/actions.ts` |
| **Collections** | `collections` | `src/data/resources/queries.ts` | `src/data/collections/actions.ts` |
| **Tags** | `tags` | `src/data/resources/queries.ts` | `src/data/tags/actions.ts` |
| **Inventory** | `inventory` | `src/data/inventory/queries.ts` | `src/data/inventory/actions.ts` |
| **Orders** | `orders` | `src/data/orders/queries.ts` | `src/data/orders/actions.ts` |
| **Partners** | `partners` | `src/data/partners/queries.ts` | `src/app/[locale]/(dashboard)/partners/_actions/**` |
| **School Lists** | `school-lists` | `src/data/school-lists/queries.ts` | `src/app/[locale]/(dashboard)/school-lists/_actions/**` |
| **Dashboard** | `dashboard` | `src/data/admin/queries.ts` | Orders & status mutations |
| **Staff / Access** | `access` | `src/data/access/queries.ts` | `src/data/access/actions.ts` |

## Rules

1. **`import 'server-only'`**:
   Every query file under `src/data/**/queries.ts` and `src/lib/session.ts` must begin with `import 'server-only';`.
2. **`cacheTag('<resource>')`**:
   Data queries declare their canonical tag using `cacheTag('<resource>')`.
3. **`updateTag('<resource>')`**:
   Server actions revalidate cache using `updateTag('<resource>')` from `'next/cache'` for immediate read-your-own-writes consistency.
