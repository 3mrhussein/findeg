'use client';

import ErrorPage from '@components/shared/ErrorPage';
import { useTranslations } from 'next-intl';

/**
 *
 */
export default function CategoryNotFoundPage() {
  const t = useTranslations();

  return (
    <ErrorPage
      title={t('Pages.Categories.EmptyTitle')}
      subtitle={t('Pages.Categories.EmptyDescription')}
      ctaLabel={t('Pages.ProductDetail.BackToShop')}
      ctaHref="/"
    />
  );
}
