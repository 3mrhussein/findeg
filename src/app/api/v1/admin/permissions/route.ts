/**
 * Admin Permissions List API
 *
 * GET /api/v1/admin/permissions - Returns all available permission codes
 *   Used by the UI to populate the permission matrix editor.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withAdmin } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 *
 */
export async function GET(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const { adminRole } = getServices();
        const permissions = await adminRole.listPermissions();
        return apiResponse({ permissions });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to list permissions", 500);
      }
    },
    PERMISSION_CODES.ADMIN_ROLES_READ,
  );
}
