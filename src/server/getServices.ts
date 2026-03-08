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
    categories: container.categoryService,
    cart: container.cartService,
    collections: container.collectionService,
    search: container.searchService,
    media: container.mediaService,
    email: container.emailService,

    // Admin services
    auth: container.authService,
    adminProduct: container.adminProductService,
    adminCategory: container.adminCategoryService,
    adminDashboard: container.adminDashboardService,
    adminBrand: container.adminBrandService,
    adminOrder: container.adminOrderService,
    adminInventory: container.adminInventoryService,
    schoolLists: container.schoolListService,
    schoolAccess: container.schoolAccessService,
    schoolDirectory: container.schoolDirectoryService,
    parentList: container.parentListService,
    logger: container.loggerService,
    adminUser: container.adminUserService,
    adminRole: container.adminRoleService,
    auditLog: container.auditLogService,
    reviews: container.reviewService,
    notifications: container.notificationService,
    adminSearchAnalytics: container.adminSearchAnalyticsService,

    // Direct repository access (for cases not covered by services)
    repositories: {
      products: container.productRepository,
      variants: container.variantRepository,
      categories: container.categoryRepository,
      brands: container.brandRepository,
      users: container.userRepository,
      orders: container.orderRepository,
      reviews: container.reviewRepository,
    },
  };
}
