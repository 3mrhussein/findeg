/**
 * Infrastructure Layer: Service Container
 *
 * This provides dependency injection for services.
 * It creates services with appropriate repository implementations
 * based on environment configuration.
 *
 * This follows the Singleton pattern to ensure services are reused
 * throughout the application lifecycle.
 *
 * Usage:
 * ```typescript
 * const container = ServiceContainer.getInstance();
 * const productService = container.getProductService();
 * ```
 */

import { RepositoryFactory } from "../repositories/RepositoryFactory";
import { ProductService } from "@/application/services/ProductService";
import { CartService } from "@/application/services/CartService";
import { CategoryService } from "@/application/services/CategoryService";

/**
 * Service Container
 *
 * Provides dependency injection for services.
 * Creates services with appropriate repository implementations.
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private productService: ProductService;
  private cartService: CartService;
  private categoryService: CategoryService;

  private constructor() {
    // Create repositories using factory
    const productRepository = RepositoryFactory.createProductRepository();
    const categoryRepository = RepositoryFactory.createCategoryRepository();

    // Create services with injected repositories
    this.productService = new ProductService(productRepository);
    this.cartService = new CartService();
    this.categoryService = new CategoryService(categoryRepository);
  }

  /**
   * Get singleton instance
   *
   * Creates the instance on first call, reuses it afterwards.
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Get product service
   *
   * Returns the ProductService instance with injected repository.
   */
  getProductService(): ProductService {
    return this.productService;
  }

  /**
   * Get cart service
   *
   * Returns the CartService instance.
   */
  getCartService(): CartService {
    return this.cartService;
  }

  /**
   * Get category service
   */
  getCategoryService(): CategoryService {
    return this.categoryService;
  }

  /**
   * Reset instance (useful for testing)
   *
   * @internal
   */
  static reset(): void {
    ServiceContainer.instance = undefined as any;
  }
}
