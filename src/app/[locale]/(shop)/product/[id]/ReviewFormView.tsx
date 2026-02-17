"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/common/Icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewFormViewProps {
  isSubmitting: boolean;
  author: string;
  rating: number;
  hoverRating: number;
  comment: string;
  submitted: boolean;
  title: string;
  successMessage: string;
  nameLabel: string;
  ratingLabel: string;
  commentLabel: string;
  submitLabel: string;
  submitLoadingLabel: string;
  onAuthorChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onHoverRatingChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

/**
 * Pure UI view for product review form.
 */
export function ReviewFormView({
  isSubmitting,
  author,
  rating,
  hoverRating,
  comment,
  submitted,
  title,
  successMessage,
  nameLabel,
  ratingLabel,
  commentLabel,
  submitLabel,
  submitLoadingLabel,
  onAuthorChange,
  onRatingChange,
  onHoverRatingChange,
  onCommentChange,
  onSubmit,
}: ReviewFormViewProps) {
  return (
    <Card className="lg:sticky lg:top-28">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center p-4 bg-primary/10 text-primary font-medium rounded-md">
            {successMessage}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="author">{nameLabel}</Label>
              <Input
                id="author"
                value={author}
                onChange={(event) => onAuthorChange(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <Label>{ratingLabel}</Label>
              <div className="flex items-center gap-1" onMouseLeave={() => onHoverRatingChange(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    className={`w-6 h-6 cursor-pointer transition-colors ${
                      (hoverRating || rating) >= star ? "text-secondary" : "text-muted"
                    }`}
                    onClick={() => onRatingChange(star)}
                    onMouseEnter={() => onHoverRatingChange(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">{commentLabel}</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(event) => onCommentChange(event.target.value)}
                rows={4}
                disabled={isSubmitting}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? submitLoadingLabel : submitLabel}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
