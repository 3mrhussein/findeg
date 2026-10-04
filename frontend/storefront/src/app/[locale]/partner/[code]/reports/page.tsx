import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import {
  createPartnerRewardsServices,
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
  PARTNER_REPORT_ROLES,
} from '@findeg/backend/features/partner-rewards';
import {
  PartnerNotice,
  PartnerSuspense,
  requireWorkspaceAccess,
} from '../../_components/PartnerShell';
import { PartnerReportView } from './_components/PartnerReportView';
import { toPartnerReportProps } from './_lib/partnerReport';

export default async function PartnerReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; code: string }>;
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { code } = await params;
  const t = await getTranslations('PartnerReports');
  return (
    <PartnerSuspense label={t('loading')}>
      <Reports code={code} searchParams={searchParams} />
    </PartnerSuspense>
  );
}

async function Reports({
  code,
  searchParams,
}: {
  code: string;
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { month: monthParam } = await searchParams;
  const month = typeof monthParam === 'string' ? monthParam : undefined;
  // `reports` stays open for every Business Partner status, closed included (ADR-0010).
  const access = await requireWorkspaceAccess(code, PARTNER_REPORT_ROLES, 'reports');
  if (!access.allowed) return access.notice;
  const { partner, membership } = access.context;

  const locale = await getLocale();
  const t = await getTranslations('PartnerReports');
  const reports = createPartnerRewardsServices().partnerReports;
  const read = (selected?: string) =>
    reports.getPartnerReport({ userId: membership.userId }, partner.id, {
      month: selected,
      locale: locale === 'ar' ? 'ar' : 'en',
    });
  let result = await read(month);
  // A hand-edited `?month=` outside the picker falls back to the current month.
  if (!result.success && result.error === 'invalid-input' && month !== undefined) {
    result = await read();
  }
  if (!result.success) notFound();

  return (
    <PartnerNotice
      title={t('title')}
      description={locale === 'ar' ? partner.nameAr : partner.nameEn}
    >
      <div className="space-y-4">
        <Link href={`/partner/${code}`} className="text-sm hover:text-primary">
          {t('back')}
        </Link>
        <PartnerReportView
          report={toPartnerReportProps(result.data, locale)}
          minOrdersPerRow={MIN_DISTINCT_ORDERS_PER_SALES_ROW}
        />
      </div>
    </PartnerNotice>
  );
}
