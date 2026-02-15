/**
 * Admin Product Service Interface
 *
 * Defines CRUD operations for product management in the admin dashboard.
 * Separate from the read-only ProductService used by the shop frontend.
 */

import { Product } from "@/features/catalog/domain/entities/Product";
import { ProductInput } from "@/features/administration/domain/types";

export interface IAdminProductService {
  /**
   * Retrieves all products for administrative listing.
   */
  getAll(language?: string): Promise<Product[]>;

  /**
   * Retrieves a single product by ID.
   */
  getById(id: number, language?: string): Promise<Product | null>;

  /**
   * Retrieves a product including all its translations for editing.
   */
  getByIdWithTranslations(id: number): Promise<(ProductInput & { id: number }) | null>;

  /**
   * Creates a new product with translations.
   */
  create(input: ProductInput): Promise<Product>;

  /**
   * Updates an existing product and its translations.
   */
  update(id: number, input: ProductInput): Promise<Product>;

  /**
   * Permanently deletes a product.
   */
  delete(id: number): Promise<void>;

  /**
   * Counts total products in the system.
   */
  count(): Promise<number>;
}
