/**
 * Category Service Interface
 *
 * Defines read-only operations for the shop-facing category listing.
 * Separate from IAdminCategoryService which includes CRUD operations.
 */

import { Category } from "@/domain/entities/Category";

export interface ICategoryService {
  getById(id: number, language?: string): Promise<Category | null>;
  getAll(language?: string): Promise<Category[]>;
  getBySlug(slug: string, language?: string): Promise<Category | null>;
}
