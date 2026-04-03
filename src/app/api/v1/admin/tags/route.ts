/**
 * Admin Tags Endpoint
 *
 * GET /api/v1/admin/tags - List all tags
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withAdmin } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 * List all tags (admin)
 */
export async function GET(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const { adminTag } = getServices();
        const tags = await adminTag.getAll();

        return apiResponse(tags);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to retrieve tags", 500);
      }
    },
    PERMISSION_CODES.ADMIN_TAGS_READ,
  );
}
