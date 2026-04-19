/**
 * Loading UI for Product Detail Page
 *
 * Displays skeleton loading state while product detail is streaming.
 * Used with Next.js 16 PPR and Suspense boundaries.
 */

import { ProductDetailSkeleton } from "@components/skeletons";

export default function ProductDetailLoading() {
  return <ProductDetailSkeleton />;
}
