"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Star, ThumbsUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui";
import { Textarea } from "@ui";
import { Badge } from "@ui";
import { IconTooltip } from "@ui";
import type { ProductReviewSummary } from "@features/review/application/interfaces/IReviewRepository";
import type { Review } from "@features/review/domain/entities/Review";
import { cn } from "@lib/utils";

type ReviewFilter = "all" | "5" | "4" | "verified";

interface ReviewsSectionProps {
  productId: number;
  initialReviews: Review[];
  initialSummary: ProductReviewSummary;
  initialTotal: number;
}

interface ReviewEligibility {
  loggedIn: boolean;
  hasPurchased: boolean;
  alreadyReviewed: boolean;
  canWriteReview: boolean;
}

function getGuestId() {
  const storageKey = "findeg_guest_id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const generated = `guest_${crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

function colorFromName(name: string): string {
  const palette = [
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-fuchsia-100 text-fuchsia-700",
    "bg-cyan-100 text-cyan-700",
  ];

  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(index);
    hash |= 0;
  }

  return palette[Math.abs(hash) % palette.length];
}

/**
 * Product reviews with summary, filters, helpful votes and write-review flow.
 */
export function ReviewsSection({
  productId,
  initialReviews,
  initialSummary,
  initialTotal,
}: ReviewsSectionProps) {
  const t = useTranslations("Pages.ProductDetail");
  const locale = useLocale();

  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [summary, setSummary] = useState<ProductReviewSummary>(initialSummary);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageSize = 10;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const avgLabel = useMemo(() => summary.averageRating.toFixed(1), [summary.averageRating]);

  const fetchEligibility = async () => {
    const response = await fetch(`/api/v1/products/${productId}/reviews/eligibility`, {
      cache: "no-store",
    });
    const json = await response.json();
    if (json?.success) {
      setEligibility(json.data as ReviewEligibility);
    }
  };

  const fetchReviews = async (nextFilter: ReviewFilter, nextPage: number) => {
    setIsLoading(true);

    const query = new URLSearchParams({
      page: String(nextPage),
      limit: String(pageSize),
    });

    if (nextFilter === "5") {
      query.set("rating", "5");
    } else if (nextFilter === "4") {
      query.set("rating", "4");
    } else if (nextFilter === "verified") {
      query.set("verified", "true");
    }

    try {
      const response = await fetch(`/api/v1/products/${productId}/reviews?${query.toString()}`, {
        cache: "no-store",
      });
      const json = await response.json();
      if (json?.success) {
        setReviews(json.data.reviews || []);
        setSummary(json.data.summary || initialSummary);
        setTotal(json.data.total || 0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (nextFilter: ReviewFilter) => {
    setFilter(nextFilter);
    setPage(1);
    await fetchReviews(nextFilter, 1);
  };

  const handlePageChange = async (nextPage: number) => {
    setPage(nextPage);
    await fetchReviews(filter, nextPage);
  };

  const handleHelpful = async (reviewId: number) => {
    const guestId = getGuestId();
    const response = await fetch(`/api/v1/reviews/${reviewId}/helpful`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Guest-Id": guestId,
      },
    });

    const json = await response.json();
    if (json?.success) {
      const helpfulCount = Number(json?.data?.helpfulCount || 0);
      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? { ...review, helpfulCount } : review)),
      );
    }
  };

  const openReviewDialog = async () => {
    await fetchEligibility();
    setIsDialogOpen(true);
  };

  const submitReview = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      const json = await response.json();
      if (json?.success) {
        setIsDialogOpen(false);
        setComment("");
        setRating(5);
        await fetchEligibility();
        await fetchReviews(filter, 1);
        setPage(1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="reviews-section">
      <div className="grid gap-6 rounded-2xl border bg-card p-4 md:grid-cols-[200px_1fr_auto] md:items-center">
        <div>
          <div className="text-4xl font-black text-foreground">{avgLabel}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {t("BasedOnReviews", { count: total })}
          </div>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.histogram[star] || 0;
            const width = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <div className="w-8 text-xs text-muted-foreground">{star}★</div>
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${width}%` }} />
                </div>
                <div className="w-10 text-end text-xs text-muted-foreground">{count}</div>
              </div>
            );
          })}
        </div>

        <Button variant="outline" onClick={openReviewDialog}>
          <MessageSquare />
          {t("WriteReview")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: t("FilterAll") },
            { id: "5", label: t("Filter5Star") },
            { id: "4", label: t("Filter4Star") },
            { id: "verified", label: t("FilterVerified") },
          ] as Array<{ id: ReviewFilter; label: string }>
        ).map((item) => (
          <Button
            key={item.id}
            variant={filter === item.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground animate-pulse">
          {t("ReviewsLoading")}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          {t("NoReviews")}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const author = review.author || t("Anonymous");
            const initials = author
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((entry) => entry[0])
              .join("")
              .toUpperCase();

            return (
              <article key={review.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        colorFromName(author),
                      )}
                    >
                      {initials || "A"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{author}</span>
                        {review.isVerifiedPurchase ? (
                          <Badge variant="outline">{t("VerifiedPurchase")}</Badge>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={cn(
                              "size-3.5",
                              index < Math.round(Number(review.rating))
                                ? "fill-current"
                                : "text-muted stroke-current",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString(
                          locale === "ar" ? "ar-EG" : "en-EG",
                        )
                      : ""}
                  </span>
                </div>

                {review.comment ? (
                  <p className="mt-3 text-sm leading-6 text-foreground/90">{review.comment}</p>
                ) : null}

                <div className="mt-3 flex justify-end">
                  <IconTooltip label={t("Helpful") as string} asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                      onClick={() => handleHelpful(Number(review.id))}
                    >
                      <ThumbsUp className="size-3.5" />
                      <span>{review.helpfulCount || 0}</span>
                    </button>
                  </IconTooltip>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            {t("PaginationPrevious")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            {t("PaginationNext")}
          </Button>
        </div>
      ) : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("WriteReview")}</DialogTitle>
          </DialogHeader>

          {eligibility && !eligibility.canWriteReview ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              {!eligibility.loggedIn
                ? t("ReviewLoginRequired")
                : eligibility.alreadyReviewed
                  ? t("ReviewAlreadySubmitted")
                  : t("ReviewPurchaseRequired")}
            </div>
          ) : (
            <>
              <div>
                <div className="mb-2 text-sm font-medium">{t("ReviewForm.Rating")}</div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setRating(index + 1)}
                      className="rounded p-1"
                    >
                      <Star
                        className={cn(
                          "size-6",
                          index < rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">{t("ReviewForm.Comment")}</div>
                <Textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  placeholder={t("ReviewCommentPlaceholder")}
                />
              </div>

              <Button onClick={submitReview} disabled={isSubmitting}>
                {isSubmitting ? t("ReviewSubmitting") : t("ReviewForm.Submit")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
