import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@findeg/ui';
import type { Locale } from 'next-intl';
import { requirePermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { createPartnerRewardsServices } from '@findeg/backend/features/partner-rewards';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { MembersPanel } from '../_components/MembersPanel';
import { InvitationsPanel } from '../_components/InvitationsPanel';
import { RewardRatesPanel } from '../_components/RewardRatesPanel';
import { StatusActions } from '../_components/StatusActions';
import { saveRewardRateAction } from '../_actions/reward-rates';
import { toStaffActor } from '../_lib/toStaffActor';
import { toListActor } from '../../school-lists/_lib/toListActor';

export const metadata = { title: 'Business Partner - FindEg Admins' };

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await requirePermission(locale as Locale, {
    any: [PERMISSION_CODES.PARTNERS_MANAGE, PERMISSION_CODES.REWARDS_VIEW],
  });
  if (!/^\d+$/.test(id)) notFound();

  const partnerId = Number(id);
  const actor = toStaffActor(session);
  const isSystemAdmin = session.activeRoleIds?.includes('system_admin') === true;
  const canManagePartner =
    isSystemAdmin || session.permissionCodes?.includes(PERMISSION_CODES.PARTNERS_MANAGE) === true;
  const canViewRewards =
    isSystemAdmin || session.permissionCodes?.includes(PERMISSION_CODES.REWARDS_VIEW) === true;
  const canManageRates =
    isSystemAdmin ||
    session.permissionCodes?.includes(PERMISSION_CODES.REWARDS_RATES_MANAGE) === true;

  const { partners, invitations, memberships } = createPartnerMembershipServices();
  const partner = await partners.getPartner(actor, partnerId);
  if (!partner.success) notFound();

  const [members, pending, lists, rates] = await Promise.all([
    canManagePartner ? memberships.listMembers(actor, partnerId) : Promise.resolve(null),
    canManagePartner ? invitations.listPendingInvitations(actor, partnerId) : Promise.resolve(null),
    canManagePartner
      ? createAdministrationServices().schoolSupplyLists.listForPartner(
          toListActor(session),
          partnerId,
        )
      : Promise.resolve(null),
    canViewRewards
      ? createPartnerRewardsServices().rates.getRates(session, partnerId)
      : Promise.resolve(null),
  ]);
  const canChange = partner.data.status === 'onboarding' || partner.data.status === 'active';
  const saveRate = saveRewardRateAction.bind(null, locale as Locale, partnerId);

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
        {canManagePartner && (
          <Link href={`/partners/${partnerId}/edit`} className="text-sm underline">
            Edit
          </Link>
        )}
      </div>

      <Tabs defaultValue={canManagePartner ? 'overview' : 'rewards'} className="space-y-6">
        <TabsList>
          {canManagePartner && <TabsTrigger value="overview">Overview</TabsTrigger>}
          {canViewRewards && <TabsTrigger value="rewards">Rewards</TabsTrigger>}
        </TabsList>

        {canManagePartner && (
          <TabsContent value="overview" className="space-y-6">
            <StatusActions
              partnerId={partnerId}
              current={partner.data.status}
              targets={partners.allowedStatusChanges(partner.data.status)}
            />
            {members?.success ? (
              <MembersPanel
                canChange={canChange}
                members={members.data.map((member) => ({
                  id: member.id,
                  email: member.email,
                  name: [member.firstName, member.lastName].filter(Boolean).join(' '),
                  roles: member.roles,
                  status: member.status,
                  authorizationVersion: member.authorizationVersion,
                }))}
              />
            ) : (
              <p role="alert" className="text-destructive text-sm">
                Members could not be loaded. You may not have permission to manage this Business
                Partner.
              </p>
            )}
            {lists?.success && lists.data.length > 0 && (
              <section className="space-y-2" data-testid="supply-lists">
                <h2 className="text-xl font-semibold">School Supply Lists</h2>
                <ul className="divide-y rounded-lg border">
                  {lists.data.map((list) => (
                    <li key={list.id} className="flex items-center justify-between px-4 py-3">
                      <span>
                        {list.localizedTitle.en ?? list.localizedTitle.ar ?? `List ${list.id}`} ·{' '}
                        {list.grade} · {list.academicYear}
                      </span>
                      <span className="flex items-center gap-3">
                        <Badge variant="outline">{list.status}</Badge>
                        <Link href={`/school-lists/${list.id}`} className="text-sm underline">
                          Offer
                        </Link>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <InvitationsPanel
              partnerId={partnerId}
              canChange={canChange}
              invitations={(pending?.success ? pending.data : []).map((invitation) => ({
                id: invitation.id,
                email: invitation.email,
                roles: invitation.roles,
                expiresAt: invitation.expiresAt.toISOString(),
              }))}
            />
          </TabsContent>
        )}

        {canViewRewards && rates?.success && (
          <TabsContent value="rewards">
            <RewardRatesPanel
              current={
                rates.data.current
                  ? { ...rates.data.current, createdAt: rates.data.current.createdAt.toISOString() }
                  : null
              }
              history={rates.data.history.map((rate) => ({
                ...rate,
                createdAt: rate.createdAt.toISOString(),
              }))}
              canManage={canManageRates}
              save={saveRate}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
