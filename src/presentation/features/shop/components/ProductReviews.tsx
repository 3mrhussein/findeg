'use client';

import React, { useState } from 'react';
import { ReviewItem } from '@/presentation/features/shop/components/ReviewItem';
import { ReviewForm } from '@/presentation/features/shop/components/ReviewForm';
import { Pagination } from '@/presentation/shared/components/Pagination';
import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';
import { usePagination } from '@/presentation/shared/hooks';
import { Review } from '@/types';

interface ProductReviewsProps {
  initialReviews: Review[];
  productId: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ initialReviews, productId }) => {
  const t = useTranslations();
  const [productReviews, setProductReviews] = useState<Review[]>(initialReviews);
  
  const {
    currentPage,
    totalPages,
    currentPageData: currentReviews,
    setCurrentPage,
  } = usePagination(productReviews, 2);

  const handleAddReview = (newReview: Omit<Review, 'id' | 'productId' | 'date'>) => {
    const review: Review = {
      id: Date.now(),
      productId: productId,
      date: new Date().toISOString(),
      ...newReview
    };
    setProductReviews(prev => [review, ...prev]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col">
          <div className="flex-grow min-h-[20rem]">
              {currentReviews.length > 0 ? (
                  <div className="space-y-6">
                      {currentReviews.map(review => <ReviewItem key={review.id} review={review} />)}
                  </div>
              ) : (
                   <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">{t(T.PAGES.PRODUCT_DETAIL.NO_REVIEWS)}</p>
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
