/**
 * Admin Category Service Interface
 *
 * Defines CRUD operations for category management in the admin dashboard.
 */

import { Category } from "@/features/catalog/domain/entities/Category";
import { CategoryInput } from "@/features/administration/domain/types";

export interface IAdminCategoryService {
  /**
   * Retrieves all categories for administrative listing.
   */
  getAll(language?: string): Promise<Category[]>;

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
}
