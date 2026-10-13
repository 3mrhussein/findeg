import { Link } from '@i18n/navigation';
import { Badge, Button, Input, Label } from '@findeg/ui';
import { SUPPLY_LIST_STATUSES, type Locale, type SupplyListStatus } from '@findeg/domain';
import { getTranslations } from 'next-intl/server';
import { requirePermission, sessionHasPermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { getSchoolSupplyLists } from '@data/school-lists/queries';
import { getSchoolListPartnerOptions } from '@data/school-lists/queries';

export const metadata = {
  title: 'School Supply Lists - FindEg Admins',
};

interface SearchParams {
  partnerId?: string;
  academicYear?: string;
  grade?: string;
  status?: string;
}

export default async function SchoolSupplyListsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: 'SchoolLists' });
  const session = await requirePermission(locale as Locale, {
    any: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ, PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE],
  });
  const canWrite = sessionHasPermission(session, PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE);

  const partnersRes = await getSchoolListPartnerOptions(session);
  const partners = partnersRes.success ? partnersRes.data : [];

  const partnerId = resolvedSearchParams.partnerId
    ? Number(resolvedSearchParams.partnerId)
    : undefined;
  const academicYear = resolvedSearchParams.academicYear?.trim() || undefined;
  const grade = resolvedSearchParams.grade?.trim() || undefined;
  const statusParam = resolvedSearchParams.status;
  const status =
    statusParam && SUPPLY_LIST_STATUSES.includes(statusParam as SupplyListStatus)
      ? (statusParam as SupplyListStatus)
      : undefined;

  const listsRes = await getSchoolSupplyLists(session, {
    businessPartnerId: partnerId,
    academicYear,
    grade,
    status,
  });

  const lists = listsRes.success ? listsRes.data : [];

  const getStatusBadge = (s: SupplyListStatus) => {
    switch (s) {
      case 'published':
        return <Badge variant="default">{t('StatusPublished')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('StatusDraft')}</Badge>;
      case 'archived':
        return <Badge variant="outline">{t('StatusArchived')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Title')}</h1>
          <p className="text-muted-foreground mt-2">{t('Subtitle')}</p>
        </div>
        {canWrite && (
          <Button asChild data-testid="new-list-draft-btn">
            <Link href="/school-lists/new">{t('New')}</Link>
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <form
        method="GET"
        className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 md:grid-cols-5"
        data-testid="school-lists-filters"
      >
        <div className="space-y-1">
          <Label htmlFor="filter-partner">{t('Partner')}</Label>
          <select
            id="filter-partner"
            name="partnerId"
            defaultValue={resolvedSearchParams.partnerId ?? ''}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            data-testid="filter-partner-select"
          >
            <option value="">{t('AllPartners')}</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {locale === 'ar' ? p.nameAr || p.nameEn : p.nameEn || p.nameAr}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-year">{t('AcademicYear')}</Label>
          <Input
            id="filter-year"
            name="academicYear"
            defaultValue={resolvedSearchParams.academicYear ?? ''}
            placeholder={t('AcademicYear')}
            data-testid="filter-year-input"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-grade">{t('Grade')}</Label>
          <Input
            id="filter-grade"
            name="grade"
            defaultValue={resolvedSearchParams.grade ?? ''}
            placeholder={t('Grade')}
            data-testid="filter-grade-input"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-status">{t('Status')}</Label>
          <select
            id="filter-status"
            name="status"
            defaultValue={resolvedSearchParams.status ?? ''}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            data-testid="filter-status-select"
          >
            <option value="">{t('AllStatuses')}</option>
            <option value="draft">{t('StatusDraft')}</option>
            <option value="published">{t('StatusPublished')}</option>
            <option value="archived">{t('StatusArchived')}</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="w-full" data-testid="filter-submit-btn">
            {t('Filter')}
          </Button>
          <Button variant="outline" asChild data-testid="filter-clear-btn">
            <Link href="/school-lists">{t('Clear')}</Link>
          </Button>
        </div>
      </form>

      {/* Lists table */}
      <div className="overflow-hidden rounded-lg border bg-card shadow">
        <table className="min-w-full divide-y divide-border" data-testid="school-lists-table">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('Partner')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('AcademicYear')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('Grade')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('ListTitle')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('Items')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('Status')}
              </th>
              <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-muted-foreground" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lists.map((list) => {
              const partnerName =
                locale === 'ar'
                  ? list.businessPartnerNameAr || list.businessPartnerNameEn
                  : list.businessPartnerNameEn || list.businessPartnerNameAr;
              const title =
                (locale === 'ar' ? list.localizedTitle.ar : list.localizedTitle.en) ||
                list.localizedTitle.en ||
                list.localizedTitle.ar ||
                '—';

              return (
                <tr key={list.id} data-testid="school-list-row" data-list-id={list.id}>
                  <td className="px-6 py-4 text-sm font-medium">{partnerName}</td>
                  <td className="px-6 py-4 text-sm">{list.academicYear}</td>
                  <td className="px-6 py-4 text-sm">{list.grade}</td>
                  <td className="px-6 py-4 text-sm">{title}</td>
                  <td className="px-6 py-4 text-sm">{t('ItemCount', { count: list.itemCount })}</td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(list.status)}</td>
                  <td className="px-6 py-4 text-end text-sm">
                    <Link
                      href={`/school-lists/${list.id}`}
                      className="text-primary hover:underline"
                      data-testid={`view-list-${list.id}`}
                    >
                      {list.status === 'draft' && canWrite ? t('Edit') : t('View')}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {lists.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-muted-foreground"
                  data-testid="no-lists-message"
                >
                  {t('Empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
