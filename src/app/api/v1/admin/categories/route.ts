/**
 * Admin Categories Endpoint
 *
 * GET /api/v1/admin/categories - Get full category tree
 * POST /api/v1/admin/categories - Create new category
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
        const { adminCategory } = getServices();
        const categories = await adminCategory.getAll();
        return apiResponse({ categories });
      } catch (error) {
        return apiError(
          error instanceof Error ? error.message : "Failed to retrieve categories",
          500,
        );
      }
    },
    PERMISSION_CODES.ADMIN_CATEGORIES_READ,
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
        const { adminCategory } = getServices();
        const category = await adminCategory.create(body);
        return apiResponse(category, 201);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to create category", 500);
      }
    },
    PERMISSION_CODES.ADMIN_CATEGORIES_WRITE,
  );
}
