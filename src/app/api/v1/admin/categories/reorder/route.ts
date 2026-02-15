/**
 * Admin Category Reorder Endpoint
 *
 * PUT /api/v1/admin/categories/reorder
 * Updates category sort order for drag-drop functionality.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";

/**
 *
 */
export async function PUT(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const body = await request.json();
      const { reorderedCategories } = body;

      if (!Array.isArray(reorderedCategories)) {
        return apiError("reorderedCategories must be an array", 400);
      }

      // Use repository reorder for batch updates
      await container.categoryRepository.reorder(
        reorderedCategories.map((item: any) => ({
          id: item.id,
          sortOrder: item.sortOrder,
        })),
      );

      return apiResponse({ message: "Categories reordered successfully" });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to reorder categories", 500);
    }
  });
}
