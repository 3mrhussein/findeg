import { Link } from '@i18n/navigation';
import { Badge, Button } from '@findeg/ui';
import type { Locale } from 'next-intl';
import { requirePermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { toStaffActor } from './_lib/toStaffActor';

export const metadata = {
  title: 'Business Partners - FindEg Admins',
};

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await requirePermission(locale as Locale, {
    any: [PERMISSION_CODES.PARTNERS_MANAGE, PERMISSION_CODES.REWARDS_VIEW],
  });
  const canManage =
    session.activeRoleIds?.includes('system_admin') === true ||
    session.permissionCodes?.includes(PERMISSION_CODES.PARTNERS_MANAGE) === true;

  const { partners } = createPartnerMembershipServices();
  const result = await partners.listPartners(toStaffActor(session));
  const rows = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Partners</h1>
          <p className="text-muted-foreground mt-2">
            Organizations FindEg has a commercial relationship with, such as Partner Schools.
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/partners/new">New Business Partner</Link>
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 shadow rounded-lg overflow-hidden border border-transparent dark:border-slate-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-800/50">
            <tr>
              {['Code', 'Name (English)', 'Name (Arabic)', 'Status', ''].map((heading, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {rows.map((partner) => (
              <tr key={partner.id} data-testid="partner-row">
                <td className="px-6 py-4 font-mono text-sm">{partner.code}</td>
                <td className="px-6 py-4">{partner.nameEn}</td>
                <td className="px-6 py-4" dir="rtl">
                  {partner.nameAr}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{partner.status}</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/partners/${partner.id}`} className="text-sm underline mr-4">
                    {canManage ? 'Open' : 'Rewards'}
                  </Link>
                  {canManage && (
                    <Link href={`/partners/${partner.id}/edit`} className="text-sm underline">
                      Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No Business Partners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
