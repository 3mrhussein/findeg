/**
 * Category Service
 */

import { Category } from "@/domain/entities/Category";
import { ICategoryRepository } from "../repositories/ICategoryRepository";
import { ICategoryService } from "./interfaces/ICategoryService";

/**
 * Category Service
 *
 * Handles category retrieval and navigation for the public shop.
 * Provides access to hierarchical category structure.
 */
export class CategoryService implements ICategoryService {
  /**
   * Creates an instance of CategoryService
   *
   * @param categoryRepository - Category data access layer
   */
  constructor(private categoryRepository: ICategoryRepository) {}

  /**
   * Retrieves a category by ID
   *
   * @param id - Category ID
   * @param language - Optional language code (default: "en")
   * @returns Category entity or null if not found
   */
  async getById(id: number, language?: string): Promise<Category | null> {
    return this.categoryRepository.getById(id, language);
  }

  /**
   * Retrieves all categories
   *
   * @param language - Optional language code (default: "en")
   * @returns Array of all categories
   */
  async getAll(language?: string): Promise<Category[]> {
    return this.categoryRepository.getAll(language);
  }

  /**
   * Retrieves a category by slug
   *
   * @param slug - Category URL slug
   * @param language - Optional language code (default: "en")
   * @returns Category entity or null if not found
   */
  async getBySlug(slug: string, language?: string): Promise<Category | null> {
    return this.categoryRepository.getBySlug(slug, language);
  }
}
