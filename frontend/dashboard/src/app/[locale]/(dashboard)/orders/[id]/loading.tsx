/**
 * Loading UI for Order Detail Page
 *
 * Displays skeleton loading state while order detail is streaming.
 * Used with Next.js 16 PPR and Suspense boundaries.
 */

import { ProductDetailSkeleton } from '@components/skeletons';

export default function OrderDetailLoading() {
  return <ProductDetailSkeleton />;
}
