/**
 * Catalog Services Factory (Pure TypeScript - Framework Agnostic)
 *
 * Exports factory function that returns service instances.
 * Apps call this factory to get services, then wrap service calls in "use cache" directives.
 *
 * Architecture: Backend exports pure TS factories → Apps create data layer with caching
 */

import { ProductService } from './ProductService';
import { CategoryService } from './CategoryService';
import { VariantService } from './VariantService';
import { TagService } from './TagService';
import { CollectionService } from './CollectionService';
import { SearchService } from './SearchService';
import { InventoryService } from './InventoryService';
import { SchoolListService } from './SchoolListService';
import { BrandService } from './BrandService';
import { AdminSearchAnalyticsService } from './AdminSearchAnalyticsService';

/**
 * Create catalog services with all dependencies wired
 *
 * @returns Object containing all catalog service instances
 *
 * @example
 * ```ts
 * // In app data layer (dashboard/src/data/products/queries.ts):
 * "use cache";
 * import { createCatalogServices } from '@findeg/backend/features/catalog';
 *
 * export async function getProducts(locale: string) {
 *   cacheTag('products', `products-${locale}`);
 *   cacheLife('hours');
 *
 *   const { products } = createCatalogServices();
 *   return await products.getAll(locale);
 * }
 * ```
 */
export function createCatalogServices() {
  return {
    products: new ProductService(),
    categories: new CategoryService(),
    variants: new VariantService(),
    tags: new TagService(),
    collections: new CollectionService(),
    search: new SearchService(),
    inventory: new InventoryService(),
    schoolLists: new SchoolListService(),
    brands: new BrandService(),
    adminSearchAnalytics: new AdminSearchAnalyticsService(),
  };
}

/**
 * Type helper for catalog services
 */
export type CatalogServices = ReturnType<typeof createCatalogServices>;
