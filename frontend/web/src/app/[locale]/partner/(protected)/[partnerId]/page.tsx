import { PartnerReport } from '../../../../../components/partner-report';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getWebRuntime } from '../../../../../server/runtime';
import { sessionToken } from '../../../../../server/session';
import { partnerId } from '../../../../../server/partner-api';
import { PartnerAccess } from '../../../../../components/partner-access';
export default async function Workspace({
  params,
}: {
  params: Promise<{ locale: string; partnerId: string }>;
}) {
  const { locale, partnerId: raw } = await params;
  const id = partnerId(raw);
  const result = id
    ? await getWebRuntime().partners.currentSession(await sessionToken(), id)
    : undefined;
  if (result?.status === 'authentication-required') redirect(`/${locale}/partner/sign-in`);
  if (result?.status !== 'authenticated' || !('partner' in result.session)) redirect(`/${locale}`);
  const context = result.session.partner;
  return (
    <>
      <h2>
        {locale === 'ar' ? 'الشريك' : 'Business Partner'} #{context.businessPartnerId}
      </h2>
      <ul>
        {context.roles.map((role) => (
          <li key={role}>
            {
              {
                'partner-administrator': locale === 'ar' ? 'مسؤول الشريك' : 'Partner Administrator',
                'list-manager': locale === 'ar' ? 'مدير القوائم' : 'List Manager',
                'collection-staff': locale === 'ar' ? 'موظف الاستلام' : 'Collection Staff',
                'report-viewer': locale === 'ar' ? 'عارض التقارير' : 'Report Viewer',
              }[role]
            }
          </li>
        ))}
      </ul>
      <Link href={`/${locale}/partner`}>{locale === 'ar' ? 'تبديل الشريك' : 'Switch partner'}</Link>
      {context.roles.some(
        (role) => role === 'partner-administrator' || role === 'report-viewer',
      ) && <PartnerReport locale={locale} partnerId={context.businessPartnerId} />}
      {context.roles.includes('partner-administrator') && (
        <PartnerAccess
          locale={locale}
          businessPartnerId={context.businessPartnerId}
          portal="partner"
        />
      )}
    </>
  );
}
