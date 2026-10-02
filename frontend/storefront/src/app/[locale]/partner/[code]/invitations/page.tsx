import { notFound } from 'next/navigation';
import {
  createPartnerMembershipServices,
  PARTNER_ADMINISTRATOR,
} from '@findeg/backend/features/partner-membership';
import { Link } from '@i18n/navigation';
import { PartnerSuspense, requireWorkspaceAccess } from '../../_components/PartnerShell';
import { canChangeMembers, partnerActor } from '../_lib/access';
import { InvitationsPanel } from './InvitationsPanel';

export default async function PartnerInvitationsPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  return (
    <PartnerSuspense label="Loading invitations…">
      <Invitations locale={locale} code={code} />
    </PartnerSuspense>
  );
}

async function Invitations({ locale, code }: { locale: string; code: string }) {
  // Readable while suspended; changes need an onboarding or active partner (`canChangeMembers`),
  // which the service enforces again.
  const access = await requireWorkspaceAccess(code, [PARTNER_ADMINISTRATOR], 'read');
  if (!access.allowed) return access.notice;
  const { context } = access;

  const result = await createPartnerMembershipServices().invitations.listPendingInvitations(
    partnerActor(context),
    context.partner.id,
  );
  if (!result.success) notFound();

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl space-y-6 p-6 py-12">
      <div>
        <Link href={`/partner/${code}`} className="text-sm text-muted-foreground">
          ← {context.partner.nameEn}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Invitations</h1>
      </div>
      <InvitationsPanel
        locale={locale}
        code={code}
        canChange={canChangeMembers(context)}
        invitations={result.data.map((invitation) => ({
          id: invitation.id,
          email: invitation.email,
          roles: invitation.roles,
          expiresAt: invitation.expiresAt.toISOString(),
        }))}
      />
    </main>
  );
}
