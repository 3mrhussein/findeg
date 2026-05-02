/**
 * Catalog Services Factory (Pure TypeScript - Framework Agnostic)
 *
 * Exports factory function that returns service instances.
 * Apps call this factory to get services, then wrap service calls in "use cache" directives.
 *
 * Architecture: Backend exports pure TS factories → Apps create data layer with caching
 */

import { DrizzleProductRepository } from "../../infrastructure/persistence/DrizzleProductRepository";
import { DrizzleCategoryRepository } from "../../infrastructure/persistence/DrizzleCategoryRepository";
import { DrizzleBrandRepository } from "../../infrastructure/persistence/DrizzleBrandRepository";
import { DrizzleVariantRepository } from "../../infrastructure/persistence/DrizzleVariantRepository";
import { DrizzleTagRepository } from "../../infrastructure/persistence/DrizzleTagRepository";
import { DrizzleCollectionRepository } from "../../infrastructure/persistence/DrizzleCollectionRepository";
import { DrizzleInventoryRepository } from "../../infrastructure/persistence/DrizzleInventoryRepository";
import { DrizzleSchoolListRepository } from "../../infrastructure/persistence/DrizzleSchoolListRepository";
import { DrizzleAdminSearchAnalyticsRepository } from "../../infrastructure/persistence/DrizzleAdminSearchAnalyticsRepository";

import { ProductService } from "./ProductService";
import { CategoryService } from "./CategoryService";
import { VariantService } from "./VariantService";
import { TagService } from "./TagService";
import { CollectionService } from "./CollectionService";
import { SearchService } from "./SearchService";
import { InventoryService } from "./InventoryService";
import { SchoolListService } from "./SchoolListService";
import { BrandService } from "./BrandService";
import { AdminSearchAnalyticsService } from "./AdminSearchAnalyticsService";

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
  // Create repositories (no arguments - they use singleton db connection)
  const productRepository = new DrizzleProductRepository();
  const categoryRepository = new DrizzleCategoryRepository();
  const brandRepository = new DrizzleBrandRepository();
  const variantRepository = new DrizzleVariantRepository();
  const tagRepository = new DrizzleTagRepository();
  const collectionRepository = new DrizzleCollectionRepository();
  const inventoryRepository = new DrizzleInventoryRepository();
  const schoolListRepository = new DrizzleSchoolListRepository();
  const adminSearchAnalyticsRepository = new DrizzleAdminSearchAnalyticsRepository();

  // Create services (inject repository dependencies)
  return {
    products: new ProductService(productRepository),
    categories: new CategoryService(categoryRepository),
    variants: new VariantService(variantRepository),
    tags: new TagService(tagRepository),
    collections: new CollectionService(collectionRepository),
    search: new SearchService(productRepository),
    inventory: new InventoryService(inventoryRepository),
    schoolLists: new SchoolListService(schoolListRepository),
    brands: new BrandService(brandRepository),
    adminSearchAnalytics: new AdminSearchAnalyticsService(adminSearchAnalyticsRepository),
  };
}

/**
 * Type helper for catalog services
 */
export type CatalogServices = ReturnType<typeof createCatalogServices>;
