import { ID } from "@/features/core/domain/types/common";
import { Review } from "../../domain/entities/Review";

export interface IReviewRepository {
  getByProductId(productId: ID): Promise<Review[]>;
  getByUserId(userId: ID): Promise<Review[]>;
  create(review: Partial<Review>): Promise<Review>;
}
