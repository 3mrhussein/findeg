import { container } from "@/infrastructure/di/ServiceContainer";

/**
 * Server-side Service Access
 * 
 * This provides a clean way for Server Components to access 
 * the application services and repositories.
 */
export function getServices() {
  return {
    products: container.productRepository,
    categories: container.categoryRepository,
    users: container.userRepository,
    orders: container.orderRepository,
    reviews: container.reviewRepository,
  };
}
