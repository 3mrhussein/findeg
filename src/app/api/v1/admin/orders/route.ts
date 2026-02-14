/**
 * Admin Orders Endpoint
 *
 * GET /api/v1/admin/orders - List all orders with filters
 */

import { NextRequest } from "next/server";
import { apiPaginatedResponse, apiError } from "../../_lib/api-response";
import { withAdmin } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 *
 */
export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") || undefined;
      const page = Number(searchParams.get("page")) || 1;
      const limit = Number(searchParams.get("limit")) || 20;
      const offset = (page - 1) * limit;

      const { adminOrder } = getServices();
      const result = await adminOrder.getAll({ status, limit, offset });

      return apiPaginatedResponse(result.orders, result.total, page, limit);
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to retrieve orders", 500);
    }
  });
}
