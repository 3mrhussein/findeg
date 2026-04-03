/**
 * Admin Bulk Inventory Update Endpoint
 *
 * PUT /api/v1/admin/inventory/bulk
 *
 * Accepts an array of InventoryUpdate objects (each with variantId + quantity).
 * Applies all updates sequentially via AdminInventoryService.bulkUpdateStock.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { InventoryUpdateSchema } from "@/features/administration/domain/types";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

const BulkUpdateBodySchema = z.object({
  updates: z.array(InventoryUpdateSchema).min(1, "At least one update is required"),
});

/**
 *
 */
export async function PUT(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const body = await request.json();
        const parseResult = BulkUpdateBodySchema.safeParse(body);
        if (!parseResult.success) {
          return apiError(
            parseResult.error.issues[0]?.message ?? "Invalid bulk update payload",
            400,
          );
        }

        const { updates } = parseResult.data;
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
