import { Review } from "../../domain/entities/Review";

export interface IReviewRepository {
  getByProductId(productId: number): Promise<Review[]>;
  getByUserId(userId: number): Promise<Review[]>;
  create(review: Partial<Review>): Promise<Review>;
}
