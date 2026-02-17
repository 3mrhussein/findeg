"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useReviewFormController } from "./useReviewFormController";
import { ReviewFormView } from "./ReviewFormView";
import { useToast } from "@/hooks/use-toast";

interface ReviewSubmission {
  author: string;
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  onSubmit: (review: ReviewSubmission) => void;
}

/**
 *
 */
export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const t = useTranslations();
  const { toast } = useToast();
  const {
    isSubmitting,
    author,
    rating,
    hoverRating,
    comment,
    submitted,
    setAuthor,
    setRating,
    setHoverRating,
    setComment,
    handleSubmit,
  } = useReviewFormController(onSubmit);

  /**
   * Submits review and shows success feedback when accepted.
   */
  const onFormSubmit = (event: React.FormEvent) => {
    const isSuccess = handleSubmit(event);
    if (isSuccess) {
      toast({
        title: t("Feedback.ReviewSubmittedTitle"),
        description: t("Feedback.ReviewSubmittedDescription"),
      });
    }
  };

  return (
    <ReviewFormView
      isSubmitting={isSubmitting}
      author={author}
      rating={rating}
      hoverRating={hoverRating}
      comment={comment}
      submitted={submitted}
      title={t("Pages.ProductDetail.WriteReview")}
      successMessage={t("Pages.ProductDetail.ReviewForm.Success")}
      nameLabel={t("Pages.ProductDetail.ReviewForm.Name")}
      ratingLabel={t("Pages.ProductDetail.ReviewForm.Rating")}
      commentLabel={t("Pages.ProductDetail.ReviewForm.Comment")}
      submitLabel={t("Pages.ProductDetail.ReviewForm.Submit")}
      submitLoadingLabel={t("Feedback.SubmittingReview")}
      onAuthorChange={setAuthor}
      onRatingChange={setRating}
      onHoverRatingChange={setHoverRating}
      onCommentChange={setComment}
      onSubmit={onFormSubmit}
    />
  );
};
