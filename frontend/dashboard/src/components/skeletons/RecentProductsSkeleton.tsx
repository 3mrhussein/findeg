/**
 * RecentProductsSkeleton
 *
 * Skeleton loader for recent products list/grid.
 */

export function RecentProductsSkeleton({ count = 6 }: { count?: number } = {}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-6" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Product Image */}
            <div className="h-40 animate-pulse bg-slate-200 dark:bg-slate-700" />

            {/* Product Info */}
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
