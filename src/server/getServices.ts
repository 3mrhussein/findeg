import { container } from "@/infrastructure/di/ServiceContainer";

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
    categories: container.categoryService,
    cart: container.cartService,

    // Admin services
    auth: container.authService,
    adminProduct: container.adminProductService,
    adminCategory: container.adminCategoryService,
    adminDashboard: container.adminDashboardService,

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
