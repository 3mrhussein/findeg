/**
 * Category Service Interface
 *
 * Defines read-only operations for the shop-facing category listing.
 * Separate from IAdminCategoryService which includes CRUD operations.
 */

import { Category } from "@features/catalog/domain/entities/Category";
import type { Locale } from "@features/core/domain/value-objects";

export interface ICategoryService {
  /**
   * Retrieves a single category by its unique identifier.
   *
   * @param id - The category ID.
   * @param language - Optional language for localized content.
   * @returns The category if found, null otherwise.
   */
  getById(id: number, language?: Locale): Promise<Category | null>;

  /**
   * Retrieves all categories, optionally localized.
   * Useful for main navigation and sidebars.
   *
   * @param language - Optional language for localized content.
   * @returns A list of categories.
   */
  getAll(language?: Locale): Promise<Category[]>;

  /**
   * Retrieves a category by its URL-friendly slug.
   *
   * @param slug - The category slug.
   * @param language - Optional language for localized content.
   * @returns The category if found, null otherwise.
   */
  getBySlug(slug: string, language?: Locale): Promise<Category | null>;

  /**
   * Retrieves the complete category hierarchy as a tree.
   *
   * @param language - Optional language for localized content.
   * @returns A list of root categories with nested children.
   */
  getTree(language?: Locale): Promise<Category[]>;
}
