/**
 * Pure TypeScript Category Actions
 *
 * Contains business logic only - no framework-specific calls.
 * App-layer (dashboard) handles cache revalidation after operations.
 */

import { container } from "@backend/features/core/infrastructure/di/ServiceContainer";
import { ResourceNotFoundError, ValidationError } from "@backend/features/core/domain/errors";
import { CategoryInput } from "@backend/features/administration/domain/types";
import type { ServiceResult } from "@backend/features/core/application/types";
import { getCategoryCachePaths, getCategoryCacheTags } from "@backend/features/catalog/domain/cache";

/**
 * Pure category creation - no framework calls.
 *
 * Creates a new category and returns cache paths to revalidate.
 * Throws validation or business rule errors.
 * App-layer handles cache revalidation and redirects.
 */
export async function createCategory(
  input: CategoryInput,
): Promise<ServiceResult<{ success: true }>> {
  if (!input) {
    throw new ValidationError("input", "Category input is required");
  }

  const service = container.adminCategoryService;
  const category = await service.create(input);

  return {
    success: true,
    data: { success: true },
    cachePaths: getCategoryCachePaths(category.id),
    cacheTags: getCategoryCacheTags(category.id),
  };
}

/**
 * Pure category update - no framework calls.
 *
 * Updates an existing category and returns cache paths to revalidate.
 * Throws validation, not found, or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function updateCategory(
  id: number,
  input: CategoryInput,
): Promise<ServiceResult<{ success: true }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Category", id);
  }

  if (!input) {
    throw new ValidationError("input", "Category input is required");
  }

  const service = container.adminCategoryService;
  await service.update(id, input);

  return {
    success: true,
    data: { success: true },
    cachePaths: getCategoryCachePaths(id),
    cacheTags: getCategoryCacheTags(id),
  };
}

/**
 * Pure category deletion - no framework calls.
 *
 * Deletes a category and returns cache paths to revalidate.
 * Throws not found or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function deleteCategory(
  id: number,
): Promise<ServiceResult<{ success: true }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Category", id);
  }

  const service = container.adminCategoryService;
  await service.delete(id);

  return {
    success: true,
    data: { success: true },
    cachePaths: getCategoryCachePaths(id),
    cacheTags: getCategoryCacheTags(id),
  };
}

/**
 * Pure category move up - no framework calls.
 *
 * Moves a category up among its siblings and returns cache paths to revalidate.
 * Throws not found or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function moveCategoryUp(
  id: number,
): Promise<ServiceResult<{ success: true }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Category", id);
  }

  const service = container.adminCategoryService;
  await service.moveCategoryUp(id);

  return {
    success: true,
    data: { success: true },
    cachePaths: getCategoryCachePaths(id),
    cacheTags: getCategoryCacheTags(id),
  };
}

/**
 * Pure category move down - no framework calls.
 *
 * Moves a category down among its siblings and returns cache paths to revalidate.
 * Throws not found or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function moveCategoryDown(
  id: number,
): Promise<ServiceResult<{ success: true }>> {
  if (!id || id <= 0) {
    throw new ResourceNotFoundError("Category", id);
  }

  const service = container.adminCategoryService;
  await service.moveCategoryDown(id);

  return {
    success: true,
    data: { success: true },
    cachePaths: getCategoryCachePaths(id),
    cacheTags: getCategoryCacheTags(id),
  };
}

/**
 * Pure category reorder - no framework calls.
 *
 * Reorders an array of categories efficiently and returns cache paths to revalidate.
 * Throws validation or business rule errors.
 * App-layer handles cache revalidation.
 */
export async function reorderCategories(
  items: { id: number; sortOrder: number }[],
): Promise<ServiceResult<{ success: true }>> {
  if (!items || items.length === 0) {
    throw new ValidationError("items", "At least one category is required for reordering");
  }

  const service = container.adminCategoryService;
  await service.reorderCategories(items);

  return {
    success: true,
    data: { success: true },
    cachePaths: getCategoryCachePaths(),
    cacheTags: getCategoryCacheTags(),
  };
}

/**
 * Pure slug check - no framework calls.
 *
 * Checks if a category slug is available for use.
 * Returns availability status without side effects.
 */
export async function checkSlugAvailable(
  slug: string,
  excludeId?: number,
): Promise<ServiceResult<{ available: boolean }>> {
  const trimmedSlug = String(slug || "").trim();
  if (trimmedSlug.length === 0) {
    throw new ValidationError("slug", "Slug is required");
  }

  const service = container.adminCategoryService;
  const available = await service.checkSlugAvailable(trimmedSlug, excludeId);

  return {
    success: true,
    data: { available },
  };
}
