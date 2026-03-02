/**
 * Product Service Interface (SPU Level)
 *
 * Defines read-only operations for the shop-facing product catalog.
 * Variant-specific pricing (sell options, price quotes) has been moved to IVariantService.
 */

import { type Product } from "@/features/catalog/domain/entities/Product";
import type { Locale } from "@/features/core/domain/value-objects";
import { type ProductFilters } from "./IProductRepository";

export interface IProductService {
  /** Retrieves all products, optionally localized */
  getAll(language?: Locale): Promise<Product[]>;

  /** Retrieves a single product by ID with hydrated variants */
  getById(id: number, language?: Locale): Promise<Product | null>;

  /** Retrieves featured products for promotional displays */
  getFeaturedProducts(limit?: number, language?: Locale): Promise<Product[]>;

  /** Searches the catalog for products matching a text query */
  searchProducts(query: string, language?: Locale): Promise<Product[]>;

  /** Retrieves all products in a category subtree */
  getByCategory(categoryId: number, language?: Locale): Promise<Product[]>;

  /** Retrieves products using advanced filters */
  getFilteredProducts(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }>;
}
