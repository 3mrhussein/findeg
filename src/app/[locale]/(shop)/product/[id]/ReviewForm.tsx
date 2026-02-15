"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import type { Review } from "@/features/review/domain/entities/Review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/common/Icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /**
   *
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (author && rating > 0 && comment) {
      onSubmit({ author, rating, comment });
      setAuthor("");
      setRating(0);
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000); // Reset after 3 seconds
    }
  };

  return (
    <Card className="sticky top-28">
      <CardHeader>
        <CardTitle>{t("Pages.ProductDetail.WriteReview")}</CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center p-4 bg-primary/10 text-primary font-medium rounded-md">
            {t("Pages.ProductDetail.ReviewForm.Success")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="author">{t("Pages.ProductDetail.ReviewForm.Name")}</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t("Pages.ProductDetail.ReviewForm.Rating")}</Label>
              <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    className={`w-6 h-6 cursor-pointer transition-colors ${
                      (hoverRating || rating) >= star ? "text-secondary" : "text-muted"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">{t("Pages.ProductDetail.ReviewForm.Comment")}</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t("Pages.ProductDetail.ReviewForm.Submit")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
