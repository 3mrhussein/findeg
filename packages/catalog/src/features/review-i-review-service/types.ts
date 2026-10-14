import type { ID, Rating } from '@findeg/db/types';
import type { Review } from '../review-review/index';
import type { ProductReviewSummary } from '../review-i-review-repository/types';

export interface ProductReviewQuery {
  page?: number;
  limit?: number;
  rating?: number;
  verified?: boolean;
}

export interface ProductReviewListResult {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  summary: ProductReviewSummary;
}

export interface ReviewEligibility {
  loggedIn: boolean;
  hasPurchased: boolean;
  alreadyReviewed: boolean;
  canWriteReview: boolean;
}

export interface CreateReviewInput {
  productId: ID;
  userId: ID;
  rating: Rating;
  comment?: string;
}

export interface IReviewService {
  getProductReviews(productId: ID, query?: ProductReviewQuery): Promise<ProductReviewListResult>;
  getEligibility(productId: ID, userId?: ID): Promise<ReviewEligibility>;
  createReview(input: CreateReviewInput): Promise<Review>;
  markHelpful(reviewId: ID, voterKey: string): Promise<number>;
}
