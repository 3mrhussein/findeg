import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { Badge } from '@findeg/ui';
import type { Locale } from 'next-intl';
import { requirePermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { InvitationsPanel } from '../_components/InvitationsPanel';
import { StatusActions } from '../_components/StatusActions';
import { toStaffActor } from '../_lib/toStaffActor';

export const metadata = {
  title: 'Business Partner - FindEg Admins',
};

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await requirePermission(locale as Locale, {
    permission: PERMISSION_CODES.PARTNERS_MANAGE,
  });

  if (!/^\d+$/.test(id)) notFound();
  const partnerId = Number(id);
  const actor = toStaffActor(session);

  const { partners, invitations } = createPartnerMembershipServices();
  const partner = await partners.getPartner(actor, partnerId);
  if (!partner.success) notFound();
  const pending = await invitations.listPendingInvitations(actor, partnerId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{partner.data.nameEn}</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <span className="font-mono">{partner.data.code}</span>
            <Badge variant="outline">{partner.data.status}</Badge>
          </p>
        </div>
        <Link href={`/partners/${partnerId}/edit`} className="text-sm underline">
          Edit
        </Link>
      </div>
      <StatusActions
        partnerId={partnerId}
        current={partner.data.status}
        targets={partners.allowedStatusChanges(partner.data.status)}
      />
      <InvitationsPanel
        partnerId={partnerId}
        canChange={partner.data.status === 'onboarding' || partner.data.status === 'active'}
        invitations={(pending.success ? pending.data : []).map((invitation) => ({
          id: invitation.id,
          email: invitation.email,
          roles: invitation.roles,
          expiresAt: invitation.expiresAt.toISOString(),
        }))}
      />
    </div>
  );
}
