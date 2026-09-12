import { getWebRuntime } from '../../../../../server/runtime';
import { sessionToken } from '../../../../../server/session';
import { CreatePartner } from '../../../../../components/partner-access';
export default async function Partners({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const access = await getWebRuntime().authorize(
    await sessionToken(),
    'back-office',
    'staff-access.manage',
  );
  if (access.status !== 'authenticated')
    return (
      <p role="alert">
        {locale === 'ar'
          ? 'ليس لديك صلاحية إدارة الشركاء.'
          : 'You do not have permission to manage partners.'}
      </p>
    );
  return <CreatePartner locale={locale} />;
}
