import { db } from "@/infrastructure/config/database.config";
import { reviews, type Review as DbReview } from "@/infrastructure/database/schema";
import { IReviewRepository } from "@/application/repositories/IReviewRepository";
import { Review } from "@/domain/entities/Review";
import { eq } from "drizzle-orm";

/**
 *
 */
export class DrizzleReviewRepository implements IReviewRepository {
  /**
   *
   */
  private mapToDomain(dbReview: DbReview): Review {
    return {
      id: dbReview.id,
      productId: dbReview.productId,
      userId: dbReview.userId || undefined,
      rating: Number(dbReview.rating),
      comment: dbReview.comment || undefined,
      isVerifiedPurchase: dbReview.isVerifiedPurchase || false,
      createdAt: dbReview.createdAt,
      updatedAt: dbReview.updatedAt,
    };
  }

  /**
   *
   */
  async getByProductId(productId: number): Promise<Review[]> {
    const results = await db.select().from(reviews).where(eq(reviews.productId, productId));
    return results.map(this.mapToDomain);
  }

  /**
   *
   */
  async getByUserId(userId: number): Promise<Review[]> {
    const results = await db.select().from(reviews).where(eq(reviews.userId, userId));
    return results.map(this.mapToDomain);
  }

  /**
   *
   */
  async create(review: Partial<Review>): Promise<Review> {
    const [result] = await db
      .insert(reviews)
      .values(review as any)
      .returning();
    return this.mapToDomain(result);
  }
}
