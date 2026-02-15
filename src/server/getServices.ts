import { container } from "@/features/core/infrastructure/di/ServiceContainer";

/**
 * Server-side Service Access
 *
 * Provides a clean way for Server Components and Server Actions
 * to access the application services.
 *
 * IMPORTANT: This returns SERVICES (not raw repositories).
 * Services encapsulate business logic and validation.
 * Only use repository access directly when you need
 * operations not covered by the service interface.
 */
export function getServices() {
  return {
    // Shop-facing services
    products: container.productService,
    productService: container.productService,
    categories: container.categoryService,
    categoryService: container.categoryService,
    cart: container.cartService,
    cartService: container.cartService,
    media: container.mediaService,
    mediaService: container.mediaService,

    // Admin services
    auth: container.authService,
    authService: container.authService,
    adminProduct: container.adminProductService,
    adminCategory: container.adminCategoryService,
    adminDashboard: container.adminDashboardService,
    adminBrand: container.adminBrandService,
    adminOrder: container.adminOrderService,
    adminInventory: container.adminInventoryService,
    logger: container.loggerService,
    loggerService: container.loggerService,

    // Direct repository access (for cases not covered by services)
    repositories: {
      products: container.productRepository,
      categories: container.categoryRepository,
      users: container.userRepository,
      orders: container.orderRepository,
      reviews: container.reviewRepository,
    },
  };
}
