/**
 * Admin Bulk Inventory Update Endpoint
 *
 * PUT /api/v1/admin/inventory/bulk
 * Updates stock quantities for multiple products.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 *
 */
export async function PUT(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const body = await request.json();
        const { updates } = body;

        if (!Array.isArray(updates)) {
          return apiError("updates must be an array of { productId, quantity }", 400);
        }

        const { adminInventory } = getServices();
        await adminInventory.bulkUpdateStock(updates);

        return apiResponse({
          message: "Bulk stock update completed",
          updated: updates.length,
        });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to update stock", 500);
      }
    },
    PERMISSION_CODES.ADMIN_INVENTORY_WRITE,
  );
}
