/**
 * Product Service Interface (SPU Level)
 *
 * Defines read-only operations for the shop-facing product catalog.
 * Variant-specific pricing (sell options, price quotes) has been moved to IVariantService.
 */

import { type Product } from '@findeg/backend/features/catalog/domain/entities/Product';
import type { Locale } from '@findeg/backend/features/core/domain/value-objects';
import { type ProductFilters } from './IProductRepository';
import type { ProductInput } from '../dtos/ProductInput';

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

  create(input: ProductInput): Promise<Product>;
  update(id: number, input: ProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
}
