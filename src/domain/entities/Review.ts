/**
 * Domain Entity: Review
 */

export interface Review {
  id: number;
  productId: number;
  userId?: number;
  rating: number;
  comment?: string;
  isVerifiedPurchase?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Presentation-friendly aliases
  author?: string;
  date?: string;
}
