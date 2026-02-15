/**
 * Domain Entity: Category
 *
 * Represents a product category with hierarchical structure.
 */

/**
 * Category Domain Interface
 *
 * @property path - Materialized path for efficient tree queries (e.g., "/1/3/7")
 * @property depth - Nesting level (0 = root)
 * @property sortOrder - Display order among sibling categories
 */
export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: number;
  path?: string;
  depth?: number;
  sortOrder?: number;
  isActive?: boolean;
  children?: Category[];
}
