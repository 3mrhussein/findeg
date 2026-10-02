import { Suspense } from 'react';
import { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { LoginContent } from './_components/LoginContent';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ email?: string; locked?: string; returnTo?: string }>;
};

/**
 * Generate static params for supported locales
 */
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

/**
 * Standalone Login Page
 */
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <LoginContent
        initialEmail={query.email}
        emailLocked={query.locked === '1'}
        returnTo={query.returnTo}
      />
    </Suspense>
  );
}
