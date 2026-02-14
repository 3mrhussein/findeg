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
      return apiError(
        error instanceof Error ? error.message : "Failed to update order status",
        500,
      );
    }
  });
}
