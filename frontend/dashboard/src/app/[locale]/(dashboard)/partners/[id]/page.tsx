import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@findeg/ui';
import { allowedPartnerStatusChanges, type Locale } from '@findeg/domain';
import { getTranslations } from 'next-intl/server';
import { requirePermission, sessionHasPermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import {
  getPartner,
  getPartnerSchoolProfile,
  listMembers,
  listPendingInvitations,
  getPartnerStaffReport,
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
} from '@data/partners/queries';
import { listSchoolSupplyListsForPartner } from '@data/school-lists/queries';
import { MembersPanel } from '../_components/MembersPanel';
import { InvitationsPanel } from '../_components/InvitationsPanel';
import { SalesReportPanel } from '../_components/SalesReportPanel';
import { StatusActions } from '../_components/StatusActions';
import { toSalesReportProps } from '../_lib/salesReport';

export const metadata = { title: 'Business Partner - FindEg Admins' };

export default async function PartnerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'PartnerSales' });
  const tPartners = await getTranslations({ locale, namespace: 'Partners' });
  const { month: monthParam } = await searchParams;
  const month = typeof monthParam === 'string' ? monthParam : undefined;
  const session = await requirePermission(locale as Locale, {
    any: [PERMISSION_CODES.PARTNERS_MANAGE, PERMISSION_CODES.PARTNER_REPORTS_VIEW],
  });
  if (!/^\d+$/.test(id)) notFound();

  const partnerId = Number(id);
  const canManagePartner = sessionHasPermission(session, PERMISSION_CODES.PARTNERS_MANAGE);
  const canViewReports = sessionHasPermission(session, PERMISSION_CODES.PARTNER_REPORTS_VIEW);

  const partner = await getPartner(session, partnerId);
  if (!partner.success) notFound();

  const [profile, members, pending, lists, report] = await Promise.all([
    canManagePartner ? getPartnerSchoolProfile(session, partnerId) : Promise.resolve(null),
    canManagePartner ? listMembers(session, partnerId) : Promise.resolve(null),
    canManagePartner ? listPendingInvitations(session, partnerId) : Promise.resolve(null),
    canManagePartner ? listSchoolSupplyListsForPartner(session, partnerId) : Promise.resolve(null),
    canViewReports ? getPartnerStaffReport(session, partnerId, month, locale as Locale) : null,
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
          <Link
            href={`/partners/${partnerId}/edit`}
            className="text-sm underline"
            data-testid="edit-partner-link"
          >
            {tPartners('Edit')}
          </Link>
        )}
      </div>

      <Tabs defaultValue={canManagePartner && !month ? 'overview' : 'sales'} className="space-y-6">
        <TabsList>
          {canManagePartner && <TabsTrigger value="overview">{tPartners('Overview')}</TabsTrigger>}
          {canViewReports && <TabsTrigger value="sales">{t('Tab')}</TabsTrigger>}
        </TabsList>

        {canManagePartner && (
          <TabsContent value="overview" className="space-y-6">
            <StatusActions
              partnerId={partnerId}
              current={partner.data.status}
              targets={allowedPartnerStatusChanges(partner.data.status)}
            />
            {profile?.success && profile.data && (
              <section
                className="rounded-lg border p-4 space-y-3"
                data-testid="school-profile-details"
              >
                <h2 className="text-xl font-semibold">{tPartners('SchoolProfile')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">{tPartners('Governorate')}</span>
                    <span className="font-medium">{profile.data.governorate ?? '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{tPartners('Area')}</span>
                    <span className="font-medium">{profile.data.area ?? '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{tPartners('SchoolType')}</span>
                    <span className="font-medium">{profile.data.schoolType ?? '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">
                      {tPartners('AcademicSystem')}
                    </span>
                    <span className="font-medium">{profile.data.academicSystem ?? '—'}</span>
                  </div>
                </div>
                {profile.data.logoUrl && (
                  <div className="pt-2">
                    <span className="text-muted-foreground block text-xs">{tPartners('Logo')}</span>
                    <span className="text-xs font-mono">{profile.data.logoUrl}</span>
                  </div>
                )}
              </section>
            )}
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
                {tPartners('MembersLoadError')}
              </p>
            )}
            {lists?.success && lists.data.length > 0 && (
              <section className="space-y-2" data-testid="supply-lists">
                <h2 className="text-xl font-semibold">{tPartners('SchoolSupplyLists')}</h2>
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
                          {tPartners('Offer')}
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
