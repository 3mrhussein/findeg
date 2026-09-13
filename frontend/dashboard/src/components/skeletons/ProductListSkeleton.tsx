/**
 * ProductListSkeleton
 *
 * Skeleton loader for products list page with filters and results.
 */

export function ProductListSkeleton() {
  return (
    <div className="space-y-6 px-1">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* ── Filter Section ──────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* ── Results Section ─────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Product Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Image */}
              <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-700" />

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="flex justify-between">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
