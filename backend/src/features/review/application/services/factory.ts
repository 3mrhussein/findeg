/**
 * Review Services Factory
 */
import type { IReviewService } from '../interfaces/IReviewService';
import { ReviewService } from './ReviewService';

/**
 * Create review services
 */
export function createReviewServices(): { reviews: IReviewService } {
  return {
    reviews: new ReviewService(),
  };
}
