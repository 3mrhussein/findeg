import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getWebRuntime } from '../../../../server/runtime';
import { sessionToken } from '../../../../server/session';
export default async function PortalHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const result = await getWebRuntime().partners.currentSession(await sessionToken());
  if (result.status === 'authenticated' && 'partner' in result.session)
    redirect(`/${locale}/partner/${result.session.partner.businessPartnerId}`);
  if (result.status === 'workspace-selection-required')
    return (
      <section>
        <h2>{locale === 'ar' ? 'اختر الشريك' : 'Choose a Business Partner'}</h2>
        <ul>
          {result.choices.map(({ partner }) => (
            <li key={partner.id}>
              <Link href={`/${locale}/partner/${partner.id}`}>
                {locale === 'ar' ? partner.nameAr : partner.nameEn}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  return (
    <p role="alert">
      {locale === 'ar'
        ? 'لا توجد عضوية مؤهلة. تحقق من تأكيد بريدك الإلكتروني وحالة عضويتك.'
        : 'No eligible membership. Check your verified email and membership status.'}{' '}
      <Link href={`/${locale}`}>{locale === 'ar' ? 'المتجر' : 'Storefront'}</Link>
    </p>
  );
}
