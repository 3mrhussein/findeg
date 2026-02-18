/**
 * Admin Order Payment Status Endpoint
 *
 * PATCH /api/v1/admin/orders/[id]/payment-status
 */

import { NextRequest } from "next/server";
import { apiError, apiResponse } from "../../../../_lib/api-response";
import { withAdmin } from "../../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { isPaymentStatus } from "@/features/order/application/utils/order-payment-status-transitions";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(request, async () => {
    try {
      const { id: idParam } = await params;
      const id = parseInt(idParam);
      const body = await request.json();
      const paymentStatus = body?.paymentStatus;

      if (!Number.isFinite(id)) {
        return apiError("Invalid order id", 400);
      }
      if (!isPaymentStatus(paymentStatus)) {
        return apiError("Invalid payment status", 400);
      }

      const { adminOrder } = getServices();
      await adminOrder.updatePaymentStatus(id, paymentStatus);

      return apiResponse({ message: "Order payment status updated successfully" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid payment status transition")) {
          return apiError(error.message, 400);
        }
        if (error.message.includes("not found")) {
          return apiError(error.message, 404);
        }
      }

      return apiError(
        error instanceof Error ? error.message : "Failed to update order payment status",
        500,
      );
    }
  });
}
