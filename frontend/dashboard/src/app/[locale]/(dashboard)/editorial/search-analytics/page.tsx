import { requireAdmin } from '@lib/auth-guard';
import { SearchAnalyticsView } from './_components/SearchAnalyticsView';
import type { Locale } from 'next-intl';

/**
 *
 */
export default async function SearchAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ days?: string }>;
}) {
  const { locale } = await params;
  const { days: daysParam } = await searchParams;
  const days = daysParam ? parseInt(daysParam) : 7;

  // Authorization check (SuperAdmin or Editorial role)
  const session = await requireAdmin(locale as Locale);
  const isEditorial =
    session.activeRoleIds?.includes('EDITORIAL') || session.activeRoleIds?.includes('SUPER_ADMIN');

  if (!isEditorial) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-500">You do not have permission to view search analytics.</p>
      </div>
    );
  }

  // TODO: Replace with data layer queries from @data/search-analytics/queries
  const metrics = {} as React.ComponentProps<typeof SearchAnalyticsView>['initialData']['metrics']; // Stubbed
  const topSearches: React.ComponentProps<
    typeof SearchAnalyticsView
  >['initialData']['topSearches'] = []; // Stubbed
  const zeroResults: React.ComponentProps<
    typeof SearchAnalyticsView
  >['initialData']['zeroResults'] = []; // Stubbed
  const lowCTR: React.ComponentProps<typeof SearchAnalyticsView>['initialData']['lowCTR'] = []; // Stubbed
  const languageBreakdown: React.ComponentProps<
    typeof SearchAnalyticsView
  >['initialData']['languageBreakdown'] = []; // Stubbed

  return (
    <SearchAnalyticsView
      initialData={{
        metrics,
        topSearches,
        zeroResults,
        lowCTR,
        languageBreakdown,
        days,
      }}
    />
  );
}
