/**
 * Loading UI for Admin Dashboard
 *
 * Displays skeleton loading state while the dashboard content is streaming.
 * Used with Next.js 16 PPR (Partial Prerendering) and Suspense boundaries.
 */

import { DashboardStatsSkeleton } from '@components/skeletons';

export default function DashboardLoading() {
  return <DashboardStatsSkeleton />;
}
