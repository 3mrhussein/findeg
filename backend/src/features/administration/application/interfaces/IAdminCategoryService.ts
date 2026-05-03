/**
 * Admin Category Service Interface
 *
 * Defines CRUD operations for category management in the admin dashboard.
 */

import { Category } from '@findeg/backend/features/catalog/domain/entities/Category';
import { CategoryInput } from '@findeg/backend/features/administration/domain/types';
import type { Locale } from '@findeg/backend/features/core/domain/value-objects';

export interface IAdminCategoryService {
  /**
   * Retrieves all categories for administrative listing.
   */
  getAll(language?: Locale): Promise<Category[]>;

  /**
   * Retrieves categories in a hierarchical tree structure.
   */
  getTree(language?: Locale): Promise<Category[]>;

  /**
   * Creates a new category with translations.
   */
  create(input: CategoryInput): Promise<Category>;

  /**
   * Updates an existing category and its translations.
   */
  update(id: number, input: CategoryInput): Promise<Category>;

  /**
   * Deletes a category.
   */
  delete(id: number): Promise<void>;

  /**
   * Counts total categories in the system.
   */
  count(): Promise<number>;

  /**
   * Checks if a slug is available.
   */
  checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean>;

  /**
   * Moves a category up among its siblings.
   */
  moveCategoryUp(id: number): Promise<void>;

  /**
   * Moves a category down among its siblings.
   */
  moveCategoryDown(id: number): Promise<void>;

  /**
   * Reorders multiple categories directly.
   */
  reorderCategories(items: { id: number; sortOrder: number }[]): Promise<void>;

  /**
   * Gets the number of products assigned to a category.
   */
  getCategoryProductCount(categoryId: number): Promise<number>;
}
