import { ID, Rating } from "@/features/core/domain/types/common";
import { db } from "@/features/core/infrastructure/persistence";
import {
  reviews,
  type Review as DbReview,
} from "@/features/core/infrastructure/persistence/schema";
import { IReviewRepository } from "../../application/interfaces/IReviewRepository";
import { Review } from "../../domain/entities/Review";
import { eq } from "drizzle-orm";

/**
 * Drizzle Review Repository
 */
export class DrizzleReviewRepository implements IReviewRepository {
  /**
   * Maps database review to domain entity
   */
  private mapToDomain(dbReview: DbReview): Review {
    return {
      id: dbReview.id,
      productId: dbReview.productId,
      userId: dbReview.userId || undefined,
      rating: Number(dbReview.rating) as Rating,
      comment: dbReview.comment || undefined,
      isVerifiedPurchase: dbReview.isVerifiedPurchase || false,
      createdAt: dbReview.createdAt,
      updatedAt: dbReview.updatedAt,
    };
  }

  /**
   * Retrieves reviews by product ID
   */
  async getByProductId(productId: ID): Promise<Review[]> {
    const results = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId as any));
    return results.map(this.mapToDomain);
  }

  /**
   * Retrieves reviews by user ID
   */
  async getByUserId(userId: ID): Promise<Review[]> {
    const results = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId as any));
    return results.map(this.mapToDomain);
  }

  /**
   * Creates a new review
   */
  async create(review: Partial<Review>): Promise<Review> {
    const [result] = await db
      .insert(reviews)
      .values({
        ...review,
        rating: review.rating ? String(review.rating) : "0",
        productId: review.productId!,
      } as unknown as typeof reviews.$inferInsert)
      .returning();
    return this.mapToDomain(result);
  }
}
