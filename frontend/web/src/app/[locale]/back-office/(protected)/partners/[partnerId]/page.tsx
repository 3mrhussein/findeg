import { PartnerAccess } from '../../../../../../components/partner-access';
import { partnerId } from '../../../../../../server/partner-api';
import { getWebRuntime } from '../../../../../../server/runtime';
import { sessionToken } from '../../../../../../server/session';
export default async function Partner({
  params,
}: {
  params: Promise<{ locale: string; partnerId: string }>;
}) {
  const { locale, partnerId: raw } = await params;
  const id = partnerId(raw);
  const access = await getWebRuntime().authorize(
    await sessionToken(),
    'back-office',
    'staff-access.manage',
  );
  if (!id || access.status !== 'authenticated')
    return (
      <p role="alert">
        {locale === 'ar'
          ? 'ليس لديك صلاحية إدارة الشركاء.'
          : 'You do not have permission to manage partners.'}
      </p>
    );
  return <PartnerAccess locale={locale} businessPartnerId={id} portal="back-office" />;
}
