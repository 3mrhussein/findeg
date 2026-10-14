/**
 * Review Services Factory
 */
import type { IReviewService } from '../review-i-review-service/types';
import { ReviewService } from '../review-review-service/index';

/**
 * Create review services
 */
export function createReviewServices(): { reviews: IReviewService } {
  return {
    reviews: new ReviewService(),
  };
}
