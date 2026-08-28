import type { ID } from '@findeg/backend/features/core/domain/types/common';
import type {
  CreateReviewInput,
  IReviewService,
  ProductReviewListResult,
  ProductReviewQuery,
  ReviewEligibility,
} from '../interfaces/IReviewService';
import type { Review } from '../../domain/entities/Review';
import { reviewQueries, hasPurchasedProduct } from '@findeg/db/queries';

/**
 * ReviewService handles storefront review queries and mutations.
 */
export class ReviewService implements IReviewService {
  /**
   * Creates a review service instance.
   */
  constructor() { }

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
      reviewQueries.getByProductIdPaginated(productId as number, {
        page,
        limit,
        rating: query.rating,
        verifiedOnly: query.verified,
      }),
      reviewQueries.getSummaryByProductId(productId as number),
    ]);

    return {
      reviews: result.reviews.map(r => ({
        ...r,
        rating: Number(r.rating),
      })) as Review[],
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
      hasPurchasedProduct(userId, productId),
      reviewQueries.hasUserReviewed(productId as number, userId as number),
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
      throw new Error('REVIEW_INVALID_RATING');
    }

    const eligibility = await this.getEligibility(input.productId, input.userId);
    if (!eligibility.hasPurchased) {
      throw new Error('REVIEW_PURCHASE_REQUIRED');
    }
    if (eligibility.alreadyReviewed) {
      throw new Error('REVIEW_ALREADY_SUBMITTED');
    }

    const created = await reviewQueries.create({
      productId: input.productId as number,
      userId: input.userId as number,
      rating: input.rating,
      comment: input.comment?.trim() || undefined,
      isVerifiedPurchase: true,
    });

    await reviewQueries.recalculateProductAggregates(input.productId);
    return {
      ...created,
      rating: Number(created.rating),
    } as Review;
  }

  /**
   * Marks a review as helpful once per voter identity.
   */
  async markHelpful(reviewId: ID, voterKey: string): Promise<number> {
    if (!voterKey.trim()) {
      throw new Error('REVIEW_INVALID_VOTER');
    }
    return reviewQueries.markHelpful(reviewId as number, voterKey.trim());
  }

  /**
   * Guarantees complete histogram buckets in API responses.
   */
  private normalizeSummary(summary: reviewQueries.ProductReviewSummary): reviewQueries.ProductReviewSummary {
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
