"use client";

import { ReviewItem } from "./ReviewItem";
import { ReviewForm } from "./ReviewForm";
import { Pagination } from "@/components/common/Pagination";
import type { Review } from "@/features/review/domain/entities/Review";
import { SectionStateEmpty } from "@/components/common/state/SectionStateEmpty";

interface NewReviewPayload {
  author: string;
  rating: number;
  comment: string;
}

interface ProductReviewsViewProps {
  currentReviews: Review[];
  noReviewsText: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddReview: (review: NewReviewPayload) => void;
}

/**
 * Pure UI view for product review listing and form composition.
 */
export function ProductReviewsView({
  currentReviews,
  noReviewsText,
  currentPage,
  totalPages,
  onPageChange,
  onAddReview,
}: ProductReviewsViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex-grow min-h-[20rem]">
          {currentReviews.length > 0 ? (
            <div className="space-y-6">
              {currentReviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <SectionStateEmpty message={noReviewsText} />
          )}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
      <div>
        <ReviewForm onSubmit={onAddReview} />
      </div>
    </div>
  );
}
