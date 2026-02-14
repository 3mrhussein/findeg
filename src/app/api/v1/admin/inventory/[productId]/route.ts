/**
 * Admin Inventory Update Endpoint
 *
 * PUT /api/v1/admin/inventory/[productId]
 * Updates stock quantity for a single product.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 *
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  return withAdmin(request, async () => {
    try {
      const { productId: productIdParam } = await params;
      const productId = parseInt(productIdParam);
      const body = await request.json();

      // Validate body manually or use Zod if available
      if (typeof body.quantity !== "number") {
        return apiError("Quantity is required and must be a number", 400);
      }

      const { adminInventory } = getServices();

      await adminInventory.updateStock({
        productId,
        quantity: body.quantity,
        lowStockThreshold: body.lowStockThreshold,
      });

      // Fetch the updated inventory/product to return
      // Since updateStock returns void, we can return a success message or fetch details
      // For now, let's return a success message or the updated fields
      return apiResponse({
        message: "Inventory updated successfully",
        productId,
        quantity: body.quantity,
        lowStockThreshold: body.lowStockThreshold,
      });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to update inventory", 500);
    }
  });
}

/**
 *
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  return withAdmin(request, async () => {
    try {
      const { productId: productIdParam } = await params;
      const productId = parseInt(productIdParam);
      const body = await request.json();
      const { quantity } = body;

      if (quantity === undefined || quantity < 0) {
        return apiError("Valid quantity is required", 400);
      }

      const { adminInventory } = getServices();
      await adminInventory.updateStock({ productId, quantity });

      return apiResponse({ message: "Stock updated successfully", productId, quantity });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to update stock", 500);
    }
  });
}
