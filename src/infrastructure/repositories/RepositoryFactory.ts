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
import { DrizzleProductRepository } from "./DrizzleProductRepository";
import { MockCategoryRepository } from "./MockCategoryRepository";
import { DrizzleCategoryRepository } from "./DrizzleCategoryRepository";
import { DrizzleOrderRepository } from "./DrizzleOrderRepository";
import { DrizzleBrandRepository } from "./DrizzleBrandRepository";
import { DrizzleAuditLogRepository } from "./DrizzleAuditLogRepository";

import type { IProductRepository } from "@/application/repositories/IProductRepository";
import type { ICategoryRepository } from "@/application/repositories/ICategoryRepository";
import type { IOrderRepository } from "@/application/repositories/IOrderRepository";
import type { IBrandRepository } from "@/application/repositories/IBrandRepository";
import type { IAuditLogRepository } from "@/application/repositories/IAuditLogRepository";

/**
 * Repository Factory
 */
export class RepositoryFactory {
  /**
   * Check if database should be used
   */
  private static shouldUseDatabase(): boolean {
    const useDatabase = process.env.USE_DATABASE;
    return useDatabase === "true" || useDatabase === "1";
  }

  /**
   *
   */
  static createProductRepository(): IProductRepository {
    if (this.shouldUseDatabase()) {
      return new DrizzleProductRepository();
    }
    return new MockProductRepository();
  }

  /**
   *
   */
  static createCategoryRepository(): ICategoryRepository {
    if (this.shouldUseDatabase()) {
      return new DrizzleCategoryRepository();
    }
    return new MockCategoryRepository();
  }

  /**
   *
   */
  static createOrderRepository(): IOrderRepository {
    // No mock implementation for orders yet
    return new DrizzleOrderRepository();
  }

  /**
   *
   */
  static createBrandRepository(): IBrandRepository {
    return new DrizzleBrandRepository();
  }

  /**
   *
   */
  static createAuditLogRepository(): IAuditLogRepository {
    return new DrizzleAuditLogRepository();
  }
}
