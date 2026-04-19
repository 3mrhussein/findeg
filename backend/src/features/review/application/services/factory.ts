/**
 * Review Services Factory
 */
import { DrizzleReviewRepository } from "../../infrastructure/persistence/DrizzleReviewRepository";
import { DrizzleOrderRepository } from "../../../order/infrastructure/persistence/DrizzleOrderRepository";
import { ReviewService } from "./ReviewService";

/**
 * Create review services
 */
export function createReviewServices() {
  const reviewRepository = new DrizzleReviewRepository();
  const orderRepository = new DrizzleOrderRepository();
  
  return {
    reviews: new ReviewService(reviewRepository, orderRepository),
  };
}
