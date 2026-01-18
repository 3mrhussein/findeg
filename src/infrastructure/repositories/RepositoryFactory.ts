/**
 * Infrastructure Layer: Repository Factory
 *
 * This factory creates repository instances based on environment configuration.
 * It allows switching between mock and database repositories without changing
 * application code.
 *
 * Usage:
 * ```typescript
 * const productRepo = RepositoryFactory.createProductRepository();
 * ```
 */

import { MockProductRepository } from "./MockProductRepository";
import { DatabaseProductRepository } from "./DatabaseProductRepository";
import { MockCategoryRepository } from "./MockCategoryRepository";
import type { IProductRepository } from "@/application/repositories/IProductRepository";
import type { ICategoryRepository } from "@/application/repositories/ICategoryRepository";

/**
 * Repository Factory
 *
 * Creates repository instances based on environment variables.
 *
 * Environment Variables:
 * - USE_DATABASE: Set to 'true' to use database repositories, otherwise uses mock
 * - DATABASE_URL: Required if USE_DATABASE is true
 */
export class RepositoryFactory {
  /**
   * Check if database should be used
   *
   * Uses USE_DATABASE environment variable.
   * Defaults to false (use mock) for development.
   */
  private static shouldUseDatabase(): boolean {
    const useDatabase = process.env.USE_DATABASE;
    return useDatabase === "true" || useDatabase === "1";
  }

  /**
   * Create product repository
   *
   * Returns either DatabaseProductRepository or MockProductRepository
   * based on environment configuration.
   */
  static createProductRepository(): IProductRepository {
    if (this.shouldUseDatabase()) {
      // Validate database URL is set
      if (!process.env.DATABASE_URL) {
        console.warn(
          "USE_DATABASE is true but DATABASE_URL is not set. " +
            "Falling back to MockProductRepository.",
        );
        return new MockProductRepository();
      }

      try {
        const repo = new DatabaseProductRepository();
        // Set default language from environment if available
        const language = process.env.DEFAULT_LANGUAGE || "en";
        repo.setLanguage(language);
        return repo;
      } catch (error) {
        console.error("Failed to create DatabaseProductRepository:", error);
        console.warn("Falling back to MockProductRepository.");
        return new MockProductRepository();
      }
    }

    // Default to mock repository for development
    return new MockProductRepository();
  }

  /**
   * Create category repository
   */
  static createCategoryRepository(): ICategoryRepository {
    if (this.shouldUseDatabase()) {
      // return new DatabaseCategoryRepository();
      return new MockCategoryRepository();
    }
    return new MockCategoryRepository();
  }

  /**
   * Create order repository (when implemented)
   */
  // static createOrderRepository(): IOrderRepository {
  //   if (this.shouldUseDatabase()) {
  //     return new DatabaseOrderRepository();
  //   }
  //   return new MockOrderRepository();
  // }
}
