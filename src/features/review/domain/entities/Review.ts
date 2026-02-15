/**
 * Domain Entity: Review
 *
 * Represents a customer review for a product.
 * Includes rating, optional comment, and purchase verification status.
 */
export interface Review {
  id: number;
  /** FK reference to the reviewed product */
  productId: number;
  /** FK reference to the user who wrote the review (optional for anonymous reviews) */
  userId?: number;
  /** Rating value (usually 1-5) */
  rating: number;
  /** Optional review text */
  comment?: string;
  /** Whether the user is confirmed to have purchased the item */
  isVerifiedPurchase?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  /** Resolved name of the reviewer for display */
  author?: string;
  /** Formatted date for display */
  date?: string;
}
