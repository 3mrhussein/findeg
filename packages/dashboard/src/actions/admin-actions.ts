"use server";

/**
 * Dashboard Admin Actions Proxy
 *
 * Centralized export for all admin server actions.
 * Prioritizes new data layer actions (clean, no @ imports) and falls back
 * to backend actions for actions not yet migrated.
 */

// Data layer actions (preferred - pure Next.js, proper cache invalidation)
import {
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
} from "@data/products/actions";

import {
  createCategoryAction as createCategoryData,
  updateCategoryAction as updateCategoryData,
  deleteCategoryAction as deleteCategoryData,
} from "@data/categories/actions";

import {
  updateOrderStatusAction as updateOrderStatusData,
  updateOrderPaymentStatusAction as updateOrderPaymentStatusData,
} from "@data/orders/actions";

// Backend actions (fallback for actions not yet migrated)
import {
  setProductStatusAction,
  deactivateVariantAction,
  generateVariantsAction,
  rebuildVariantKeysAction,
  upsertVariantUoMsAction,
  upsertVariantImagesAction,
  adminValidateProductImportAction,
  adminProcessProductImportAction,
  checkSkuAction,
  checkSlugAction,
  checkSkuPrefixAction,
} from "@features/administration/application/actions/admin-product-actions";

import {
  adminCreateTagAction,
  adminUpdateTagAction,
  adminDeleteTagAction,
  adminBulkUpdateTagsStatusAction,
  adminBulkDeleteTagsAction,
  adminToggleTagStatusAction,
  adminGetTagProductCountAction,
  adminGetDistinctTagGroupsAction,
} from "@features/administration/application/actions/admin-tag-actions";

import {
  adminCreateCollectionAction,
  adminUpdateCollectionAction,
  adminDeleteCollectionAction,
  adminReorderCollectionsAction,
} from "@features/administration/application/actions/admin-collection-actions";

import {
  updateStockAction as adminUpdateStockAction,
  bulkUpdateStockAction as adminBulkUpdateStockAction,
} from "@features/administration/application/actions/inventory";

import {
  moveCategoryUpAction,
  moveCategoryDownAction,
  reorderCategoriesAction,
  checkCategorySlugAvailableAction,
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  toggleBrandStatusAction,
} from "./catalog-actions";

import { logoutAction as adminLogoutAction } from "./auth-actions";

// ─── Product Management ────────────────────────────────────────────────────────

// Data layer exports
export const createProductAction = createProduct;
export const updateProductAction = updateProduct;
export const deleteProductAction = deleteProduct;
export const importProductsAction = importProducts;

// Backend exports
export {
  setProductStatusAction,
  deactivateVariantAction,
  generateVariantsAction,
  rebuildVariantKeysAction,
  upsertVariantUoMsAction,
  upsertVariantImagesAction,
};

export const validateProductImportAction = adminValidateProductImportAction;
export const processProductImportAction = adminProcessProductImportAction;
export const checkSkuAvailableAction = checkSkuAction;
export const checkSlugAvailableAction = checkSlugAction;
export const checkSkuPrefixAvailableAction = checkSkuPrefixAction;

// ─── Category Management ────────────────────────────────────────────────────────

// Data layer exports
export const createCategoryAction = createCategoryData;
export const updateCategoryAction = updateCategoryData;
export const deleteCategoryAction = deleteCategoryData;

// Backend exports
export {
  moveCategoryUpAction,
  moveCategoryDownAction,
  reorderCategoriesAction,
  checkCategorySlugAvailableAction,
};

// ─── Brand Management ───────────────────────────────────────────────────────────

export { createBrandAction, updateBrandAction, deleteBrandAction, toggleBrandStatusAction };

// ─── Order Management ───────────────────────────────────────────────────────────

// Data layer exports
export const updateOrderStatusAction = updateOrderStatusData;
export const updateOrderPaymentStatusAction = updateOrderPaymentStatusData;

// ─── Tag Management ────────────────────────────────────────────────────────────

export const createTagAction = adminCreateTagAction;
export const updateTagAction = adminUpdateTagAction;
export const deleteTagAction = adminDeleteTagAction;
export const bulkUpdateTagsStatusAction = adminBulkUpdateTagsStatusAction;
export const bulkDeleteTagsAction = adminBulkDeleteTagsAction;
export const toggleTagStatusAction = adminToggleTagStatusAction;
export const getTagProductCountAction = adminGetTagProductCountAction;
export const getDistinctTagGroupsAction = adminGetDistinctTagGroupsAction;

// ─── Collection Management ────────────────────────────────────────────────────────

export const createCollectionAction = adminCreateCollectionAction;
export const updateCollectionAction = adminUpdateCollectionAction;
export const deleteCollectionAction = adminDeleteCollectionAction;
export const reorderCollectionsAction = adminReorderCollectionsAction;

// ─── Inventory Management ───────────────────────────────────────────────────────

export const updateStockAction = adminUpdateStockAction;
export const bulkUpdateStockAction = adminBulkUpdateStockAction;

// ─── Authentication ────────────────────────────────────────────────────────────

export const logoutAction = adminLogoutAction;

// ─── Logging (Stubbed) ───────────────────────────────────────────────────────

/**
 * Log request action - stubbed implementation
 * Backend version uses ServiceContainer which can't be exported from build
 * TODO: Implement using repository pattern or service factory
 */
export async function logRequestAction(data: any) {
  console.log("[dashboard] logRequestAction (stubbed):", data);
}
