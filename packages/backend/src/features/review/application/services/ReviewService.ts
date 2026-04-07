import type { ID } from "@features/core/domain/types/common";
import type { IOrderRepository } from "@features/order/application/interfaces/IOrderRepository";
import type { IReviewRepository, ProductReviewSummary } from "../interfaces/IReviewRepository";
import type {
  CreateReviewInput,
  IReviewService,
  ProductReviewListResult,
  ProductReviewQuery,
  ReviewEligibility,
} from "../interfaces/IReviewService";
import type { Review } from "../../domain/entities/Review";

/**
 * ReviewService handles storefront review queries and mutations.
 */
export class ReviewService implements IReviewService {
  /**
   * Creates a review service instance.
   */
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Returns paginated product reviews with aggregate summary.
   */
  async getProductReviews(
    productId: ID,
    query: ProductReviewQuery = {},
  ): Promise<ProductReviewListResult> {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(Math.max(query.limit || 10, 1), 50);

    const [result, summary] = await Promise.all([
      this.reviewRepository.getByProductIdPaginated(productId, {
        page,
        limit,
        rating: query.rating,
        verifiedOnly: query.verified,
      }),
      this.reviewRepository.getSummaryByProductId(productId),
    ]);

    return {
      reviews: result.reviews,
      total: result.total,
      page,
      limit,
      summary: this.normalizeSummary(summary),
    };
  }

  /**
   * Evaluates whether the current user can write a review for a product.
   */
  async getEligibility(productId: ID, userId?: ID): Promise<ReviewEligibility> {
    if (!userId) {
      return {
        loggedIn: false,
        hasPurchased: false,
        alreadyReviewed: false,
        canWriteReview: false,
      };
    }

    const [hasPurchased, alreadyReviewed] = await Promise.all([
      this.orderRepository.hasPurchasedProduct(userId, productId),
      this.reviewRepository.hasUserReviewed(productId, userId),
    ]);

    return {
      loggedIn: true,
      hasPurchased,
      alreadyReviewed,
      canWriteReview: hasPurchased && !alreadyReviewed,
    };
  }

  /**
   * Creates a verified product review and refreshes product aggregates.
   */
  async createReview(input: CreateReviewInput): Promise<Review> {
    const rating = Number(input.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error("REVIEW_INVALID_RATING");
    }

    const eligibility = await this.getEligibility(input.productId, input.userId);
    if (!eligibility.hasPurchased) {
      throw new Error("REVIEW_PURCHASE_REQUIRED");
    }
    if (eligibility.alreadyReviewed) {
      throw new Error("REVIEW_ALREADY_SUBMITTED");
    }

    const created = await this.reviewRepository.create({
      productId: input.productId,
      userId: input.userId,
      rating: input.rating,
      comment: input.comment?.trim() || undefined,
      isVerifiedPurchase: true,
    });

    await this.reviewRepository.recalculateProductAggregates(input.productId);
    return created;
  }

  /**
   * Marks a review as helpful once per voter identity.
   */
  async markHelpful(reviewId: ID, voterKey: string): Promise<number> {
    if (!voterKey.trim()) {
      throw new Error("REVIEW_INVALID_VOTER");
    }
    return this.reviewRepository.markHelpful(reviewId, voterKey.trim());
  }

  /**
   * Guarantees complete histogram buckets in API responses.
   */
  private normalizeSummary(summary: ProductReviewSummary): ProductReviewSummary {
    const histogram: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (let i = 1; i <= 5; i += 1) {
      histogram[i] = summary.histogram[i] || 0;
    }
    return {
      ...summary,
      histogram,
    };
  }
}
