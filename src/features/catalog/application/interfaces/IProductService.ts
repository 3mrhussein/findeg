/**
 * Product Service Interface
 *
 * Defines read-only operations for the shop-facing product catalog.
 * Separate from IAdminProductService which includes CRUD operations.
 */

import { Product } from "@/features/catalog/domain/entities/Product";
import { CustomerGroup, UomCode } from "@/features/core/domain/types/common";
import type { CurrencyCode, Locale } from "@/features/core/domain/value-objects";
import { VariantSellOption } from "./IProductRepository";

export interface IProductService {
  /**
   * Retrieves all products, optionally localized to a specific language.
   *
   * @param language - The ISO language code (e.g., 'en', 'ar').
   * @returns A list of products.
   */
  getAll(language?: Locale): Promise<Product[]>;

  /**
   * Retrieves a single product by its unique identifier.
   *
   * @param id - The product ID.
   * @param language - Optional language for localized content.
   * @returns The product if found, null otherwise.
   */
  getById(id: number, language?: Locale): Promise<Product | null>;

  /**
   * Retrieves a specific number of featured products for promotional displays.
   *
   * @param limit - Maximum number of products to return.
   * @param language - Optional language for localized content.
   * @returns A list of featured products.
   */
  getFeaturedProducts(limit?: number, language?: Locale): Promise<Product[]>;

  /**
   * Searches the catalog for products matching a text query.
   *
   * @param query - The search term.
   * @param language - Optional language for localized content.
   * @returns A list of matching products.
   */
  searchProducts(query: string, language?: Locale): Promise<Product[]>;

  /**
   * Retrieves all products in a category subtree (category + descendants).
   *
   * @param categoryId - The unique ID of the category.
   * @param language - Optional language for localized content.
   * @returns A list of products in the category subtree.
   */
  getByCategory(categoryId: number, language?: Locale): Promise<Product[]>;

  /**
   * Retrieves sell options (UoM and optional pricing) for a specific variant.
   */
  getVariantSellOptions(
    productId: number,
    variantKey: string,
    customerGroup?: CustomerGroup,
  ): Promise<VariantSellOption[]>;

  /**
   * Resolves a concrete unit price for a variant/UoM/customer group tuple.
   */
  quoteVariantUnitPrice(
    productId: number,
    variantKey: string,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<{ unitPrice: number; currency: CurrencyCode; isSellable: boolean } | null>;
}
