/**
 * Admin Roles API
 *
 * GET  /api/v1/admin/roles - List all roles with permissions and user counts
 * POST /api/v1/admin/roles - Create a new role
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
        const roles = await adminRole.listRoles();
        return apiResponse({ roles });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to list roles", 500);
      }
    },
    PERMISSION_CODES.ADMIN_ROLES_READ,
  );
}

/**
 *
 */
export async function POST(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const { code, name, permissionIds = [] } = await request.json();
        const { adminRole } = getServices();
        const role = await adminRole.createRole(code, name, permissionIds);
        return apiResponse(role, 201);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to create role", 500);
      }
    },
    PERMISSION_CODES.ADMIN_ROLES_WRITE,
  );
}
