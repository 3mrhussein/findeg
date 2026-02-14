/**
 * Category Repository Interface
 */

import { Category } from "@/domain/entities/Category";
import { AdminCategoryInput } from "@/domain/types/admin";

export interface ICategoryRepository {
  getById(id: number, language?: string): Promise<Category | null>;
  getAll(language?: string): Promise<Category[]>;
  getBySlug(slug: string, language?: string): Promise<Category | null>;
  create(input: AdminCategoryInput): Promise<Category>;
  update(id: number, input: AdminCategoryInput): Promise<Category>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}
