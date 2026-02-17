import { ID, Slug } from "@/features/core/domain/types/common";
import type { ICategoryRepository } from "../interfaces/ICategoryRepository";
import type { ICategoryService } from "@/features/catalog/application/interfaces/ICategoryService";
import type { Category } from "@/features/catalog/domain/entities/Category";

/**
 * Category Service — Handles category retrieval for the public shop.
 */
export class CategoryService implements ICategoryService {
  /**
   * Creates an instance of CategoryService.
   *
   * @param categoryRepository - The repository for hierarchical category data access.
   */
  constructor(private categoryRepository: ICategoryRepository) {}

  /**
   * Retrieves a single category by its unique identifier.
   *
   * @param id - The category ID.
   * @param language - Optional language for localized content.
   * @returns The category if found, null otherwise.
   */
  async getById(id: ID, language?: string): Promise<Category | null> {
    return this.categoryRepository.getById(id, language);
  }

  /**
   * Retrieves all categories, optionally localized.
   *
   * @param language - Optional language for localized content.
   * @returns A list of categories.
   */
  async getAll(language?: string): Promise<Category[]> {
    return this.categoryRepository.getAll(language);
  }

  /**
   * Retrieves a category by its URL-friendly slug.
   *
   * @param slug - The unique category slug.
   * @param language - Optional language for localized content.
   * @returns The category if found, null otherwise.
   */
  async getBySlug(slug: Slug, language?: string): Promise<Category | null> {
    return this.categoryRepository.getBySlug(slug, language);
  }
}
