'use server';

/**
 * Dashboard Admin Actions Registry
 *
 * Centralized exports for all administrative actions.
 * These actions call backend services directly and manage Next.js cache invalidation.
 */

// Product Actions
import {
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  setProductStatus,
  generateVariants,
  checkSkuAvailable,
  checkSlugAvailable,
} from '@data/products/actions';

export {
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  setProductStatus,
  generateVariants,
  checkSkuAvailable,
  checkSlugAvailable,
};

// Tag Actions
import {
  createTagAction,
  updateTagAction,
  deleteTagAction,
  bulkUpdateTagsStatusAction,
  bulkDeleteTagsAction,
  toggleTagStatusAction,
  getTagProductCountAction,
  getDistinctTagGroupsAction,
} from '@data/tags/actions';

export {
  createTagAction as createTag,
  updateTagAction as updateTag,
  deleteTagAction as deleteTag,
  bulkUpdateTagsStatusAction as bulkUpdateTagsStatus,
  bulkDeleteTagsAction as bulkDeleteTags,
  toggleTagStatusAction as toggleTagStatus,
  getTagProductCountAction as getTagProductCount,
  getDistinctTagGroupsAction as getDistinctTagGroups,
};

// Category Actions
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  moveCategoryUpAction,
  moveCategoryDownAction,
  checkCategorySlugAvailableAction,
} from '@data/categories/actions';

export {
  createCategoryAction as createCategory,
  updateCategoryAction as updateCategory,
  deleteCategoryAction as deleteCategory,
  reorderCategoriesAction as reorderCategories,
  moveCategoryUpAction as moveCategoryUp,
  moveCategoryDownAction as moveCategoryDown,
  checkCategorySlugAvailableAction as checkCategorySlugAvailable,
};

// Brand Actions
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  toggleBrandStatusAction,
} from '@data/brands/actions';

export {
  createBrandAction as createBrand,
  updateBrandAction as updateBrand,
  deleteBrandAction as deleteBrand,
  toggleBrandStatusAction as toggleBrandStatus,
};

// Collection Actions
import {
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
  reorderCollectionsAction,
} from '@data/collections/actions';

export {
  createCollectionAction as createCollection,
  updateCollectionAction as updateCollection,
  deleteCollectionAction as deleteCollection,
  reorderCollectionsAction as reorderCollections,
};

// Order Actions
import { updateOrderStatusAction, updateOrderPaymentStatusAction } from '@data/orders/actions';

export {
  updateOrderStatusAction as updateOrderStatus,
  updateOrderPaymentStatusAction as updateOrderPaymentStatus,
};

// Inventory Actions
import { updateStock, bulkUpdateStock } from '@data/inventory/actions';
export { updateStock, bulkUpdateStock };

// Authentication
import { logoutAction } from './auth-actions';
export { logoutAction as logout };

/**
 * Log request action - stubbed implementation
 */
export async function logRequestAction(data: any) {
  console.log('[dashboard] logRequestAction (stubbed):', data);
}
