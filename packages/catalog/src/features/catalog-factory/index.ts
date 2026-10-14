/** Catalog service factories. Each call creates a fresh service instance. */

import { ProductService } from '../catalog-product-service/index';
import { CategoryService } from '../catalog-category-service/index';
import { VariantService } from '../catalog-variant-service/index';
import { TagService } from '../catalog-tag-service/index';
import { CollectionService } from '../catalog-collection-service/index';
import { SearchService } from '../catalog-search-service/index';
import { InventoryService } from '../catalog-inventory-service/index';
import { BrandService } from '../catalog-brand-service/index';
import { AdminSearchAnalyticsService } from '../catalog-admin-search-analytics-service/index';

export function createProductService() {
  return new ProductService();
}

export function createCategoryService() {
  return new CategoryService();
}

export function createVariantService() {
  return new VariantService();
}

export function createTagService() {
  return new TagService();
}

export function createCollectionService() {
  return new CollectionService();
}

export function createSearchService() {
  return new SearchService();
}

export function createInventoryService() {
  return new InventoryService();
}

export function createBrandService() {
  return new BrandService();
}

export function createAdminSearchAnalyticsService() {
  return new AdminSearchAnalyticsService();
}
