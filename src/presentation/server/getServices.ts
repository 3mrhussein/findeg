/**
 * Server-side Service Helpers
 *
 * This file provides easy access to services for Next.js Server Components.
 * Since Server Components run on the server, they can access the ServiceContainer directly.
 */

import { ServiceContainer } from "@/infrastructure/di/ServiceContainer";

/**
 * Get the product service
 */
export function getProductService() {
  return ServiceContainer.getInstance().getProductService();
}

/**
 * Get the cart service
 */
export function getCartService() {
  return ServiceContainer.getInstance().getCartService();
}

/**
 * Get the category service
 */
export function getCategoryService() {
  return ServiceContainer.getInstance().getCategoryService();
}
