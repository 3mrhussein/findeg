/**
 * Domain Entity: Category
 *
 * Represents a product category with hierarchical structure.
 * Supports nested categories via parentId and materialized path.
 */

/**
 * Category Domain Interface
 *
 * @property path - Materialized path for efficient tree queries (e.g., "/1/3/7")
 * @property depth - Nesting level (0 = root)
 * @property sortOrder - Display order among sibling categories
 * @property children - Nested child categories (populated in tree queries)
 */
export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: number;
  /** Materialized path (e.g., "/1/3/7") */
  path?: string;
  /** Nesting depth: 0 = root */
  depth?: number;
  /** Display order among siblings */
  sortOrder?: number;
  /** Whether this category is visible */
  isActive?: boolean;
  /** Nested child categories (populated in tree queries) */
  children?: Category[];
}
