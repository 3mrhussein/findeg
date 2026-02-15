/**
 * Admin Dashboard Stats Endpoint
 *
 * GET /api/v1/admin/dashboard/stats
 * Retrieves dashboard KPIs and statistics.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";

/**
 * Get dashboard statistics
 *
 * @param request - Request with optional query params: startDate, endDate
 * @returns Dashboard KPIs (revenue, orders, low stock, etc.)
 */
export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const startDate = searchParams.get("startDate") || undefined;
      const endDate = searchParams.get("endDate") || undefined;

      // Note: getDashboardStats currently doesn't accept parameters
      // Future enhancement: Add date range filtering
      const stats = await container.adminDashboardService.getDashboardStats();

      return apiResponse(stats);
    } catch (error) {
      return apiError(
        error instanceof Error ? error.message : "Failed to fetch dashboard stats",
        500,
      );
    }
  });
}
