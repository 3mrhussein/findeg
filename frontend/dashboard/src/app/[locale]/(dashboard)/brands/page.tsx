import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BrandsContent } from './_components/BrandsContent';
import { routing } from '@i18n/routing';

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Brands Page — Catalog of product brands
 */
export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as any);

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="animate-pulse bg-gray-50 h-96 rounded-lg" />}>
        <BrandsContent locale={locale} />
      </Suspense>
    </div>
  );
}
