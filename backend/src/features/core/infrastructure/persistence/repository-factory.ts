/**
 * Repository Factory Functions

 *
 * Provides singleton instances of repository implementations.
 * These factories ensure consistent repository usage across the application.
 *
 * Note: These functions are intended for server-side use only (Server Actions, API routes).
 * The framework layer (dashboard/storefront apps) is responsible for ensuring server-only execution.
 */

import { DrizzleUserRepository } from "@findeg/backend/features/identity/infrastructure/persistence/DrizzleUserRepository";
import { DrizzleProductRepository } from "@findeg/backend/features/catalog/infrastructure/persistence/DrizzleProductRepository";
import { DrizzleCategoryRepository } from "@findeg/backend/features/catalog/infrastructure/persistence/DrizzleCategoryRepository";
import { DrizzleOrderRepository } from "@findeg/backend/features/order/infrastructure/persistence/DrizzleOrderRepository";

import type { IUserRepository } from "@findeg/backend/features/identity/application/interfaces/IUserRepository";
import type { IProductRepository } from "@findeg/backend/features/catalog/application/interfaces/IProductRepository";
import type { ICategoryRepository } from "@findeg/backend/features/catalog/application/interfaces/ICategoryRepository";
import type { IOrderRepository } from "@findeg/backend/features/order/application/interfaces/IOrderRepository";

// Singleton instances (lazy initialization)
let userRepositoryInstance: IUserRepository | null = null;
let productRepositoryInstance: IProductRepository | null = null;
let categoryRepositoryInstance: ICategoryRepository | null = null;
let orderRepositoryInstance: IOrderRepository | null = null;

/**
 * Get UserRepository instance
 * Returns singleton DrizzleUserRepository
 */
export function getUserRepository(): IUserRepository {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new DrizzleUserRepository();
  }
  return userRepositoryInstance;
}

/**
 * Get ProductRepository instance
 * Returns singleton DrizzleProductRepository
 */
export function getProductRepository(): IProductRepository {
  if (!productRepositoryInstance) {
    productRepositoryInstance = new DrizzleProductRepository();
  }
  return productRepositoryInstance;
}

/**
 * Get CategoryRepository instance
 * Returns singleton DrizzleCategoryRepository
 */
export function getCategoryRepository(): ICategoryRepository {
  if (!categoryRepositoryInstance) {
    categoryRepositoryInstance = new DrizzleCategoryRepository();
  }
  return categoryRepositoryInstance;
}

/**
 * Get OrderRepository instance
 * Returns singleton DrizzleOrderRepository
 */
export function getOrderRepository(): IOrderRepository {
  if (!orderRepositoryInstance) {
    orderRepositoryInstance = new DrizzleOrderRepository();
  }
  return orderRepositoryInstance;
}

/**
 * Reset all repository instances (useful for testing)
 */
export function resetRepositories(): void {
  userRepositoryInstance = null;
  productRepositoryInstance = null;
  categoryRepositoryInstance = null;
  orderRepositoryInstance = null;
}
