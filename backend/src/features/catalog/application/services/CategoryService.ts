import { ID, Slug } from '@findeg/backend/features/core/domain/types/common';
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { ICategoryService } from '@findeg/backend/features/catalog/application/interfaces/ICategoryService';
import type { Category } from '@findeg/backend/features/catalog/domain/entities/Category';
import type { Locale } from '@findeg/backend/features/core/domain/value-objects';
import type { CategoryInput } from '@findeg/backend/features/administration/domain/types';

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

  async create(input: CategoryInput): Promise<Category> {
    return this.categoryRepository.create(input);
  }

  async update(id: ID, input: CategoryInput): Promise<Category> {
    return this.categoryRepository.update(id, input);
  }

  async delete(id: ID): Promise<void> {
    return this.categoryRepository.delete(id);
  }
}
