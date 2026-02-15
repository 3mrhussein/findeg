/**
 * Product Service Interface
 *
 * Defines read-only operations for the shop-facing product catalog.
 * Separate from IAdminProductService which includes CRUD operations.
 */

import { Product } from "@/features/catalog/domain/entities/Product";

export interface IProductService {
  /**
   * Retrieves all products, optionally localized to a specific language.
   *
   * @param language - The ISO language code (e.g., 'en', 'ar').
   * @returns A list of products.
   */
  getAll(language?: string): Promise<Product[]>;

  /**
   * Retrieves a single product by its unique identifier.
   *
   * @param id - The product ID.
   * @param language - Optional language for localized content.
   * @returns The product if found, null otherwise.
   */
  getById(id: number, language?: string): Promise<Product | null>;

  /**
   * Retrieves a specific number of featured products for promotional displays.
   *
   * @param limit - Maximum number of products to return.
   * @param language - Optional language for localized content.
   * @returns A list of featured products.
   */
  getFeaturedProducts(limit?: number, language?: string): Promise<Product[]>;

  /**
   * Searches the catalog for products matching a text query.
   *
   * @param query - The search term.
   * @param language - Optional language for localized content.
   * @returns A list of matching products.
   */
  searchProducts(query: string, language?: string): Promise<Product[]>;

  /**
   * Retrieves all products belonging to a specific category.
   *
   * @param categoryId - The unique ID of the category.
   * @param language - Optional language for localized content.
   * @returns A list of products in the category.
   */
  getByCategory(categoryId: number, language?: string): Promise<Product[]>;
}
