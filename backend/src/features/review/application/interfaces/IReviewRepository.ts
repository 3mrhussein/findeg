import { ID } from "@findeg/backend/features/core/domain/types/common";
import { Review } from "../../domain/entities/Review";

export interface ProductReviewFilters {
  page?: number;
  limit?: number;
  rating?: number;
  verifiedOnly?: boolean;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  verifiedReviews: number;
  histogram: Record<number, number>;
}

export interface IReviewRepository {
  getByProductId(productId: ID): Promise<Review[]>;
  getByProductIdPaginated(
    productId: ID,
    filters?: ProductReviewFilters,
  ): Promise<{ reviews: Review[]; total: number }>;
  getSummaryByProductId(productId: ID): Promise<ProductReviewSummary>;
  getById(reviewId: ID): Promise<Review | null>;
  getByUserId(userId: ID): Promise<Review[]>;
  hasUserReviewed(productId: ID, userId: ID): Promise<boolean>;
  markHelpful(reviewId: ID, voterKey: string): Promise<number>;
  recalculateProductAggregates(productId: ID): Promise<{ rating: number; reviewsCount: number }>;
  create(review: Partial<Review>): Promise<Review>;
}
