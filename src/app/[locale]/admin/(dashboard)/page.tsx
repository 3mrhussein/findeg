import * as React from "react";
import { getTranslations } from "next-intl/server";
import { ServiceContainer } from "@/features/core/infrastructure/di/ServiceContainer";
import { requireAdmin } from "@/lib/auth-guard";
import {
  KpiCard,
  CatalogCompletionBoard,
  CategoryCoverageWidget,
  QuickActionsWidget,
  RecentActivityWidget,
} from "../_components/dashboard";

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  const session = await requireAdmin(locale as any);
  const t = await getTranslations({ locale: locale as any, namespace: "Administration.Dashboard" });

  const dashboardService = ServiceContainer.getInstance().adminDashboardService;
  const auditLogService = ServiceContainer.getInstance().auditLogService;

  const [rawCatalogStats, rawCategoryDist, rawRecentActivity] = await Promise.all([
    dashboardService.getCatalogHealthStats(),
    dashboardService.getCategoryProductDistribution(),
    (
      await auditLogService.getRecentActivity({
        limit: 8,
        entityTypes: ["product", "category", "brand", "tag"],
      })
    ).map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
  ]);

  // Ensure all data passed to client components are plain objects
  const catalogStats = JSON.parse(JSON.stringify(rawCatalogStats));
  const categoryDist = JSON.parse(JSON.stringify(rawCategoryDist));
  const recentActivity = JSON.parse(JSON.stringify(rawRecentActivity));

  const now = new Date();
  const hour = now.getHours();
  const greetingKey = (
    hour < 12 ? "GoodMorning" : hour < 18 ? "GoodAfternoon" : "GoodEvening"
  ) as any;
  const dateFormatted = now.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 space-y-6 pt-4">
      {/* ── Greeting ────────────────────────────────────────────── */}
      <div className="space-y-1 px-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t(greetingKey)}, {session.user.firstName || "Admin"} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{dateFormatted}</p>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4">
        <KpiCard
          title={t("TotalProducts")}
          value={catalogStats.totalProducts.toLocaleString(locale)}
          iconName="package"
          href={`/${locale}/admin/products`}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-500/10"
        />
        <KpiCard
          title={t("TotalCategories")}
          value={catalogStats.totalCategories.toLocaleString(locale)}
          iconName="layers"
          href={`/${locale}/admin/categories`}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-500/10"
        />
        <KpiCard
          title={t("TotalBrands")}
          value={catalogStats.totalBrands.toLocaleString(locale)}
          iconName="award"
          href={`/${locale}/admin/brands`}
          iconColor="text-orange-600 dark:text-orange-400"
          iconBg="bg-orange-50 dark:bg-orange-500/10"
        />
        <KpiCard
          title={t("CatalogCompletion")}
          value={`${
            catalogStats.totalProducts > 0
              ? Math.round((catalogStats.fullyComplete / catalogStats.totalProducts) * 100)
              : 0
          }%`}
          iconName="check-circle"
          href={`/${locale}/admin/products`}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          change={{
            value: catalogStats.fullyComplete,
            label: t("KPIs.FullyComplete"), // Reusing existing key if appropriate or just passing string
            direction: "up",
          }}
        />
      </div>

      {/* ── Catalog Completion Board ────────────────────────────── */}
      <div id="catalog-board" className="pt-2 px-4">
        <CatalogCompletionBoard stats={catalogStats} />
      </div>

      {/* ── Two Columns: Coverage & Quick Actions ───────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 px-4">
        <div id="category-coverage" className="md:col-span-1 lg:col-span-4 h-full">
          <CategoryCoverageWidget distributions={categoryDist} />
        </div>
        <div id="quick-actions" className="md:col-span-1 lg:col-span-3 h-full">
          <QuickActionsWidget />
        </div>
      </div>

      {/* ── Recent Activity ─────────────────────────────────────── */}
      <div id="recent-activity" className="pt-2 px-4">
        <RecentActivityWidget logs={recentActivity} locale={locale} />
      </div>
    </div>
  );
}
