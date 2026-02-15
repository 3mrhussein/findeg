/**
 * Category Service Interface
 *
 * Defines read-only operations for the shop-facing category listing.
 * Separate from IAdminCategoryService which includes CRUD operations.
 */

import { Category } from "@/features/catalog/domain/entities/Category";

export interface ICategoryService {
  /**
   * Retrieves a single category by its unique identifier.
   *
   * @param id - The category ID.
   * @param language - Optional language for localized content.
   * @returns The category if found, null otherwise.
   */
  getById(id: number, language?: string): Promise<Category | null>;

  /**
   * Retrieves all categories, optionally localized.
   * Useful for main navigation and sidebars.
   *
   * @param language - Optional language for localized content.
   * @returns A list of categories.
   */
  getAll(language?: string): Promise<Category[]>;

  /**
   * Retrieves a category by its URL-friendly slug.
   *
   * @param slug - The category slug.
   * @param language - Optional language for localized content.
   * @returns The category if found, null otherwise.
   */
  getBySlug(slug: string, language?: string): Promise<Category | null>;
}
