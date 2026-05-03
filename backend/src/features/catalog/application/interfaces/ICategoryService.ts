/**
 * Category Service Interface
 *
 * Defines read-only operations for the shop-facing category listing.
 * Separate from IAdminCategoryService which includes CRUD operations.
 */

import { Category } from '@findeg/backend/features/catalog/domain/entities/Category';
import type { Locale } from '@findeg/backend/features/core/domain/value-objects';
import type { CategoryInput } from '@findeg/backend/features/administration/domain/types';

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

  create(input: CategoryInput): Promise<Category>;
  update(id: number, input: CategoryInput): Promise<Category>;
  delete(id: number): Promise<void>;
}
