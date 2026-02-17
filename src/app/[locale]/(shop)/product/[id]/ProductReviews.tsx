"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Review } from "@/features/review/domain/entities/Review";
import { useProductReviewsController } from "./useProductReviewsController";
import { ProductReviewsView } from "./ProductReviewsView";

interface ProductReviewsProps {
  initialReviews: Review[];
  productId: number;
}

/**
 *
 */
export const ProductReviews: React.FC<ProductReviewsProps> = ({ initialReviews, productId }) => {
  const t = useTranslations();
  const { currentReviews, currentPage, totalPages, setCurrentPage, handleAddReview } =
    useProductReviewsController(initialReviews, productId);

  return (
    <ProductReviewsView
      currentReviews={currentReviews}
      noReviewsText={t("Pages.ProductDetail.NoReviews")}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      onAddReview={handleAddReview}
    />
  );
};
