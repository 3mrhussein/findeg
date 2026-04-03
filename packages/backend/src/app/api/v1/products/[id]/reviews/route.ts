import { NextRequest } from "next/server";
import { z } from "zod";
import { apiErrorByCode, apiResponse } from "../../../_lib/api-response";
import { withAuth } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";

const ReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  verified: z
    .string()
    .optional()
    .transform((value) => (value ? ["1", "true", "yes"].includes(value.toLowerCase()) : false)),
});

const CreateReviewBodySchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

/**
 * GET /api/v1/products/[id]/reviews
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return apiErrorByCode("CATALOG_INVALID_PRODUCT_ID");
    }

    const { searchParams } = new URL(request.url);
    const parsed = ReviewsQuerySchema.safeParse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      rating: searchParams.get("rating") || undefined,
      verified: searchParams.get("verified") || undefined,
    });

    if (!parsed.success) {
      return apiErrorByCode("VALIDATION_INVALID_QUERY_PARAMS", { issues: parsed.error.issues });
    }

    const { reviews } = getServices();
    const result = await reviews.getProductReviews(productId, parsed.data);
    return apiResponse(result);
  } catch (error) {
    return apiErrorByCode("REVIEW_FETCH_FAILED", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}

/**
 * POST /api/v1/products/[id]/reviews
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (context) => {
    try {
      const { id } = await params;
      const productId = Number(id);
      if (!Number.isInteger(productId) || productId <= 0) {
        return apiErrorByCode("CATALOG_INVALID_PRODUCT_ID");
      }

      const body = await request.json();
      const parsed = CreateReviewBodySchema.safeParse(body);
      if (!parsed.success) {
        return apiErrorByCode("VALIDATION_INVALID_REQUEST_BODY", { issues: parsed.error.issues });
      }

      const { products, reviews } = getServices();
      const product = await products.getById(productId);
      if (!product) {
        return apiErrorByCode("CATALOG_PRODUCT_NOT_FOUND");
      }

      const created = await reviews.createReview({
        productId,
        userId: context.user.userId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      });

      return apiResponse({ review: created }, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "REVIEW_PURCHASE_REQUIRED") {
          return apiErrorByCode("REVIEW_PURCHASE_REQUIRED");
        }
        if (error.message === "REVIEW_ALREADY_SUBMITTED") {
          return apiErrorByCode("REVIEW_ALREADY_SUBMITTED");
        }
        if (error.message === "REVIEW_INVALID_RATING") {
          return apiErrorByCode("REVIEW_INVALID_RATING");
        }
      }

      return apiErrorByCode("REVIEW_CREATE_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}
