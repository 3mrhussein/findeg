/**
 * DashboardStatsSkeleton
 *
 * Skeleton loader for dashboard KPI cards and stats widgets.
 * Matches the visual height and spacing of DashboardStats component.
 */

export function DashboardStatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* ── Greeting Skeleton ───────────────────────────────────── */}
      <div className="space-y-1 px-1">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* ── KPI Cards Skeleton ──────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-2"
          >
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* ── Completion Board Skeleton ───────────────────────────── */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 pt-8 h-64">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      </div>

      {/* ── Two Columns: Coverage & Quick Actions ──────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 px-1">
        <div className="md:col-span-1 lg:col-span-4 rounded-lg border border-slate-200 dark:border-slate-700 p-6 h-64">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-1 lg:col-span-3 rounded-lg border border-slate-200 dark:border-slate-700 p-6 h-64">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Activity Skeleton ────────────────────────────── */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 pt-8">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
