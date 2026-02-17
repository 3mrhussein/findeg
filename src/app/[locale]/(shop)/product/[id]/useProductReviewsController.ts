"use client";

import { useState } from "react";
import { usePagination } from "@/hooks";
import type { Review } from "@/features/review/domain/entities/Review";

interface NewReviewPayload {
  author: string;
  rating: number;
  comment: string;
}

interface UseProductReviewsControllerResult {
  productReviews: Review[];
  currentReviews: Review[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  handleAddReview: (newReview: NewReviewPayload) => void;
}

/**
 * Encapsulates review list and review submission behavior for product detail.
 */
export function useProductReviewsController(
  initialReviews: Review[],
  productId: number,
): UseProductReviewsControllerResult {
  const [productReviews, setProductReviews] = useState<Review[]>(initialReviews);

  const {
    currentPage,
    totalPages,
    currentPageData: currentReviews,
    setCurrentPage,
  } = usePagination(productReviews, 2);

  /**
   * Inserts newly submitted review at the top of the in-memory list.
   */
  const handleAddReview = (newReview: NewReviewPayload) => {
    const review: Review = {
      id: Date.now(),
      productId,
      date: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerifiedPurchase: false,
      ...newReview,
    };
    setProductReviews((previousReviews) => [review, ...previousReviews]);
  };

  return {
    productReviews,
    currentReviews,
    currentPage,
    totalPages,
    setCurrentPage,
    handleAddReview,
  };
}
