/** Catalog service factories. Each call creates a fresh service instance. */

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

export function createSchoolListService() {
  return new SchoolListService();
}

export function createBrandService() {
  return new BrandService();
}

export function createAdminSearchAnalyticsService() {
  return new AdminSearchAnalyticsService();
}
