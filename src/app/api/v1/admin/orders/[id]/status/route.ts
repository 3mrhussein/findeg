/**
 * Admin Order Status Update Endpoint
 *
 * PUT /api/v1/admin/orders/[id]/status
 * Updates order status and tracking number.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../../_lib/api-response";
import { withAdmin } from "../../../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 *
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(request, async () => {
    try {
      const { id: idParam } = await params;
      const id = parseInt(idParam);
      const body = await request.json();
      const { status, trackingNumber, adminNotes } = body;

      if (!Number.isFinite(id)) {
        return apiError("Invalid order id", 400);
      }

      if (!status) {
        return apiError("Status is required", 400);
      }

      const { adminOrder } = getServices();
      const order = await adminOrder.updateStatus(id, {
        status,
        trackingNumber,
        adminNotes,
      });

      return apiResponse(order);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid status transition")) {
          return apiError(error.message, 400);
        }
        if (error.message.includes("not found")) {
          return apiError(error.message, 404);
        }
      }

      return apiError(
        error instanceof Error ? error.message : "Failed to update order status",
        500,
      );
    }
  });
}
