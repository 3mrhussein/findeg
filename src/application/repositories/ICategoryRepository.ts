/**
 * Category Repository Interface
 */

import { Category } from "@/domain/entities/Category";

export interface ICategoryRepository {
  getById(id: number, language?: string): Promise<Category | null>;
  getAll(language?: string): Promise<Category[]>;
  getBySlug(slug: string, language?: string): Promise<Category | null>;
}
