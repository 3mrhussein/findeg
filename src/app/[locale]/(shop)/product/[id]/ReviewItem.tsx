import React from "react";
import type { Review } from "@/domain/entities/Review";
import { Rating } from "@/components/common/Rating";

interface ReviewItemProps {
  review: Review;
}

/**
 *
 */
export const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const formattedDate = new Date(review.date ?? review.createdAt ?? new Date()).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-foreground">{review.author}</h4>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </div>
      <Rating rating={review.rating} className="mb-3" />
      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
    </div>
  );
};
