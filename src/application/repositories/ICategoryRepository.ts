/**
 * Category Repository Interface
 */

export interface CategoryEntity {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: number;
}

export interface ICategoryRepository {
  getById(id: number, language?: string): Promise<CategoryEntity | null>;
  getAll(language?: string): Promise<CategoryEntity[]>;
  getBySlug(slug: string, language?: string): Promise<CategoryEntity | null>;
}
