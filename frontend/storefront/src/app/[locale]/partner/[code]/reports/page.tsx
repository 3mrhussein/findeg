import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { PARTNER_ADMINISTRATOR } from '@findeg/backend/features/partner-membership';
import {
  createPartnerRewardsServices,
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
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
  const { month } = await searchParams;
  return (
    <PartnerSuspense label="Loading reports…">
      <Reports code={code} month={typeof month === 'string' ? month : undefined} />
    </PartnerSuspense>
  );
}

async function Reports({ code, month }: { code: string; month?: string }) {
  // `reports` stays open for every Business Partner status, closed included (ADR-0010).
  const access = await requireWorkspaceAccess(
    code,
    [PARTNER_ADMINISTRATOR, 'report-viewer'],
    'reports',
  );
  if (!access.allowed) return access.notice;
  const { partner, membership } = access.context;

  const locale = await getLocale();
  const t = await getTranslations('PartnerReports');
  const result = await createPartnerRewardsServices().partnerReports.getPartnerReport(
    { userId: membership.userId },
    partner.id,
    { month, locale: locale === 'ar' ? 'ar' : 'en' },
  );
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
