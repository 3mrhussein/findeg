/**
 * Category Service
 */

import {
  ICategoryRepository,
  CategoryEntity,
} from "../repositories/ICategoryRepository";

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getAll(language?: string): Promise<CategoryEntity[]> {
    return this.categoryRepository.getAll(language);
  }

  async getById(id: number, language?: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.getById(id, language);
  }

  async getBySlug(
    slug: string,
    language?: string,
  ): Promise<CategoryEntity | null> {
    return this.categoryRepository.getBySlug(slug, language);
  }
}
