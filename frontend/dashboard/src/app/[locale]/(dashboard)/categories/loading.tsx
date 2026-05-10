/**
 * Loading UI for Categories List Page
 *
 * Displays skeleton loading state while categories are streaming.
 * Used with Next.js 16 PPR and Suspense boundaries.
 */

import { CategoryListSkeleton } from '@components/skeletons';

export default function CategoriesLoading() {
  return <CategoryListSkeleton />;
}
