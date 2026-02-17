"use client";

import { useState } from "react";

interface ReviewSubmission {
  author: string;
  rating: number;
  comment: string;
}

interface UseReviewFormControllerResult {
  isSubmitting: boolean;
  author: string;
  rating: number;
  hoverRating: number;
  comment: string;
  submitted: boolean;
  setAuthor: (value: string) => void;
  setRating: (value: number) => void;
  setHoverRating: (value: number) => void;
  setComment: (value: string) => void;
  handleSubmit: (event: React.FormEvent) => boolean;
}

/**
 * Encapsulates review form state and submission behavior.
 */
export function useReviewFormController(
  onSubmit: (review: ReviewSubmission) => void,
): UseReviewFormControllerResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /**
   * Validates and submits review data, then resets form state.
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    if (author && rating > 0 && comment) {
      onSubmit({ author, rating, comment });
      setAuthor("");
      setRating(0);
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setTimeout(() => setIsSubmitting(false), 500);
      return true;
    }
    setTimeout(() => setIsSubmitting(false), 500);
    return false;
  };

  return {
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
  };
}
