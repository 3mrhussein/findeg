import { ID, Slug } from "@features/core/domain/types/common";
import type { ICategoryRepository } from "../interfaces/ICategoryRepository";
import type { ICategoryService } from "@features/catalog/application/interfaces/ICategoryService";
import type { Category } from "@features/catalog/domain/entities/Category";
import type { Locale } from "@features/core/domain/value-objects";

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
}
