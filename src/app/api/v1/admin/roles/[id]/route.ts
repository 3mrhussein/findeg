/**
 * Admin Role by ID API
 *
 * GET    /api/v1/admin/roles/[id] - Get role with permissions and user count
 * PUT    /api/v1/admin/roles/[id] - Replace role's permission set
 * DELETE /api/v1/admin/roles/[id] - Delete role (fails if users assigned)
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
        const { adminRole } = getServices();
        const role = await adminRole.getRole(Number(id));
        if (!role) return apiError("Role not found", 404);
        return apiResponse(role);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to get role", 500);
      }
    },
    PERMISSION_CODES.ADMIN_ROLES_READ,
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
        const { permissionIds = [] } = await request.json();
        const { adminRole } = getServices();
        const role = await adminRole.updateRolePermissions(Number(id), permissionIds);
        return apiResponse(role);
      } catch (error) {
        return apiError(
          error instanceof Error ? error.message : "Failed to update role permissions",
          500,
        );
      }
    },
    PERMISSION_CODES.ADMIN_ROLES_WRITE,
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
        const { adminRole } = getServices();
        await adminRole.deleteRole(Number(id));
        return apiResponse({ success: true });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to delete role", 400);
      }
    },
    PERMISSION_CODES.ADMIN_ROLES_WRITE,
  );
}
