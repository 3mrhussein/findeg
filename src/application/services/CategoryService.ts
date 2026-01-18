/**
 * Category Service
 */

import { Category } from "@/domain/entities/Category";
import { ICategoryRepository } from "../repositories/ICategoryRepository";

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getById(id: number, language?: string): Promise<Category | null> {
    return this.categoryRepository.getById(id, language);
  }

  async getAll(language?: string): Promise<Category[]> {
    return this.categoryRepository.getAll(language);
  }

  async getBySlug(slug: string, language?: string): Promise<Category | null> {
    return this.categoryRepository.getBySlug(slug, language);
  }
}
