/**
 * Admin Single Brand Endpoint
 *
 * PUT /api/v1/admin/brands/[id] - Update brand
 * DELETE /api/v1/admin/brands/[id] - Delete brand
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 *
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(
    request,
    async () => {
      try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();
        const { adminBrand } = getServices();
        const brand = await adminBrand.update(id, body);
        return apiResponse(brand);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to update brand", 500);
      }
    },
    PERMISSION_CODES.ADMIN_BRANDS_WRITE,
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
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const { adminBrand } = getServices();
        await adminBrand.delete(id);
        return apiResponse({ message: "Brand deleted successfully" });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to delete brand", 500);
      }
    },
    PERMISSION_CODES.ADMIN_BRANDS_WRITE,
  );
}
