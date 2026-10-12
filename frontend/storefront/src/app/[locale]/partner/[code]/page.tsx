import { Button } from '@findeg/ui';
import { getTranslations } from 'next-intl/server';
import { PARTNER_ADMINISTRATOR } from '@findeg/backend/features/partner-membership';
import { canReadPartnerReports } from '@findeg/backend/features/partner-sales';
import { Link } from '@i18n/navigation';
import {
  PartnerNotice,
  PartnerSuspense,
  requireWorkspaceAccess,
} from '../_components/PartnerShell';
import { LeaveButton } from './LeaveButton';

export default async function PartnerWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const tWorkspace = await getTranslations({ locale, namespace: 'PartnerWorkspace' });
  return (
    <PartnerSuspense label={tWorkspace('Loading')}>
      <PartnerWorkspace locale={locale} code={code} />
    </PartnerSuspense>
  );
}

async function PartnerWorkspace({ locale, code }: { locale: string; code: string }) {
  // A closed Business Partner only exposes Reports; the workspace home is not one of them.
  const access = await requireWorkspaceAccess(code, 'any', 'read');
  if (!access.allowed) return access.notice;

  const { partner, membership } = access.context;
  const t = await getTranslations({ locale, namespace: 'PartnerReports' });
  const tWorkspace = await getTranslations({ locale, namespace: 'PartnerWorkspace' });
  const isAr = locale === 'ar';
  return (
    <PartnerNotice
      title={isAr ? partner.nameAr : partner.nameEn}
      description={isAr ? partner.nameEn : partner.nameAr}
    >
      <h2 className="font-semibold text-foreground">{tWorkspace('YourRoles')}</h2>
      <ul className="mt-3 list-inside list-disc">
        {membership.roles.map((role) => (
          <li key={role}>
            {tWorkspace(`Roles.${role}`)} ({role})
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-start gap-3">
        {membership.roles.includes(PARTNER_ADMINISTRATOR) && (
          <>
            <Button asChild variant="outline">
              <Link href={`/partner/${code}/members`}>{tWorkspace('Members')}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/partner/${code}/invitations`}>{tWorkspace('Invitations')}</Link>
            </Button>
          </>
        )}
        {canReadPartnerReports(membership.roles) && (
          <Button asChild variant="outline">
            <Link href={`/partner/${code}/reports`}>{t('linkLabel')}</Link>
          </Button>
        )}
        <LeaveButton code={code} />
      </div>
    </PartnerNotice>
  );
}
