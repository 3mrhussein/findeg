/**
 * Skeleton Components for Dashboard Sections
 *
 * Used as Suspense fallbacks for progressive rendering of different sections.
 */

import { Skeleton } from "@ui";

/**
 * Skeleton for Medium Section (Catalog Board)
 */
export function MediumDashboardSkeleton() {
  return (
    <div id="catalog-board" className="pt-2 px-1 space-y-4">
      <Skeleton className="h-6 w-48 rounded" />
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={`catalog-item-${i}`} className="h-24 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Slow Section (Category Coverage + Recent Activity)
 *
 * Height: ~400px for category coverage + ~300px for activity
 * Prevents CLS by maintaining explicit layout space
 */
export function SlowDashboardSkeleton() {
  return (
    <>
      {/* Category Coverage Widget + Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 px-1">
        {/* Category Coverage (col 4) */}
        <div id="category-coverage" className="md:col-span-1 lg:col-span-4 h-96">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>

        {/* Quick Actions (col 3) */}
        <div id="quick-actions" className="md:col-span-1 lg:col-span-3 h-96">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={`quick-action-${i}`} className="h-12 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Widget */}
      <div id="recent-activity" className="pt-6 px-1 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={`activity-${i}`} className="h-16 w-full rounded" />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Medium Section Skeleton (Smaller version for faster fallback)
 */
export function MediumDashboardMiniSkeleton() {
  return (
    <div id="catalog-board-mini" className="pt-2 px-1 space-y-2">
      <Skeleton className="h-5 w-40 rounded" />
      <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 h-20">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={`mini-item-${i}`} className="h-full w-full rounded" />
        ))}
      </div>
    </div>
  );
}
