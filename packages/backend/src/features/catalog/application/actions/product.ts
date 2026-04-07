/**
 * Pure TypeScript Product Actions
 *
 * Contains business logic only - no framework-specific calls.
 * App-layer (dashboard) handles cache revalidation after operations.
 */

import { container } from "@features/core/infrastructure/di/ServiceContainer";
import { ResourceNotFoundError, ValidationError } from "@features/core/domain/errors";
import { ProductInput } from "@features/administration/domain/types";
import type { ServiceResult } from "@features/core/application/types";
import type { Product } from "@features/catalog/domain/entities/Product";
import { getProductCachePaths, getProductCacheTags } from "@features/catalog/domain/cache";

/**
 * Pure product creation - no framework calls.
 *
 * Creates a new product and returns cache paths to revalidate.
 * Throws validation or business rule errors.
 * App-layer handles cache revalidation and redirects.
 */
export async function createProduct(
  input: ProductInput,
): Promise<ServiceResult<{ productId: number }>> {
  if (!input) {
    throw new ValidationError("input", "Product input is required");
  }

  const service = container.adminProductService;
  const product = await service.create(input);

  return {
    success: true,
    data: { productId: product.id },
    cachePaths: getProductCachePaths(product.id),
    cacheTags: getProductCacheTags(product.id),
  };
}

/**
 * Pure product update - no framework calls.
 *
 * Updates an existing product and returns cache paths to revalidate.
 * Throws validation, not found, or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<ServiceResult<{ productId: number }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Product", id);
  }

  if (!input) {
    throw new ValidationError("input", "Product input is required");
  }

  const service = container.adminProductService;
  const product = await service.update(id, input);

  return {
    success: true,
    data: { productId: product.id },
    cachePaths: getProductCachePaths(product.id),
    cacheTags: getProductCacheTags(product.id),
  };
}

/**
 * Pure product deletion - no framework calls.
 *
 * Deletes a product and returns cache paths to revalidate.
 * Throws not found or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function deleteProduct(
  id: number,
): Promise<ServiceResult<{ success: true }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Product", id);
  }

  const service = container.adminProductService;
  await service.delete(id);

  return {
    success: true,
    data: { success: true },
    cachePaths: getProductCachePaths(id),
    cacheTags: getProductCacheTags(id),
  };
}
