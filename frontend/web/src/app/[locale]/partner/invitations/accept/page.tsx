import { AcceptInvitation } from '../../../../../components/partner-access';
import { getWebRuntime } from '../../../../../server/runtime';
import { sessionToken } from '../../../../../server/session';
export default async function InvitationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const result = await getWebRuntime().currentSession(await sessionToken(), 'storefront');
  return <AcceptInvitation locale={locale} authenticated={result.status === 'authenticated'} />;
}
