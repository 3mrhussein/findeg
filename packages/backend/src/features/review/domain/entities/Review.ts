import { ID, Rating } from "@backend/features/core/domain/types/common";

/**
 * Domain Entity: Review
 *
 * Represents a customer review for a product.
 * Includes rating, optional comment, and purchase verification status.
 */
export interface Review {
  id: ID;
  /** FK reference to the reviewed product */
  productId: ID;
  /** FK reference to the user who wrote the review (optional for anonymous reviews) */
  userId?: ID;
  /** Rating value (usually 1-5) */
  rating: Rating;
  /** Optional review text */
  comment?: string;
  /** Whether the user is confirmed to have purchased the item */
  isVerifiedPurchase?: boolean;
  /** Number of users who marked this review as helpful */
  helpfulCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  /** Resolved name of the reviewer for display */
  author?: string;
  /** Formatted date for display */
  date?: string;
}
