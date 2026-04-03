/**
 * Admin User by ID API
 *
 * GET    /api/v1/admin/users/[id] - Get a single admin user
 * PUT    /api/v1/admin/users/[id] - Update an admin user
 * DELETE /api/v1/admin/users/[id] - Deactivate an admin user
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 *
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(
    request,
    async () => {
      try {
        const { id } = await params;
        const { adminUser } = getServices();
        const admin = await adminUser.getAdmin(Number(id));
        if (!admin) return apiError("Admin user not found", 404);
        return apiResponse(admin);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to get admin", 500);
      }
    },
    PERMISSION_CODES.ADMIN_USERS_READ,
  );
}

/**
 *
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(
    request,
    async () => {
      try {
        const { id } = await params;
        const body = await request.json();
        const { adminUser } = getServices();
        const admin = await adminUser.updateAdmin(Number(id), body);
        return apiResponse(admin);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to update admin", 500);
      }
    },
    PERMISSION_CODES.ADMIN_USERS_WRITE,
  );
}

/**
 *
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAdmin(
    request,
    async () => {
      try {
        const { id } = await params;
        const { adminUser } = getServices();
        await adminUser.deactivateAdmin(Number(id));
        return apiResponse({ success: true });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to deactivate admin", 500);
      }
    },
    PERMISSION_CODES.ADMIN_USERS_WRITE,
  );
}
