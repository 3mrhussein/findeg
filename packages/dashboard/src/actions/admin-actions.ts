"use server";

/**
 * Dashboard App-Layer Admin Actions
 *
 * Wraps @/features/administration actions with a consistent API for legacy components.
 * This file serves as a central proxy to the framework-integrated feature actions.
 */

import {
  adminCreateTagAction,
  adminUpdateTagAction,
  adminDeleteTagAction,
  adminBulkUpdateTagsStatusAction,
  adminBulkDeleteTagsAction,
  adminToggleTagStatusAction,
  adminGetTagProductCountAction,
  adminGetDistinctTagGroupsAction,
} from "@/features/administration/application/actions/admin-tag-actions";

import {
  adminCreateCollectionAction,
  adminUpdateCollectionAction,
  adminDeleteCollectionAction,
  adminReorderCollectionsAction,
} from "@/features/administration/application/actions/admin-collection-actions";

import {
  adminUpdateOrderStatusAction,
  adminUpdateOrderPaymentStatusAction,
} from "@/features/administration/application/actions/admin-order-actions";

import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
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
} from "@/features/administration/application/actions/admin-product-actions";

import {
  updateStockAction as adminUpdateStockAction,
  bulkUpdateStockAction as adminBulkUpdateStockAction,
} from "@/features/administration/application/actions/inventory";

import { logRequestAction as adminLogRequestAction } from "@/features/core/application/actions/logging";

import {
  createCategoryAction as adminCreateCategoryAction,
  updateCategoryAction as adminUpdateCategoryAction,
  deleteCategoryAction as adminDeleteCategoryAction,
  moveCategoryUpAction as adminMoveCategoryUpAction,
  moveCategoryDownAction as adminMoveCategoryDownAction,
  reorderCategoriesAction as adminReorderCategoriesAction,
  checkCategorySlugAvailableAction as adminCheckCategorySlugAvailableAction,
} from "./catalog-actions";

import {
  createBrandAction as adminCreateBrandAction,
  updateBrandAction as adminUpdateBrandAction,
  deleteBrandAction as adminDeleteBrandAction,
  toggleBrandStatusAction as adminToggleBrandStatusAction,
} from "./catalog-actions";

import { logoutAction as adminLogoutAction } from "./auth-actions";

// ─── Tag Management Server Actions ────────────────────────────────────────────

export const createTagAction = adminCreateTagAction;
export const updateTagAction = adminUpdateTagAction;
export const deleteTagAction = adminDeleteTagAction;
export const bulkUpdateTagsStatusAction = adminBulkUpdateTagsStatusAction;
export const bulkDeleteTagsAction = adminBulkDeleteTagsAction;
export const toggleTagStatusAction = adminToggleTagStatusAction;
export const getTagProductCountAction = adminGetTagProductCountAction;
export const getDistinctTagGroupsAction = adminGetDistinctTagGroupsAction;

// ─── Collection Management Server Actions ─────────────────────────────────────

export const createCollectionAction = adminCreateCollectionAction;
export const updateCollectionAction = adminUpdateCollectionAction;
export const deleteCollectionAction = adminDeleteCollectionAction;
export const reorderCollectionsAction = adminReorderCollectionsAction;

// ─── Order Management Server Actions ──────────────────────────────────────────

export const updateOrderStatusAction = adminUpdateOrderStatusAction;
export const updateOrderPaymentStatusAction = adminUpdateOrderPaymentStatusAction;

// ─── Product Management Server Actions ────────────────────────────────────────

export {
  createProductAction,
  updateProductAction,
  deleteProductAction,
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

// ─── Category Management Server Actions ────────────────────────────────────────

export const createCategoryAction = adminCreateCategoryAction;
export const updateCategoryAction = adminUpdateCategoryAction;
export const deleteCategoryAction = adminDeleteCategoryAction;
export const moveCategoryUpAction = adminMoveCategoryUpAction;
export const moveCategoryDownAction = adminMoveCategoryDownAction;
export const reorderCategoriesAction = adminReorderCategoriesAction;
export const checkCategorySlugAvailableAction = adminCheckCategorySlugAvailableAction;

// ─── Brand Management Server Actions ───────────────────────────────────────────

export const createBrandAction = adminCreateBrandAction;
export const updateBrandAction = adminUpdateBrandAction;
export const deleteBrandAction = adminDeleteBrandAction;
export const toggleBrandStatusAction = adminToggleBrandStatusAction;

// ─── Inventory Management Server Actions ──────────────────────────────────────

export const updateStockAction = adminUpdateStockAction;
export const bulkUpdateStockAction = adminBulkUpdateStockAction;

// ─── Logging Server Actions ───────────────────────────────────────────────────

export const logRequestAction = adminLogRequestAction;

// ─── Authentication Server Actions ───────────────────────────────────────────

export const logoutAction = adminLogoutAction;
