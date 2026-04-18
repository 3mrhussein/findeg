import { ID, Slug } from "@backend/features/core/domain/types/common";
import type { ICategoryRepository } from "../interfaces/ICategoryRepository";
import type { ICategoryService } from "@backend/features/catalog/application/interfaces/ICategoryService";
import type { Category } from "@backend/features/catalog/domain/entities/Category";
import type { Locale } from "@backend/features/core/domain/value-objects";

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getById(id: ID, language?: Locale): Promise<Category | null> {
    return this.categoryRepository.getById(id, language);
  }

  async getAll(language?: Locale): Promise<Category[]> {
    return this.categoryRepository.getAll(language);
  }

  async getBySlug(slug: Slug, language?: Locale): Promise<Category | null> {
    return this.categoryRepository.getBySlug(slug, language);
  }

  async getTree(language?: Locale): Promise<Category[]> {
    return this.categoryRepository.getTree(language);
  }
}
