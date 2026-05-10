/**
 * Loading UI for Orders List Page
 *
 * Displays skeleton loading state while orders are streaming.
 * Used with Next.js 16 PPR and Suspense boundaries.
 */

import { OrderListSkeleton } from '@components/skeletons';

export default function OrdersLoading() {
  return <OrderListSkeleton />;
}
