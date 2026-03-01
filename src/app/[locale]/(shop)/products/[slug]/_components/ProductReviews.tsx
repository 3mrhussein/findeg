"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Review {
  id: number | string;
  author?: string;
  rating: number;
  comment?: string;
}

/**
 *
 */
export function ProductReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
        <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
          <span className="material-symbols-outlined text-[32px]">reviews</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No reviews yet</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Be the first to share your thoughts on this product.
        </p>
        <button className="mt-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-2.5 text-sm font-bold text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          Write a Review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {(review.author || "A")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {review.author || "Anonymous"}
                  </div>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-slate-200 dark:text-slate-700"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
              "{review.comment || "Great product! Highly recommended."}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
