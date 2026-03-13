import { ID, Slug } from "@/features/core/domain/types/common";
import type { Locale } from "@/features/core/domain/value-objects";
import type { Category } from "@/features/catalog/domain/entities/Category";
import type { CategoryInput } from "@/features/administration/domain/types";

/**
 * Category Repository Interface
 *
 * Defines the contract for hierarchical category data access.
 */
export interface ICategoryRepository {
  getById(id: ID, language?: Locale): Promise<Category | null>;

  getAll(language?: Locale): Promise<Category[]>;

  getBySlug(slug: Slug, language?: Locale): Promise<Category | null>;

  getTree(language?: Locale): Promise<Category[]>;

  getRoots(language?: Locale): Promise<Category[]>;

  getChildren(parentId: ID, language?: Locale): Promise<Category[]>;

  getDescendants(categoryId: ID, language?: Locale): Promise<Category[]>;

  /**
   * Retrieves a category by its full hierarchy path (e.g., "electronics/phones").
   */
  getByPath(path: string, language?: Locale): Promise<Category | null>;

  create(input: CategoryInput): Promise<Category>;

  update(id: ID, input: CategoryInput): Promise<Category>;

  reorder(items: { id: ID; sortOrder: number }[]): Promise<void>;

  /**
   * Removes a category (typically restricted if it has products).
   */
  delete(id: ID): Promise<void>;

  count(): Promise<number>;
}
