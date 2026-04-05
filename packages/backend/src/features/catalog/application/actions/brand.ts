/**
 * Pure TypeScript Brand Actions
 *
 * Contains business logic only - no framework-specific calls.
 * App-layer (dashboard) handles cache revalidation after operations.
 */

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { ResourceNotFoundError, ValidationError } from "@/features/core/domain/errors";
import { BrandInput } from "@/features/administration/domain/types";
import type { ServiceResult } from "@/features/core/application/types";
import { getBrandCachePaths, getBrandCacheTags } from "@/features/catalog/domain/cache";

/**
 * Pure brand creation - no framework calls.
 *
 * Creates a new brand and returns cache paths to revalidate.
 * Throws validation or business rule errors.
 * App-layer handles cache revalidation and redirects.
 */
export async function createBrand(
  input: BrandInput,
): Promise<ServiceResult<{ success: true }>> {
  if (!input) {
    throw new ValidationError("input", "Brand input is required");
  }

  const service = container.adminBrandService;
  const brand = await service.create(input);

  return {
    success: true,
    data: { success: true },
    cachePaths: getBrandCachePaths(brand.id),
    cacheTags: getBrandCacheTags(brand.id),
  };
}

/**
 * Pure brand update - no framework calls.
 *
 * Updates an existing brand and returns cache paths to revalidate.
 * Throws validation, not found, or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function updateBrand(
  id: number,
  input: BrandInput,
): Promise<ServiceResult<{ success: true }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Brand", id);
  }

  if (!input) {
    throw new ValidationError("input", "Brand input is required");
  }

  const service = container.adminBrandService;
  await service.update(id, input);

  return {
    success: true,
    data: { success: true },
    cachePaths: getBrandCachePaths(id),
    cacheTags: getBrandCacheTags(id),
  };
}

/**
 * Pure brand deletion - no framework calls.
 *
 * Deletes a brand and returns cache paths to revalidate.
 * Throws not found or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function deleteBrand(
  id: number,
): Promise<ServiceResult<{ success: true }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Brand", id);
  }

  const service = container.adminBrandService;
  await service.delete(id);

  return {
    success: true,
    data: { success: true },
    cachePaths: getBrandCachePaths(id),
    cacheTags: getBrandCacheTags(id),
  };
}

/**
 * Pure brand status toggle - no framework calls.
 *
 * Toggles a brand's active status and returns cache paths to revalidate.
 * Throws not found or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function toggleBrandStatus(
  id: number,
): Promise<ServiceResult<{ success: true }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Brand", id);
  }

  const service = container.adminBrandService;
  await service.toggleBrandStatus(id);

  return {
    success: true,
    data: { success: true },
    cachePaths: getBrandCachePaths(id),
    cacheTags: getBrandCacheTags(id),
  };
}
