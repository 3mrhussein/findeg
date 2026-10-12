import { getTranslations } from 'next-intl/server';
import { Link } from '@i18n/navigation';
import { PARTNER_ADMINISTRATOR } from '@findeg/backend/features/partner-membership';
import { getPartnerMembers } from '@data/partner/queries';
import {
  PartnerNotice,
  PartnerSuspense,
  requireWorkspaceAccess,
} from '../../_components/PartnerShell';
import { canChangeMembers } from '../_lib/access';
import { MembersList, type MemberRow } from './MembersList';

export default async function PartnerMembersPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const tWorkspace = await getTranslations({ locale, namespace: 'PartnerWorkspace' });
  return (
    <PartnerSuspense label={tWorkspace('Loading')}>
      <Members locale={locale} code={code} />
    </PartnerSuspense>
  );
}

async function Members({ locale, code }: { locale: string; code: string }) {
  const access = await requireWorkspaceAccess(code, [PARTNER_ADMINISTRATOR], 'read');
  if (!access.allowed) return access.notice;
  const { partner, membership } = access.context;
  const tWorkspace = await getTranslations({ locale, namespace: 'PartnerWorkspace' });
  const tReports = await getTranslations({ locale, namespace: 'PartnerReports' });

  const rawMembers = await getPartnerMembers(
    { kind: 'partner', userId: membership.userId },
    partner.id,
  );

  const members = rawMembers.flatMap((member): MemberRow[] =>
    member.status === 'ended'
      ? []
      : [
          {
            id: member.id,
            email: member.email,
            name: [member.firstName, member.lastName].filter(Boolean).join(' '),
            roles: member.roles,
            status: member.status,
            authorizationVersion: member.authorizationVersion,
            isSelf: member.userId === membership.userId,
          },
        ],
  );

  return (
    <PartnerNotice
      title={tWorkspace('MembersTitle')}
      description={locale === 'ar' ? partner.nameAr : partner.nameEn}
    >
      <div className="space-y-4">
        <Link href={`/partner/${code}`} className="text-sm hover:text-primary">
          {tReports('back')}
        </Link>
        <MembersList code={code} canChange={canChangeMembers(access.context)} members={members} />
      </div>
    </PartnerNotice>
  );
}
