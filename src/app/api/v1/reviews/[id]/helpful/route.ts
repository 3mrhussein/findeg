import { NextRequest } from "next/server";
import { apiErrorByCode, apiResponse } from "../../../_lib/api-response";
import { withOptionalAuth } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 * POST /api/v1/reviews/[id]/helpful
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withOptionalAuth(request, async (context) => {
    try {
      const { id } = await params;
      const reviewId = Number(id);
      if (!Number.isInteger(reviewId) || reviewId <= 0) {
        return apiErrorByCode("VALIDATION_INVALID_ITEM_ID");
      }

      const guestId = request.headers.get("X-Guest-Id") || request.headers.get("x-guest-id");
      const forwardedFor = request.headers.get("x-forwarded-for");
      const voterKey = context.user
        ? `user:${context.user.userId}`
        : guestId
          ? `guest:${guestId}`
          : forwardedFor
            ? `ip:${forwardedFor.split(",")[0].trim()}`
            : "";

      if (!voterKey) {
        return apiErrorByCode("REVIEW_INVALID_VOTER");
      }

      const { repositories, reviews } = getServices();
      const review = await repositories.reviews.getById(reviewId);
      if (!review) {
        return apiErrorByCode("REVIEW_NOT_FOUND");
      }

      const helpfulCount = await reviews.markHelpful(reviewId, voterKey);
      return apiResponse({ reviewId, helpfulCount });
    } catch (error) {
      if (error instanceof Error && error.message === "REVIEW_INVALID_VOTER") {
        return apiErrorByCode("REVIEW_INVALID_VOTER");
      }
      return apiErrorByCode("REVIEW_HELPFUL_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}
