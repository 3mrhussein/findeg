/**
 * ProductDetailSkeleton
 *
 * Skeleton loader for product detail/edit page.
 */

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-6 px-1">
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-2 items-center">
            {i > 0 && <div className="h-4 w-1 animate-pulse bg-slate-200 dark:bg-slate-700" />}
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* ── Form Section ────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="h-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Basic Information */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="h-32 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Category */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Brand */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-3">
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
