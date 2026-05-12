/**
 * Query Primitives for Reviews
 *
 * Pure database queries for review operations.
 * No ORM abstraction - direct Drizzle SQL operations.
 *
 * Note: Returns raw database rows. Domain mapping handled by ReviewService.
 */

import { db } from '../../connection';
import { reviews, reviewHelpfulVotes } from '../../schema';
import { eq, and, desc, count, avg, sql } from 'drizzle-orm';
import { type ID } from '@findeg/db/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReviewRow = typeof reviews.$inferSelect;

export interface ProductReviewFilters {
    page?: number;
    limit?: number;
    rating?: number;
    verifiedOnly?: boolean;
}

export interface ProductReviewSummary {
    averageRating: number;
    totalReviews: number;
    verifiedReviews: number;
    histogram: Record<number, number>;
}

// ─── Read Operations ─────────────────────────────────────────────────────────

/**
 * Get all reviews for a product
 */
export async function getByProductId(productId: ID): Promise<ReviewRow[]> {
    return db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, productId as number))
        .orderBy(desc(reviews.createdAt));
}

/**
 * Get paginated reviews for a product with optional filtering
 */
export async function getByProductIdPaginated(
    productId: ID,
    filters?: ProductReviewFilters,
): Promise<{ reviews: ReviewRow[]; total: number }> {
    const page = Math.max(filters?.page || 1, 1);
    const limit = Math.min(Math.max(filters?.limit || 10, 1), 50);

    const conditions = [eq(reviews.productId, productId as number)];
    if (filters?.rating) {
        conditions.push(eq(reviews.rating, String(filters.rating)));
    }
    if (filters?.verifiedOnly) {
        conditions.push(eq(reviews.isVerifiedPurchase, true));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db.select({ count: count() }).from(reviews).where(where);
    const total = Number(countResult[0].count);

    // Get paginated results
    const reviewsList = await db
        .select()
        .from(reviews)
        .where(where)
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

    return { reviews: reviewsList, total };
}

/**
 * Get summary statistics for a product's reviews
 */
export async function getSummaryByProductId(productId: ID): Promise<ProductReviewSummary> {
    const stats = await db
        .select({
            averageRating: avg(reviews.rating),
            totalReviews: count(reviews.id),
            verifiedReviews: count(
                sql`CASE WHEN ${reviews.isVerifiedPurchase} = true THEN 1 END`,
            ),
            rating1: count(sql`CASE WHEN CAST(${reviews.rating} AS INTEGER) = 1 THEN 1 END`),
            rating2: count(sql`CASE WHEN CAST(${reviews.rating} AS INTEGER) = 2 THEN 1 END`),
            rating3: count(sql`CASE WHEN CAST(${reviews.rating} AS INTEGER) = 3 THEN 1 END`),
            rating4: count(sql`CASE WHEN CAST(${reviews.rating} AS INTEGER) = 4 THEN 1 END`),
            rating5: count(sql`CASE WHEN CAST(${reviews.rating} AS INTEGER) = 5 THEN 1 END`),
        })
        .from(reviews)
        .where(eq(reviews.productId, productId as number));

    const result = stats[0];
    return {
        averageRating: result.averageRating ? Number(result.averageRating) : 0,
        totalReviews: result.totalReviews || 0,
        verifiedReviews: result.verifiedReviews || 0,
        histogram: {
            1: result.rating1 || 0,
            2: result.rating2 || 0,
            3: result.rating3 || 0,
            4: result.rating4 || 0,
            5: result.rating5 || 0,
        },
    };
}

/**
 * Get a review by ID
 */
export async function getById(reviewId: ID): Promise<ReviewRow | null> {
    const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId as number))
        .limit(1);

    return review || null;
}

/**
 * Get all reviews by a user
 */
export async function getByUserId(userId: ID): Promise<ReviewRow[]> {
    return db
        .select()
        .from(reviews)
        .where(eq(reviews.userId, userId as number))
        .orderBy(desc(reviews.createdAt));
}

/**
 * Check if user has already reviewed a product
 */
export async function hasUserReviewed(productId: ID, userId: ID): Promise<boolean> {
    const [result] = await db
        .select({ count: count() })
        .from(reviews)
        .where(and(eq(reviews.productId, productId as number), eq(reviews.userId, userId as number)))
        .limit(1);

    return (result?.count || 0) > 0;
}

// ─── Write Operations ────────────────────────────────────────────────────────

export interface CreateReviewInput {
    productId: number;
    userId: number;
    rating: number;
    comment?: string;
    isVerifiedPurchase?: boolean;
}

/**
 * Create a new review
 */
export async function create(review: CreateReviewInput): Promise<ReviewRow> {
    const [created] = await db
        .insert(reviews)
        .values({
            productId: review.productId,
            userId: review.userId,
            rating: String(review.rating),
            comment: review.comment,
            isVerifiedPurchase: review.isVerifiedPurchase ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

    return created;
}

/**
 * Mark a review as helpful by a voter
 * Returns the updated helpful count for the review
 */
export async function markHelpful(reviewId: ID, voterKey: string): Promise<number> {
    // Check if this voter has already marked this review as helpful
    const existing = await db
        .select({ id: reviewHelpfulVotes.id })
        .from(reviewHelpfulVotes)
        .where(
            and(
                eq(reviewHelpfulVotes.reviewId, reviewId as number),
                eq(reviewHelpfulVotes.voterKey, voterKey),
            ),
        )
        .limit(1);

    // If already voted, don't insert again
    if (existing.length > 0) {
        const [result] = await db
            .select({ count: count() })
            .from(reviewHelpfulVotes)
            .where(eq(reviewHelpfulVotes.reviewId, reviewId as number));
        return result?.count || 0;
    }

    // Insert new helpful vote
    await db.insert(reviewHelpfulVotes).values({
        reviewId: reviewId as number,
        voterKey,
        createdAt: new Date(),
    });

    // Return updated count
    const [result] = await db
        .select({ count: count() })
        .from(reviewHelpfulVotes)
        .where(eq(reviewHelpfulVotes.reviewId, reviewId as number));

    return result?.count || 0;
}

/**
 * Recalculate product rating aggregates
 */
export async function recalculateProductAggregates(
    productId: ID,
): Promise<{ rating: number; reviewsCount: number }> {
    const stats = await db
        .select({
            rating: avg(reviews.rating),
            count: count(),
        })
        .from(reviews)
        .where(eq(reviews.productId, productId as number));

    const result = stats[0];
    return {
        rating: result.rating ? Number(result.rating) : 0,
        reviewsCount: result.count || 0,
    };
}
