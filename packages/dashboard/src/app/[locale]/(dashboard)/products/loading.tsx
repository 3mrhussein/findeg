/**
 * Loading UI for Products List Page
 *
 * Displays skeleton loading state while products are streaming.
 * Used with Next.js 16 PPR and Suspense boundaries.
 */

import { ProductListSkeleton } from "@components/skeletons";

export default function ProductsLoading() {
  return <ProductListSkeleton />;
}
