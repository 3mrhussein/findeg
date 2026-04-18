/**
 * Product Service Interface (SPU Level)
 *
 * Defines read-only operations for the shop-facing product catalog.
 * Variant-specific pricing (sell options, price quotes) has been moved to IVariantService.
 */

import { type Product } from "@backend/features/catalog/domain/entities/Product";
import type { Locale } from "@backend/features/core/domain/value-objects";
import { type ProductFilters } from "./IProductRepository";

export interface IProductService {
  getAll(language?: Locale): Promise<Product[]>;

  getById(id: number, language?: Locale): Promise<Product | null>;

  getBySlug(slug: string, language?: Locale): Promise<Product | null>;

  getFeaturedProducts(limit?: number, language?: Locale): Promise<Product[]>;

  searchProducts(query: string, language?: Locale): Promise<Product[]>;

  getByCategory(categoryId: number, language?: Locale): Promise<Product[]>;

  getFilteredProducts(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }>;
}
