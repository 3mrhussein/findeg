import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { getCachedPartnerContext } from '@data/partner/queries';
import { Link } from '@i18n/navigation';
import { isPartnerAdministrator, isPartnerOpen } from '../_lib/access';
import { InvitationsPanel } from './InvitationsPanel';

export default async function PartnerInvitationsPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-8">Loading invitations…</main>}>
      <Invitations locale={locale} code={code} />
    </Suspense>
  );
}

async function Invitations({ locale, code }: { locale: string; code: string }) {
  const context = await getCachedPartnerContext(code);
  if (!context.success || !isPartnerAdministrator(context.data)) notFound();
  const { partner, membership } = context.data;

  const result = await createPartnerMembershipServices().invitations.listPendingInvitations(
    { kind: 'partner', userId: membership.userId },
    partner.id,
  );
  if (!result.success) notFound();

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl space-y-6 p-6 py-12">
      <div>
        <Link href={`/partner/${code}`} className="text-sm text-muted-foreground">
          ← {partner.nameEn}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Invitations</h1>
      </div>
      <InvitationsPanel
        locale={locale}
        code={code}
        canChange={isPartnerOpen(context.data)}
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
