import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { CategoriesContent } from './_components/CategoriesContent';
import { CategoryListSkeleton } from '@components/skeletons';

import { routing } from '@i18n/routing';

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Categories Page — Hierarchical tree view of product categories
 *
 * This page uses Progressive Rendering:
 * 1. The layout shell renders immediately (via Suspense in layout.tsx)
 * 2. CategoriesContent is streamed as it becomes available
 */


export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoriesContent locale={locale} />
      </Suspense>
    </div>
  );
}

