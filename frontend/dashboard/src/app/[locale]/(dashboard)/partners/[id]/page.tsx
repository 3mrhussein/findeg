import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@findeg/ui';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { requirePermission, sessionHasPermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import {
  createPartnerSalesServices,
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
  type IPartnerReportService,
  type PartnerSalesStaffActor,
} from '@findeg/backend/features/partner-sales';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { MembersPanel } from '../_components/MembersPanel';
import { InvitationsPanel } from '../_components/InvitationsPanel';
import { SalesReportPanel } from '../_components/SalesReportPanel';
import { StatusActions } from '../_components/StatusActions';
import { toSalesReportProps } from '../_lib/salesReport';
import { toStaffActor } from '../_lib/toStaffActor';
import { toListActor } from '../../school-lists/_lib/toListActor';

export const metadata = { title: 'Business Partner - FindEg Admins' };

/** An unknown or out-of-range `?month=` falls back to the current month. */
async function readReport(
  reports: IPartnerReportService,
  session: PartnerSalesStaffActor,
  partnerId: number,
  month: string | undefined,
) {
  const requested = await reports.getStaffReport(session, partnerId, { month });
  return month !== undefined && !requested.success && requested.error === 'invalid-input'
    ? reports.getStaffReport(session, partnerId)
    : requested;
}

export default async function PartnerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'PartnerSales' });
  const { month: monthParam } = await searchParams;
  const month = typeof monthParam === 'string' ? monthParam : undefined;
  const session = await requirePermission(locale as Locale, {
    any: [PERMISSION_CODES.PARTNERS_MANAGE, PERMISSION_CODES.PARTNER_REPORTS_VIEW],
  });
  if (!/^\d+$/.test(id)) notFound();

  const partnerId = Number(id);
  const actor = toStaffActor(session);
  const canManagePartner = sessionHasPermission(session, PERMISSION_CODES.PARTNERS_MANAGE);
  const canViewReports = sessionHasPermission(session, PERMISSION_CODES.PARTNER_REPORTS_VIEW);

  const { partners, invitations, memberships } = createPartnerMembershipServices();
  const partner = await partners.getPartner(actor, partnerId);
  if (!partner.success) notFound();

  const [members, pending, lists, report] = await Promise.all([
    canManagePartner ? memberships.listMembers(actor, partnerId) : Promise.resolve(null),
    canManagePartner ? invitations.listPendingInvitations(actor, partnerId) : Promise.resolve(null),
    canManagePartner
      ? createAdministrationServices().schoolSupplyLists.listForPartner(
          toListActor(session),
          partnerId,
        )
      : Promise.resolve(null),
    canViewReports
      ? readReport(createPartnerSalesServices().partnerReports, session, partnerId, month)
      : null,
  ]);
  const canChange = partner.data.status === 'onboarding' || partner.data.status === 'active';

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

      <Tabs defaultValue={canManagePartner && !month ? 'overview' : 'sales'} className="space-y-6">
        <TabsList>
          {canManagePartner && <TabsTrigger value="overview">Overview</TabsTrigger>}
          {canViewReports && <TabsTrigger value="sales">{t('Tab')}</TabsTrigger>}
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

        {canViewReports && (
          <TabsContent value="sales" className="space-y-6">
            {report?.success ? (
              <SalesReportPanel
                report={toSalesReportProps(report.data)}
                minOrdersPerRow={MIN_DISTINCT_ORDERS_PER_SALES_ROW}
                messages={{
                  empty: t('Empty'),
                  title: (selectedMonth) => t('Title', { month: selectedMonth }),
                  description: (minOrders) => t('Description', { minOrdersPerRow: minOrders }),
                  month: t('Month'),
                  show: t('Show'),
                  noSales: t('NoSales'),
                  list: t('List'),
                  listItem: t('ListItem'),
                  product: t('Product'),
                  variant: t('Variant'),
                  orders: t('Orders'),
                  units: t('Units'),
                  sales: t('Sales'),
                  total: t('Total'),
                  asOf: (date) => t('AsOf', { date }),
                }}
              />
            ) : (
              <p role="alert" className="text-destructive text-sm">
                {t('LoadError')}
              </p>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
