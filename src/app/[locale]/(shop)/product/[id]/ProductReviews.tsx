"use client";

import React, { useState } from "react";
import { ReviewItem } from "./ReviewItem";
import { ReviewForm } from "./ReviewForm";
import { Pagination } from "@/components/common/Pagination";
import { useTranslations } from "next-intl";
import { usePagination } from "@/hooks";
import { Review } from "@/features/review/domain/entities/Review";

interface ProductReviewsProps {
  initialReviews: Review[];
  productId: number;
}

/**
 *
 */
export const ProductReviews: React.FC<ProductReviewsProps> = ({ initialReviews, productId }) => {
  const t = useTranslations();
  const [productReviews, setProductReviews] = useState<Review[]>(initialReviews);

  const {
    currentPage,
    totalPages,
    currentPageData: currentReviews,
    setCurrentPage,
  } = usePagination(productReviews, 2);

  /**
   *
   */
  const handleAddReview = (newReview: { author: string; rating: number; comment: string }) => {
    const review: Review = {
      id: Date.now(),
      productId: productId,
      date: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerifiedPurchase: false,
      ...newReview,
    };
    setProductReviews((prev) => [review, ...prev]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col">
        <div className="flex-grow min-h-[20rem]">
          {currentReviews.length > 0 ? (
            <div className="space-y-6">
              {currentReviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">{t("Pages.ProductDetail.NoReviews")}</p>
            </div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <div>
        <ReviewForm onSubmit={handleAddReview} />
      </div>
    </div>
  );
};
