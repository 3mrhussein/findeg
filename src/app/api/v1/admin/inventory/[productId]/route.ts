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
import {
  InventoryUpdateBodySchema,
  InventoryUpdateSchema,
} from "@/features/administration/domain/types";

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
      const productId = parseInt(productIdParam, 10);
      const body = await request.json();

      const parseResult = InventoryUpdateBodySchema.safeParse(body);
      if (!parseResult.success) {
        const msg = parseResult.error.issues[0]?.message ?? "Invalid request";
        return apiError(msg, 400);
      }

      const update = InventoryUpdateSchema.parse({
        productId,
        ...parseResult.data,
      });

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
        quantity: update.quantity,
        lowStockThreshold: update.lowStockThreshold,
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
      const productId = parseInt(productIdParam, 10);
      const body = await request.json();

      const parseResult = InventoryUpdateBodySchema.safeParse(body);
      if (!parseResult.success) {
        const msg = parseResult.error.issues[0]?.message ?? "Invalid request";
        return apiError(msg, 400);
      }

      const update = InventoryUpdateSchema.parse({
        productId,
        ...parseResult.data,
      });

      const { adminInventory } = getServices();
      await adminInventory.updateStock(update);

      return apiResponse({
        message: "Stock updated successfully",
        productId,
        quantity: update.quantity,
      });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to update stock", 500);
    }
  });
}
