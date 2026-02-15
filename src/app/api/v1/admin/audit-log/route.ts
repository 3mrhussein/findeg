/**
 * Admin Audit Log Endpoint
 *
 * GET /api/v1/admin/audit-log
 * Retrieves audit log entries with filters.
 */

import { NextRequest } from "next/server";
import { apiPaginatedResponse, apiError } from "../../_lib/api-response";
import { withAdmin } from "../../_lib/middleware";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";

/**
 *
 */
export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const entityType = searchParams.get("entityType") || undefined;
      const action = searchParams.get("action") || undefined;
      const page = Number(searchParams.get("page")) || 1;
      const limit = Number(searchParams.get("limit")) || 50;
      const offset = (page - 1) * limit;

      const result = await container.auditLogRepository.getAll({
        entityType,
        action,
        limit,
        offset,
      });

      // result is { data: logs[], total: number }
      const logs = Array.isArray(result) ? result : result.data || [];
      const total = Array.isArray(result) ? result.length : result.total || 0;

      return apiPaginatedResponse(logs, total, page, limit);
    } catch (error) {
      return apiError(
        error instanceof Error ? error.message : "Failed to retrieve audit logs",
        500,
      );
    }
  });
}
