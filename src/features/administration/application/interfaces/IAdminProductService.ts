/**
 * Admin Product Service Interface
 *
 * Defines CRUD operations for product management in the admin dashboard.
 * Separate from the read-only ProductService used by the shop frontend.
 */

import { Product } from "@/features/catalog/domain/entities/Product";
import { ProductInput } from "@/features/administration/domain/types";
import type { Locale } from "@/features/core/domain/value-objects";

export interface IAdminProductService {
  /**
   * Retrieves all products for administrative listing.
   */
  getAll(language?: Locale): Promise<Product[]>;

  /**
   * Retrieves a single product by ID.
   */
  getById(id: number, language?: Locale): Promise<Product | null>;

  /**
   * Retrieves a product including all its translations for editing.
   */
  getByIdWithTranslations(id: number): Promise<(ProductInput & { id: number }) | null>;

  /**
   * Creates a new product with translations.
   */
  create(input: ProductInput, adminUserId?: number): Promise<Product>;

  /**
   * Updates an existing product and its translations.
   */
  update(id: number, input: ProductInput, adminUserId?: number): Promise<Product>;

  /**
   * Permanently deletes a product.
   */
  delete(id: number, adminUserId?: number): Promise<void>;

  /**
   * Counts total products in the system.
   */
  count(): Promise<number>;
}
