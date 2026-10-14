/**
 * Product Service Interface (SPU Level)
 *
 * Defines read-only operations for the shop-facing product catalog.
 * Variant-specific pricing (sell options, price quotes) has been moved to IVariantService.
 */

import { type Product } from '../catalog-product/index';
import type { Locale } from '@findeg/domain';
import { type ProductFilters } from '../catalog-product-filters/types';
import type { ProductInput } from '../catalog-product-input/index';

export interface IProductService {
  getAll(language?: Locale): Promise<Product[]>;

  getById(id: number, language?: Locale): Promise<Product | null>;

  getBySlug(slug: string, language?: Locale): Promise<Product | null>;

  getFeaturedProducts(limit?: number, language?: Locale): Promise<Product[]>;

  searchProducts(query: string, language?: Locale): Promise<Product[]>;

  getByCategory(categoryId: number, language?: Locale): Promise<Product[]>;

  getRelatedProducts(product: Product, limit?: number, language?: Locale): Promise<Product[]>;

  getTopSellingProducts(limit?: number, language?: Locale): Promise<Product[]>;

  getFilteredProducts(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }>;

  getPriceBounds(categoryId?: number): Promise<{ minPrice: number; maxPrice: number }>;

  getProductsByTagIds(tagIds: number[], language?: Locale): Promise<Product[]>;

  create(input: ProductInput): Promise<Product>;
  update(id: number, input: ProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
}
