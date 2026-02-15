/**
 * Single Order Detail Endpoint
 *
 * GET /api/v1/orders/[id]
 * Retrieves detailed information for a specific order.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withAuth } from "../../_lib/middleware";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";

/**
 * Get order detail
 *
 * @param request - Request object
 * @param params - Route params: { id }
 * @returns Full order object with items, tracking, timeline
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (context) => {
    try {
      const { id: idParam } = await params;
      const orderId = parseInt(idParam);

      if (isNaN(orderId)) {
        return apiError("Invalid order ID", 400);
      }

      const order = await container.orderRepository.getById(orderId);

      if (!order) {
        return apiError("Order not found", 404);
      }

      // Security: Users can only view their own orders
      if (order.userId !== context.user.userId && context.user.role !== "admin") {
        return apiError("Access denied", 403);
      }

      return apiResponse({
        order,
      });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to retrieve order", 500);
    }
  });
}
