/**
 * Category Repository Interface
 */

import { Category } from "@/domain/entities/Category";
import { AdminCategoryInput } from "@/domain/types/admin";

export interface ICategoryRepository {
  getById(id: number, language?: string): Promise<Category | null>;
  getAll(language?: string): Promise<Category[]>;
  getBySlug(slug: string, language?: string): Promise<Category | null>;

  // Tree & Hierarchy
  getTree(language?: string): Promise<Category[]>;
  getRoots(language?: string): Promise<Category[]>;
  getChildren(parentId: number, language?: string): Promise<Category[]>;
  getDescendants(categoryId: number, language?: string): Promise<Category[]>;
  getByPath(path: string, language?: string): Promise<Category | null>;

  // Admin Ops
  create(input: AdminCategoryInput): Promise<Category>;
  update(id: number, input: AdminCategoryInput): Promise<Category>;
  reorder(items: { id: number; sortOrder: number }[]): Promise<void>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}
