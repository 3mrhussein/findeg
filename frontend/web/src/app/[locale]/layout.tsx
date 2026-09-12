import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import './styles.css';
import { SessionAccount } from '../../server/session-account';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const arabic = locale === 'ar';
  return (
    <html lang={locale} dir={arabic ? 'rtl' : 'ltr'}>
      <body>
        <header>
          <Link href={`/${locale}`}>FindEg</Link>
          <nav aria-label={arabic ? 'البوابات' : 'Portals'}>
            <Link href={`/${locale}`}>{arabic ? 'المتجر' : 'Storefront'}</Link>
            <Link href={`/${locale}/partner`}>
              {arabic ? 'مساحة الشركاء' : 'Partner Workspace'}
            </Link>
            <Link href={`/${locale}/back-office`}>
              {arabic ? 'إدارة فايند إيجي' : 'Back Office'}
            </Link>
          </nav>
          <Link href={arabic ? '/en' : '/ar'} lang={arabic ? 'en' : 'ar'}>
            {arabic ? 'English' : 'العربية'}
          </Link>
          <SessionAccount locale={locale} />
        </header>
        {children}
      </body>
    </html>
  );
}
