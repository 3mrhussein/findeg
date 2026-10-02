import { Link } from '@i18n/navigation';
import {
  createPartnerMembershipServices,
  PARTNER_ADMINISTRATOR,
} from '@findeg/backend/features/partner-membership';
import { notFound } from 'next/navigation';
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
  const { code } = await params;
  return (
    <PartnerSuspense label="Loading members…">
      <Members code={code} />
    </PartnerSuspense>
  );
}

async function Members({ code }: { code: string }) {
  const access = await requireWorkspaceAccess(code, [PARTNER_ADMINISTRATOR], 'read');
  if (!access.allowed) return access.notice;
  const { partner, membership } = access.context;

  const result = await createPartnerMembershipServices().memberships.listMembers(
    { kind: 'partner', userId: membership.userId },
    partner.id,
  );
  if (!result.success) notFound();

  const members = result.data.flatMap((member): MemberRow[] =>
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
    <PartnerNotice title="Members" description={partner.nameEn}>
      <div className="space-y-4">
        <Link href={`/partner/${code}`} className="text-sm hover:text-primary">
          ← Back to workspace
        </Link>
        <MembersList code={code} canChange={canChangeMembers(access.context)} members={members} />
      </div>
    </PartnerNotice>
  );
}
