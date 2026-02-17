import { ID, Slug } from "@/features/core/domain/types/common";
import type { Category } from "@/features/catalog/domain/entities/Category";
import type { CategoryInput } from "@/features/administration/domain/types";

/**
 * Category Repository Interface
 *
 * Defines the contract for hierarchical category data access.
 */
export interface ICategoryRepository {
  /**
   * Retrieves a single category by ID.
   */
  getById(id: ID, language?: string): Promise<Category | null>;

  /**
   * Retrieves all categories.
   */
  getAll(language?: string): Promise<Category[]>;

  /**
   * Retrieves a category by its unique URL slug.
   */
  getBySlug(slug: Slug, language?: string): Promise<Category | null>;

  /**
   * Retrieves the entire category hierarchy as a tree.
   */
  getTree(language?: string): Promise<Category[]>;

  /**
   * Retrieves only the top-level (root) categories.
   */
  getRoots(language?: string): Promise<Category[]>;

  /**
   * Retrieves immediate child categories for a given parent.
   */
  getChildren(parentId: ID, language?: string): Promise<Category[]>;

  /**
   * Retrieves all nested categories (children, grandchildren, etc.).
   */
  getDescendants(categoryId: ID, language?: string): Promise<Category[]>;

  /**
   * Retrieves a category by its full hierarchy path (e.g., "electronics/phones").
   */
  getByPath(path: string, language?: string): Promise<Category | null>;

  /**
   * Persists a new category.
   */
  create(input: CategoryInput): Promise<Category>;

  /**
   * Updates an existing category and its translations.
   */
  update(id: ID, input: CategoryInput): Promise<Category>;

  /**
   * Updates the display sequence of multiple categories.
   */
  reorder(items: { id: ID; sortOrder: number }[]): Promise<void>;

  /**
   * Removes a category (typically restricted if it has products).
   */
  delete(id: ID): Promise<void>;

  /**
   * Counts total categories in the system.
   */
  count(): Promise<number>;
}
