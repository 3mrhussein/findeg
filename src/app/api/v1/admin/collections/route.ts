/**
 * Admin Collections Endpoint
 *
 * GET /api/v1/admin/collections - List all collections
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withAdmin } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 * List all collections (admin)
 */
export async function GET(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get("includeInactive") === "true";

        const { adminCollection } = getServices();
        const collections = await adminCollection.getAll(includeInactive);

        return apiResponse(collections);
      } catch (error) {
        return apiError(
          error instanceof Error ? error.message : "Failed to retrieve collections",
          500,
        );
      }
    },
    PERMISSION_CODES.ADMIN_COLLECTIONS_READ,
  );
}
