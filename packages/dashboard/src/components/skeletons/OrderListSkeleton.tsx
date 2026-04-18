/**
 * OrderListSkeleton
 *
 * Skeleton loader for orders list page.
 */

export function OrderListSkeleton() {
  return (
    <div className="space-y-6 px-1">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* ── Filter & Search ─────────────────────────────────────── */}
      <div className="flex gap-4 items-center">
        <div className="h-10 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-10 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* ── Orders Table ────────────────────────────────────────── */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-6 gap-4 items-center">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
