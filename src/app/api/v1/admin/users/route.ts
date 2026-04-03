/**
 * Admin Users API
 *
 * GET  /api/v1/admin/users - List all admin users
 * POST /api/v1/admin/users - Create a new admin user
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
        const { adminUser } = getServices();
        const admins = await adminUser.listAdmins();
        return apiResponse({ admins });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to list admins", 500);
      }
    },
    PERMISSION_CODES.ADMIN_USERS_READ,
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
        const body = await request.json();
        const { adminUser } = getServices();
        const admin = await adminUser.createAdmin(body);
        return apiResponse(admin, 201);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to create admin", 500);
      }
    },
    PERMISSION_CODES.ADMIN_USERS_WRITE,
  );
}
