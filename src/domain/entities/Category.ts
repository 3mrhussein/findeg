/**
 * Domain Entity: Category
 */

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: number;
}
