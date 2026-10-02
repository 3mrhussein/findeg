import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { getCachedPartnerContext } from '@data/partner/queries';
import { Link } from '@i18n/navigation';
import { isPartnerAdministrator, isPartnerOpen } from '../_lib/access';
import { MembersList } from './MembersList';

export default async function PartnerMembersPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { code } = await params;
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-8">Loading members…</main>}>
      <Members code={code} />
    </Suspense>
  );
}

async function Members({ code }: { code: string }) {
  const context = await getCachedPartnerContext(code);
  if (!context.success || !isPartnerAdministrator(context.data)) notFound();
  const { partner, membership } = context.data;

  const result = await createPartnerMembershipServices().memberships.listMembers(
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
        <h1 className="mt-2 text-2xl font-semibold">Members</h1>
      </div>
      <MembersList
        code={code}
        canChange={isPartnerOpen(context.data)}
        members={result.data.flatMap((member) =>
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
        )}
      />
    </main>
  );
}
