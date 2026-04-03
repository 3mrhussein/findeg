/**
 * Admin Single Category Endpoint
 *
 * PUT /api/v1/admin/categories/[id] - Update category
 * DELETE /api/v1/admin/categories/[id] - Delete category
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
        const { adminCategory } = getServices();
        const category = await adminCategory.update(id, body);
        return apiResponse(category);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to update category", 500);
      }
    },
    PERMISSION_CODES.ADMIN_CATEGORIES_WRITE,
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
        const { adminCategory } = getServices();
        await adminCategory.delete(id);
        return apiResponse({ message: "Category deleted successfully" });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to delete category", 500);
      }
    },
    PERMISSION_CODES.ADMIN_CATEGORIES_WRITE,
  );
}
