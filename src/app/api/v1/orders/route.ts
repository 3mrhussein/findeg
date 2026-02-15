/**
 * Orders Endpoint
 *
 * GET /api/v1/orders - List user's orders with filters
 * Requires authentication (user can only see their own orders)
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError, apiPaginatedResponse } from "../_lib/api-response";
import { withAuth } from "../_lib/middleware";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { OrderFilters } from "@/features/order/application/interfaces/IOrderRepository";

/**
 * List user's orders
 *
 * @param request - Request with query params: status, page, limit
 * @returns Paginated list of orders
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (context) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") || undefined;
      const page = Number(searchParams.get("page")) || 1;
      const limit = Number(searchParams.get("limit")) || 20;
      const offset = (page - 1) * limit;

      // Users can only see their own orders
      const userId = context.user.userId;

      const filters: OrderFilters = {
        userId,
        status,
        limit,
        offset,
      };

      const result = await container.orderRepository.getAllFiltered(filters);

      return apiPaginatedResponse(result.orders, result.total, page, limit);
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to retrieve orders", 500);
    }
  });
}
