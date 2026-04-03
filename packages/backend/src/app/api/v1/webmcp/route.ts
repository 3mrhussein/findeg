import { NextRequest, NextResponse } from "next/server";
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  toggleBrandStatusAction,
} from "@/features/catalog/application/actions/brand";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  moveCategoryUpAction,
  moveCategoryDownAction,
  reorderCategoriesAction,
  checkSlugAvailableAction,
} from "@/features/catalog/application/actions/category";
import {
  adminCreateCollectionAction,
  adminUpdateCollectionAction,
  adminDeleteCollectionAction,
  adminReorderCollectionsAction,
} from "@/features/administration/application/actions/admin-collection-actions";
import {
  adminCreateTagAction,
  adminUpdateTagAction,
  adminDeleteTagAction,
  adminBulkUpdateTagsStatusAction,
  adminBulkDeleteTagsAction,
} from "@/features/administration/application/actions/admin-tag-actions";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  setProductStatusAction,
} from "@/features/administration/application/actions/admin-product-actions";
import {
  adminUpdateOrderStatusAction,
  adminUpdateOrderPaymentStatusAction,
} from "@/features/administration/application/actions/admin-order-actions";
import {
  updateStockAction,
  bulkUpdateStockAction,
} from "@/features/administration/application/actions/inventory";

/**
 * WebMCP Dispatch Tool Route
 *
 * This route acts as a central execution point for tools registered via navigator.modelContext.
 * It maps tool names to their corresponding server actions.
 */
export async function POST(req: NextRequest) {
  try {
    const { tool, params } = await req.json();

    if (!tool) {
      return NextResponse.json({ success: false, error: "TOOL_NAME_REQUIRED" }, { status: 400 });
    }

    let result: any = { success: false, error: "UNKNOWN_TOOL" };

    switch (tool) {
      // --- Brands ---
      case "findeg_create_brand":
        result = await createBrandAction(params);
        break;
      case "findeg_update_brand":
        result = await updateBrandAction(params.id, params.input);
        break;
      case "findeg_delete_brand":
        result = await deleteBrandAction(params.id);
        break;
      case "findeg_toggle_brand_status":
        result = await toggleBrandStatusAction(params.id);
        break;

      // --- Categories ---
      case "findeg_create_category": {
        // Map WebMCP flat params to CategoryInput translations array
        const categoryInput = {
          slug: params.slug,
          parentId: params.parentId,
          isActive: params.isActive ?? true,
          translations: [
            { language: "en", name: params.nameEn, description: params.descriptionEn },
            { language: "ar", name: params.nameAr, description: params.descriptionAr },
          ],
        };
        result = await createCategoryAction(categoryInput as any);
        break;
      }
      case "findeg_update_category":
        result = await updateCategoryAction(params.id, params.input);
        break;
      case "findeg_delete_category":
        result = await deleteCategoryAction(params.id);
        break;
      case "findeg_move_category_up":
        result = await moveCategoryUpAction(params.id);
        break;
      case "findeg_move_category_down":
        result = await moveCategoryDownAction(params.id);
        break;
      case "findeg_reorder_categories":
        result = await reorderCategoriesAction(params.items);
        break;
      case "findeg_check_category_slug":
        result = await checkSlugAvailableAction(params.slug, params.excludeId);
        break;

      // --- Collections ---
      case "findeg_create_collection":
        result = await adminCreateCollectionAction(params);
        break;
      case "findeg_update_collection":
        result = await adminUpdateCollectionAction(params.id, params.input);
        break;
      case "findeg_delete_collection":
        result = await adminDeleteCollectionAction(params.id);
        break;
      case "findeg_reorder_collections":
        result = await adminReorderCollectionsAction(params.items);
        break;

      // --- Tags ---
      case "findeg_create_tag":
        result = await adminCreateTagAction(params);
        break;
      case "findeg_update_tag":
        result = await adminUpdateTagAction(params.id, params.input);
        break;
      case "findeg_delete_tag":
        result = await adminDeleteTagAction(params.id);
        break;
      case "findeg_bulk_update_tags_status":
        result = await adminBulkUpdateTagsStatusAction(params.ids, params.isActive);
        break;
      case "findeg_bulk_delete_tags":
        result = await adminBulkDeleteTagsAction(params.ids);
        break;

      // --- Products ---
      case "findeg_create_product":
        result = await createProductAction(params);
        break;
      case "findeg_update_product":
        result = await updateProductAction(params.id, params.input);
        break;
      case "findeg_delete_product":
        result = await deleteProductAction(params.id);
        break;
      case "findeg_set_product_status":
        result = await setProductStatusAction(params.id, params.isActive);
        break;

      // --- Inventory ---
      case "findeg_update_stock":
        result = await updateStockAction(params);
        break;
      case "findeg_bulk_update_stock":
        result = await bulkUpdateStockAction(params.updates);
        break;

      // --- Orders ---
      case "findeg_update_order_status":
        result = await adminUpdateOrderStatusAction(params.id, params.update);
        break;
      case "findeg_update_order_payment_status":
        result = await adminUpdateOrderPaymentStatusAction(params.id, params.status);
        break;

      default:
        return NextResponse.json({ success: false, error: "UNSUPPORTED_TOOL" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[WebMCP API Error]:", error);
    return NextResponse.json(
      { success: false, error: "EXECUTION_ERROR", message: error.message },
      { status: 500 },
    );
  }
}
