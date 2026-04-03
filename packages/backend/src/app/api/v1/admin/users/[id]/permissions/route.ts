import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../../_lib/api-response";
import { withAdmin } from "../../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";
import type { AuthContext } from "../../../../_lib/middleware";

/**
 *
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(
    request,
    async (context: AuthContext) => {
      try {
        const { id } = await params;
        const body = await request.json();
        const overrides: { permissionId: number; action: "grant" | "revoke" }[] =
          body.overrides ?? [];

        const { adminUser } = getServices();
        await adminUser.setPermissionOverrides(Number(id), overrides, context.user.userId);
        return apiResponse({ success: true });
      } catch (error) {
        return apiError(
          error instanceof Error ? error.message : "Failed to set permission overrides",
          500,
        );
      }
    },
    PERMISSION_CODES.ADMIN_USERS_WRITE,
  );
}
