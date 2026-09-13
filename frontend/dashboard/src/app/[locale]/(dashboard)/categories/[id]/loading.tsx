/**
 * Loading UI for Category Detail Page
 *
 * Displays skeleton loading state while category detail is streaming.
 * Used with Next.js 16 PPR and Suspense boundaries.
 */

import { ProductDetailSkeleton } from '@components/skeletons';

export default function CategoryDetailLoading() {
  return <ProductDetailSkeleton />;
}
