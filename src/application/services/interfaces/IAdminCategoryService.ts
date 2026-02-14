/**
 * Admin Category Service Interface
 *
 * Defines CRUD operations for category management in the admin dashboard.
 */

import { Category } from "@/domain/entities/Category";
import { AdminCategoryInput } from "@/domain/types/admin";

export interface IAdminCategoryService {
  getAll(language?: string): Promise<Category[]>;
  create(input: AdminCategoryInput): Promise<Category>;
  update(id: number, input: AdminCategoryInput): Promise<Category>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}
