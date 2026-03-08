import { ID, Rating } from "@/features/core/domain/types/common";
import { db } from "@/features/core/infrastructure/persistence";
import {
  reviews,
  users,
  reviewHelpfulVotes,
  products,
  type Review as DbReview,
} from "@/features/core/infrastructure/persistence/schema";
import {
  IReviewRepository,
  ProductReviewFilters,
  ProductReviewSummary,
} from "../../application/interfaces/IReviewRepository";
import { Review } from "../../domain/entities/Review";
import { and, desc, eq, sql } from "drizzle-orm";

type SelectedReviewRow = Pick<
  DbReview,
  | "id"
  | "productId"
  | "userId"
  | "rating"
  | "comment"
  | "isVerifiedPurchase"
  | "status"
  | "createdAt"
  | "updatedAt"
> & {
  helpfulCount?: number | null;
};

/**
 * Drizzle Review Repository
 */
export class DrizzleReviewRepository implements IReviewRepository {
  private helpfulColumnAvailable: boolean | null = null;

  private helpfulVotesTableAvailable: boolean | null = null;

  /**
   *
   */
  private toBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return (
        normalized === "true" || normalized === "t" || normalized === "1" || normalized === "yes"
      );
    }
    return false;
  }

  /**
   * Checks whether helpful_count exists in current DB schema.
   */
  private async hasHelpfulColumn(): Promise<boolean> {
    if (this.helpfulColumnAvailable !== null) {
      return this.helpfulColumnAvailable;
    }

    const result = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reviews'
          AND column_name = 'helpful_count'
      ) AS "exists"
    `);

    this.helpfulColumnAvailable = this.toBoolean(result[0]?.exists);
    return this.helpfulColumnAvailable;
  }

  /**
   * Checks whether review_helpful_votes exists in current DB schema.
   */
  private async hasHelpfulVotesTable(): Promise<boolean> {
    if (this.helpfulVotesTableAvailable !== null) {
      return this.helpfulVotesTableAvailable;
    }

    const result = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'review_helpful_votes'
      ) AS "exists"
    `);

    this.helpfulVotesTableAvailable = this.toBoolean(result[0]?.exists);
    return this.helpfulVotesTableAvailable;
  }

  /**
   * Maps database review to domain entity.
   */
  private mapToDomain(
    dbReview: SelectedReviewRow,
    dbUser?: { firstName: string | null; lastName: string | null; name: string | null } | null,
  ): Review {
    const resolvedAuthor = dbUser
      ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ").trim() || dbUser.name
      : undefined;

    return {
      id: dbReview.id,
      productId: dbReview.productId,
      userId: dbReview.userId || undefined,
      rating: Number(dbReview.rating) as Rating,
      comment: dbReview.comment || undefined,
      isVerifiedPurchase: dbReview.isVerifiedPurchase || false,
      helpfulCount: Number(dbReview.helpfulCount ?? 0),
      createdAt: dbReview.createdAt,
      updatedAt: dbReview.updatedAt,
      author: resolvedAuthor || undefined,
    };
  }

  /**
   * Returns selectable review fields with backward-compatible helpful count.
   */
  private async getSelectableReviewFields() {
    const withHelpful = await this.hasHelpfulColumn();

    return {
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      status: reviews.status,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      helpfulCount: withHelpful ? reviews.helpfulCount : sql<number>`0`,
    };
  }

  /**
   * Retrieves reviews by product ID.
   */
  async getByProductId(productId: ID): Promise<Review[]> {
    const reviewFields = await this.getSelectableReviewFields();
    const results = await db
      .select({
        review: reviewFields,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          name: users.name,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(users.id, reviews.userId))
      .where(eq(reviews.productId, productId as any))
      .orderBy(desc(reviews.createdAt));

    return results.map((row) => this.mapToDomain(row.review, row.user));
  }

  /**
   * Retrieves paginated reviews by product ID with optional filters.
   */
  async getByProductIdPaginated(
    productId: ID,
    filters: ProductReviewFilters = {},
  ): Promise<{ reviews: Review[]; total: number }> {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 10, 1), 50);
    const offset = (page - 1) * limit;

    const conditions = [eq(reviews.productId, productId as any)];
    if (filters.verifiedOnly) {
      conditions.push(eq(reviews.isVerifiedPurchase, true));
    }
    if (typeof filters.rating === "number" && filters.rating >= 1 && filters.rating <= 5) {
      conditions.push(sql`FLOOR(CAST(${reviews.rating} AS numeric)) = ${filters.rating}`);
    }

    const whereClause = and(...conditions);
    const reviewFields = await this.getSelectableReviewFields();

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          review: reviewFields,
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
            name: users.name,
          },
        })
        .from(reviews)
        .leftJoin(users, eq(users.id, reviews.userId))
        .where(whereClause)
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(reviews)
        .where(whereClause),
    ]);

    return {
      reviews: rows.map((row) => this.mapToDomain(row.review, row.user)),
      total: totalRows[0]?.count || 0,
    };
  }

  /**
   * Gets rating summary for product reviews.
   */
  async getSummaryByProductId(productId: ID): Promise<ProductReviewSummary> {
    const rows = await db
      .select({
        rating: reviews.rating,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId as any));

    const histogram: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingTotal = 0;
    let verifiedReviews = 0;

    for (const row of rows) {
      const rating = Number(row.rating);
      ratingTotal += rating;
      const bucket = Math.min(Math.max(Math.floor(rating), 1), 5);
      histogram[bucket] = (histogram[bucket] || 0) + 1;
      if (row.isVerifiedPurchase) {
        verifiedReviews += 1;
      }
    }

    const totalReviews = rows.length;

    return {
      averageRating: totalReviews > 0 ? Number((ratingTotal / totalReviews).toFixed(2)) : 0,
      totalReviews,
      verifiedReviews,
      histogram,
    };
  }

  /**
   * Retrieves a single review by ID.
   */
  async getById(reviewId: ID): Promise<Review | null> {
    const reviewFields = await this.getSelectableReviewFields();
    const rows = await db
      .select({
        review: reviewFields,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          name: users.name,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(users.id, reviews.userId))
      .where(eq(reviews.id, reviewId as any))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToDomain(rows[0].review, rows[0].user);
  }

  /**
   * Retrieves reviews by user ID.
   */
  async getByUserId(userId: ID): Promise<Review[]> {
    const reviewFields = await this.getSelectableReviewFields();
    const results = await db
      .select({
        review: reviewFields,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          name: users.name,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(users.id, reviews.userId))
      .where(eq(reviews.userId, userId as any))
      .orderBy(desc(reviews.createdAt));

    return results.map((row) => this.mapToDomain(row.review, row.user));
  }

  /**
   * Returns whether user already reviewed this product.
   */
  async hasUserReviewed(productId: ID, userId: ID): Promise<boolean> {
    const rows = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.productId, productId as any), eq(reviews.userId, userId as any)))
      .limit(1);

    return rows.length > 0;
  }

  /**
   * Marks review as helpful once per voter key.
   * Returns 0 when helpful voting schema isn't migrated yet.
   */
  async markHelpful(reviewId: ID, voterKey: string): Promise<number> {
    const supportsHelpful = (await this.hasHelpfulColumn()) && (await this.hasHelpfulVotesTable());
    if (!supportsHelpful) {
      return 0;
    }

    return db.transaction(async (tx) => {
      const inserted = await tx
        .insert(reviewHelpfulVotes)
        .values({
          reviewId: reviewId as any,
          voterKey,
        })
        .onConflictDoNothing()
        .returning({ id: reviewHelpfulVotes.id });

      if (inserted.length > 0) {
        const [updated] = await tx
          .update(reviews)
          .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
          .where(eq(reviews.id, reviewId as any))
          .returning({ helpfulCount: reviews.helpfulCount });

        return updated?.helpfulCount || 0;
      }

      const [existing] = await tx
        .select({ helpfulCount: reviews.helpfulCount })
        .from(reviews)
        .where(eq(reviews.id, reviewId as any))
        .limit(1);

      return existing?.helpfulCount || 0;
    });
  }

  /**
   * Recalculates and persists product review aggregates.
   */
  async recalculateProductAggregates(
    productId: ID,
  ): Promise<{ rating: number; reviewsCount: number }> {
    const [aggregate] = await db
      .select({
        rating: sql<number>`COALESCE(AVG(CAST(${reviews.rating} AS numeric)), 0)`,
        reviewsCount: sql<number>`cast(COUNT(*) as integer)`,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId as any));

    const nextRating = Number((aggregate?.rating || 0).toFixed(2));
    const nextReviewsCount = aggregate?.reviewsCount || 0;

    await db
      .update(products)
      .set({
        rating: String(nextRating),
        reviewsCount: nextReviewsCount,
      })
      .where(eq(products.id, productId as any));

    return {
      rating: nextRating,
      reviewsCount: nextReviewsCount,
    };
  }

  /**
   * Creates a new review.
   */
  async create(review: Partial<Review>): Promise<Review> {
    const withHelpful = await this.hasHelpfulColumn();

    const [result] = await db
      .insert(reviews)
      .values({
        ...review,
        rating: review.rating ? String(review.rating) : "0",
        productId: review.productId!,
      } as unknown as typeof reviews.$inferInsert)
      .returning({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        status: reviews.status,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        helpfulCount: withHelpful ? reviews.helpfulCount : sql<number>`0`,
      });

    return this.mapToDomain(result);
  }
}
