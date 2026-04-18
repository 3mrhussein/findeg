/**
 * RecentOrdersSkeleton
 *
 * Skeleton loader for recent orders list/table.
 */

export function RecentOrdersSkeleton({ count = 5 }: { count?: number } = {}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Table Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 grid grid-cols-5 gap-4 items-center">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
