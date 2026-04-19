/**
 * AdminStatsBar
 *
 * Displays a row of 3 summary stat cards:
 * Total Admins | Active | Inactive
 *
 * Used at the top of the Team Management view.
 */

"use client";

import { useTranslations } from "next-intl";
import { type AdminUser } from "@hooks/useAdminUsers";

interface AdminStatsBarProps {
  admins: AdminUser[];
  loading: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "default" | "green" | "red";
  loading?: boolean;
}

/**
 *
 */
function StatCard({ label, value, accent = "default", loading }: StatCardProps) {
  const accentColor =
    accent === "green"
      ? "text-green-600 dark:text-green-400"
      : accent === "red"
        ? "text-red-600 dark:text-red-400"
        : "text-foreground";

  return (
    <div className="flex-1 rounded-lg border bg-card px-5 py-4 shadow-sm transition-all hover:shadow-md">
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-7 w-10 animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-3xl font-bold mt-1 tabular-nums ${accentColor}`}>{value}</p>
        </>
      )}
    </div>
  );
}

/**
 * Renders a horizontal row of stat cards computed from the admins array.
 */
export function AdminStatsBar({ admins, loading }: AdminStatsBarProps) {
  const t = useTranslations("Pages.Dashboard");
  const total = admins.length;
  const active = admins.filter((a) => a.isActive).length;
  const inactive = total - active;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
      role="region"
      aria-label={t("TeamStats")}
    >
      <StatCard label={t("TotalAdmins")} value={total} loading={loading} />
      <StatCard label={t("Active")} value={active} accent="green" loading={loading} />
      <StatCard label={t("Inactive")} value={inactive} accent="red" loading={loading} />
    </div>
  );
}
