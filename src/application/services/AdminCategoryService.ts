/**
 * Admin Category Service Implementation
 *
 * Handles category CRUD operations for the admin dashboard.
 * Depends only on ICategoryRepository interface.
 */

import { IAdminCategoryService } from "./interfaces/IAdminCategoryService";
import { ICategoryRepository } from "../repositories/ICategoryRepository";
import { Category } from "@/domain/entities/Category";
import { AdminCategoryInput } from "@/domain/types/admin";

/**
 *
 */
export class AdminCategoryService implements IAdminCategoryService {
  /**
   *
   */
  constructor(private categoryRepository: ICategoryRepository) {}

  /**
   *
   */
  async getAll(language?: string): Promise<Category[]> {
    return this.categoryRepository.getAll(language);
  }

  /**
   *
   */
  async create(input: AdminCategoryInput): Promise<Category> {
    return this.categoryRepository.create(input);
  }

  /**
   *
   */
  async update(id: number, input: AdminCategoryInput): Promise<Category> {
    return this.categoryRepository.update(id, input);
  }

  /**
   *
   */
  async delete(id: number): Promise<void> {
    return this.categoryRepository.delete(id);
  }

  /**
   *
   */
  async count(): Promise<number> {
    return this.categoryRepository.count();
  }
}
