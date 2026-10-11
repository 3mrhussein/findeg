import { getOrderStats, getRecentOrders } from '@data/orders/queries';
import { DashboardOrdersWidget } from './DashboardOrdersWidget';
/**
 * Dashboard Widget Components for Nested Suspense
 *
 * These components are separated for independent loading:
 * - FastSection: KPI cards and greeting (renders immediately)
 * - MediumSection: Catalog completion board (renders in ~500ms)
 * - SlowSection: Analytics, coverage charts, activity (renders in > 1000ms)
 */

import { getTranslations } from 'next-intl/server';
import { type Locale } from '@findeg/backend/features/core';
import {
  getCatalogHealthStats,
  getCategoryProductDistribution,
  getRecentActivity,
} from '@data/admin/queries';
import { countExhaustedOutbox, listExhaustedOutbox } from '@findeg/backend/features/outbox';
import {
  KpiCard,
  OutboxHealthWidget,
  CatalogCompletionBoard,
  CategoryCoverageWidget,
  QuickActionsWidget,
  RecentActivityWidget,
} from '../../_components/dashboard';

interface DashboardWidgetProps {
  locale: string;
}

/**
 * Fast Section: Greeting + KPI Cards
 * Renders immediately with ~50ms of queries (simple counts)
 */
export async function FastDashboardSection({ locale }: DashboardWidgetProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: 'Administration.Dashboard',
  });

  // Quick queries only - single round-trip
  const catalogStats = await getCatalogHealthStats();

  const now = new Date();
  const hour = now.getHours();
  const greetingKey = (hour < 12 ? 'GoodMorning' : hour < 18 ? 'GoodAfternoon' : 'GoodEvening') as
    'GoodMorning' | 'GoodAfternoon' | 'GoodEvening';
  const dateFormatted = now.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const firstName = 'Admin';

  return (
    <>
      {/* Greeting */}
      <div className="space-y-1 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t(greetingKey)}, {firstName} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{dateFormatted}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
        <KpiCard
          title={t('TotalProducts')}
          value={catalogStats.totalProducts.toLocaleString(locale)}
          iconName="package"
          href="/products"
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-500/10"
        />
        <KpiCard
          title={t('TotalCategories')}
          value={catalogStats.totalCategories.toLocaleString(locale)}
          iconName="layers"
          href="/categories"
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-500/10"
        />
        <KpiCard
          title={t('TotalBrands')}
          value={catalogStats.totalBrands.toLocaleString(locale)}
          iconName="award"
          href="/brands"
          iconColor="text-orange-600 dark:text-orange-400"
          iconBg="bg-orange-50 dark:bg-orange-500/10"
        />
        <KpiCard
          title={t('CatalogCompletion')}
          value={`${
            catalogStats.totalProducts > 0
              ? Math.round((catalogStats.fullyComplete / catalogStats.totalProducts) * 100)
              : 0
          }%`}
          iconName="check-circle"
          href="/products"
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          change={{
            value: catalogStats.fullyComplete,
            label: t('KPIs.FullyComplete'),
            direction: 'up',
          }}
        />
      </div>
    </>
  );
}

/**
 * Medium Section: Catalog Completion Board
 * Renders after ~500ms (aggregation query)
 */
export async function MediumDashboardSection({ locale: _locale }: DashboardWidgetProps) {
  const catalogStats = await getCatalogHealthStats();

  return (
    <div id="catalog-board" className="pt-2 px-1">
      <CatalogCompletionBoard stats={catalogStats} />
    </div>
  );
}

/**
 * Slow Section: Category Coverage + Recent Activity
 * Renders after ~1000ms (heavy queries with joins)
 */
export async function SlowDashboardSection({ locale }: DashboardWidgetProps) {
  // Heavy queries - parallel loading
  const [categoryDist, recentActivity, exhaustedOutbox, exhaustedCount] = await Promise.all([
    getCategoryProductDistribution(),
    getRecentActivity({
      limit: 8,
      entityTypes: ['product', 'category', 'brand', 'tag'],
    }),
    listExhaustedOutbox(),
    countExhaustedOutbox(),
  ]);

  return (
    <>
      <div id="outbox-health" className="px-1">
        <OutboxHealthWidget
          exhaustedCount={exhaustedCount}
          rows={exhaustedOutbox.map(({ id, kind, lastError }) => ({ id, kind, lastError }))}
        />
      </div>

      {/* Two Columns: Coverage & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 px-1">
        <div id="category-coverage" className="md:col-span-1 lg:col-span-4 h-full">
          <CategoryCoverageWidget distributions={categoryDist} />
        </div>
        <div id="quick-actions" className="md:col-span-1 lg:col-span-3 h-full">
          <QuickActionsWidget />
        </div>
      </div>

      {/* Recent Activity */}
      <div id="recent-activity" className="pt-2 px-1">
        <RecentActivityWidget logs={recentActivity} locale={locale} />
      </div>
    </>
  );
}

/** Independent home Orders reads share the same invalidated data layer as Orders workflows. */
export async function OrdersDashboardSection({ locale }: DashboardWidgetProps) {
  const [stats, recentOrders, t] = await Promise.all([
    getOrderStats(),
    getRecentOrders(),
    getTranslations({ locale }),
  ]);
  return (
    <DashboardOrdersWidget
      locale={locale}
      stats={stats}
      recentOrders={recentOrders}
      labels={{
        revenue: t('Administration.Dashboard.Kpi.TotalRevenue'),
        orders: t('Administration.Dashboard.Kpi.TotalOrders'),
        distribution: t('Administration.Dashboard.OrderStatusChart.Title'),
        recent: t('Administration.Dashboard.RecentOrders.Title'),
        viewAll: t('Administration.Dashboard.RecentOrders.ViewAll'),
        empty: t('Administration.Shared.EmptyState.NoData'),
        reference: t('Administration.Dashboard.RecentOrders.Order'),
        total: t('Administration.Dashboard.RecentOrders.Total'),
        status: t('Administration.Dashboard.RecentOrders.Status'),
        statuses: {
          pending: t('Administration.Shared.StatusBadge.Pending'),
          confirmed: t('Administration.Shared.StatusBadge.Confirmed'),
          processing: t('Administration.Shared.StatusBadge.Processing'),
          shipped: t('Administration.Shared.StatusBadge.Shipped'),
          delivered: t('Administration.Shared.StatusBadge.Delivered'),
          cancelled: t('Administration.Shared.StatusBadge.Cancelled'),
          refunded: t('Administration.Shared.StatusBadge.Refunded'),
        },
      }}
    />
  );
}
