/**
 * Review Services Factory
 */
import { ReviewService } from './ReviewService';

/**
 * Create review services
 */
export function createReviewServices() {
  return {
    reviews: new ReviewService(),
  };
}
