import { Suspense } from 'react';
import { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { LoginContent } from './_components/LoginContent';

type Props = {
  params: Promise<{ locale: Locale }>;
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
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
