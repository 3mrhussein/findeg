"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath, revalidateTag } from "next/cache";
import { ProductInput } from "@/features/administration/domain/types";
import { resolveErrorMessage } from "@/features/core/domain/errors/error-catalog";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import { isSystemAdmin } from "@/features/core/domain/auth/authorization";

/**
 * Creates a new product from the admin panel.
 * Uses the current session user ID for audit logging.
 *
 * @param input - The product creation data payload.
 * @returns Success status or error message.
 */
export async function adminCreateProductAction(input: ProductInput) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminProductService;
    const product = await service.create(input, Number(session.userId));

    revalidatePath("/admin/products");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");

    return { success: true, productId: product.id };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_CREATE_FAILED"),
    };
  }
}

/**
 * Updates an existing product from the admin panel.
 * Uses the current session user ID for audit logging.
 *
 * @param id - The ID of the product to update.
 * @param input - The updated product fields.
 * @returns Success status or error message.
 */
export async function adminUpdateProductAction(id: number, input: ProductInput) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminProductService;
    const product = await service.update(id, input, Number(session.userId));

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");

    return { success: true, productId: product.id };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

/**
 * Deletes a product by its ID from the admin panel.
 * Uses the current session user ID for audit logging.
 *
 * @param id - The product ID.
 * @returns Success status or error message.
 */
export async function adminDeleteProductAction(id: number) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminProductService;
    await service.delete(id, Number(session.userId));

    revalidatePath("/admin/products");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_DELETE_FAILED"),
    };
  }
}

/**
 * Archives a product from the admin panel.
 * (In this system, archiving is a targeted update setting isActive=false).
 *
 * @param id - The product ID.
 * @returns Success status or error message.
 */
export async function adminArchiveProductAction(id: number) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminProductService;
    // We fetch current values, set isActive false, and update.
    const existing = await service.getByIdWithTranslations(id);
    if (!existing) throw new Error("Product not found");

    const input = { ...existing, isActive: false };
    // Remove the 'id' field before updating since input format shouldn't have it at root
    // depending on the exact ProductInput shape.

    await service.update(id, input as ProductInput, Number(session.userId));

    revalidatePath("/admin/products");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

/**
 * Updates a product's active status from the admin panel.
 *
 * @param id - The product ID.
 * @param isActive - The new active status.
 * @returns Success status or error message.
 */
export async function adminSetProductStatusAction(id: number, isActive: boolean) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.adminProductService;
    // We fetch current values, set isActive, and update.
    const existing = await service.getByIdWithTranslations(id);
    if (!existing) throw new Error("Product not found");

    const input = { ...existing, isActive };
    // Remove the 'id' field before updating since input format shouldn't have it at root
    // depending on the exact ProductInput shape.

    await service.update(id, input as ProductInput, Number(session.userId));

    revalidatePath("/admin/products");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

/**
 * Validates product import rows
 */
export async function adminValidateProductImportAction(rows: Record<string, string>[]) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    // Using productImportService from container
    const service = container.productImportService;
    const result = await service.validateRows(rows);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Validation failed." };
  }
}

/**
 * Processes product import rows
 */
export async function adminProcessProductImportAction(rows: Record<string, string>[]) {
  try {
    const session = await container.authService.validateAdmin();
    const isAuthorized =
      isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!isAuthorized) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");

    const service = container.productImportService;
    const result = await service.processImport(rows, true, false, Number(session.userId));

    revalidatePath("/admin/products");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");

    return { success: true, result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Import failed." };
  }
}
