import { NextRequest } from "next/server";
import { apiErrorByCode, apiResponse } from "../../../../_lib/api-response";
import { withOptionalAuth } from "../../../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 * GET /api/v1/products/[id]/reviews/eligibility
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withOptionalAuth(request, async (context) => {
    try {
      const { id } = await params;
      const productId = Number(id);
      if (!Number.isInteger(productId) || productId <= 0) {
        return apiErrorByCode("CATALOG_INVALID_PRODUCT_ID");
      }

      const { products, reviews } = getServices();
      const product = await products.getById(productId);
      if (!product) {
        return apiErrorByCode("CATALOG_PRODUCT_NOT_FOUND");
      }

      const eligibility = await reviews.getEligibility(productId, context.user?.userId);
      return apiResponse(eligibility);
    } catch (error) {
      return apiErrorByCode("REVIEW_FETCH_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}
