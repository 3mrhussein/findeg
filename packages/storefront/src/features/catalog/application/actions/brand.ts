"use server";

import { container } from "@features/core/infrastructure/di/ServiceContainer";
import { revalidatePath, revalidateTag } from "next/cache";
import { BrandInput } from "@features/administration/domain/types";
import { CACHE_TAGS } from "@features/core/domain/constants/cache-tags";
import { resolveErrorMessage } from "@features/core/domain/errors";

/**
 * Creates a new brand.
 *
 * @param input - The brand data payload.
 * @returns Success status or error message.
 */
export async function createBrandAction(input: BrandInput) {
  try {
    const service = container.adminBrandService;
    await service.create(input);
    revalidatePath("/admin/brands");
    revalidateTag(CACHE_TAGS.CATALOG_BRANDS, "max");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR") };
  }
}

/**
 * Updates an existing brand.
 *
 * @param id - The ID of the brand to update.
 * @param input - The updated brand fields.
 * @returns Success status or error message.
 */
export async function updateBrandAction(id: number, input: BrandInput) {
  try {
    const service = container.adminBrandService;
    await service.update(id, input);
    revalidatePath("/admin/brands");
    revalidateTag(CACHE_TAGS.CATALOG_BRANDS, "max");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR") };
  }
}

/**
 * Deletes a brand by its ID.
 *
 * @param id - The brand ID.
 * @returns Success status or error message.
 */
export async function deleteBrandAction(id: number) {
  try {
    const service = container.adminBrandService;
    await service.delete(id);
    revalidatePath("/admin/brands");
    revalidateTag(CACHE_TAGS.CATALOG_BRANDS, "max");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR") };
  }
}

/**
 * Toggles a brand's active status.
 */
export async function toggleBrandStatusAction(id: number) {
  try {
    const service = container.adminBrandService;
    await service.toggleBrandStatus(id);
    revalidatePath("/admin/brands");
    revalidateTag(CACHE_TAGS.CATALOG_BRANDS, "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR") };
  }
}
