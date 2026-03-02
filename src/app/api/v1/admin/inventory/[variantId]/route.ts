/**
 * Admin Inventory Update Endpoint
 *
 * PATCH /api/v1/admin/inventory/[variantId]
 *   Absolute stock set: sets on-hand quantity to the given value.
 *
 * PUT /api/v1/admin/inventory/[variantId]
 *   Full inventory update: sets quantity + optional lowStockThreshold.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError, apiErrorByCode } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import {
  InventoryUpdateBodySchema,
  InventoryUpdateSchema,
} from "@/features/administration/domain/types";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 * Patches stock quantity for a specific variant (absolute set).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> },
) {
  return withAdmin(
    request,
    async () => {
      try {
        const { variantId: variantIdParam } = await params;
        const variantId = parseInt(variantIdParam, 10);
        if (!Number.isInteger(variantId) || variantId <= 0) {
          return apiErrorByCode("CATALOG_VARIANT_NOT_FOUND");
        }

        const body = await request.json();
        const parseResult = InventoryUpdateBodySchema.safeParse(body);
        if (!parseResult.success) {
          const msg = parseResult.error.issues[0]?.message ?? "Invalid request";
          return apiError(msg, 400);
        }

        const update = InventoryUpdateSchema.parse({
          variantId,
          ...parseResult.data,
        });

        const { adminInventory } = getServices();
        await adminInventory.updateStock(update);

        return apiResponse({
          message: "Inventory updated successfully",
          variantId,
          quantity: update.quantity,
          lowStockThreshold: update.lowStockThreshold,
        });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to update inventory", 500);
      }
    },
    PERMISSION_CODES.ADMIN_INVENTORY_WRITE,
  );
}

/**
 * Full inventory update for a specific variant (quantity + threshold).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> },
) {
  return withAdmin(
    request,
    async () => {
      try {
        const { variantId: variantIdParam } = await params;
        const variantId = parseInt(variantIdParam, 10);
        if (!Number.isInteger(variantId) || variantId <= 0) {
          return apiErrorByCode("CATALOG_VARIANT_NOT_FOUND");
        }

        const body = await request.json();
        const parseResult = InventoryUpdateBodySchema.safeParse(body);
        if (!parseResult.success) {
          const msg = parseResult.error.issues[0]?.message ?? "Invalid request";
          return apiError(msg, 400);
        }

        const update = InventoryUpdateSchema.parse({
          variantId,
          ...parseResult.data,
        });

        const { adminInventory } = getServices();
        await adminInventory.updateStock(update);

        return apiResponse({
          message: "Stock updated successfully",
          variantId,
          quantity: update.quantity,
          lowStockThreshold: update.lowStockThreshold,
        });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to update stock", 500);
      }
    },
    PERMISSION_CODES.ADMIN_INVENTORY_WRITE,
  );
}
