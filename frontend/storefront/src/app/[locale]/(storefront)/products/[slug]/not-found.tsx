'use client';

import ErrorPage from '@components/shared/ErrorPage';
import { useTranslations } from 'next-intl';

/**
 *
 */
export default function ProductNotFoundPage() {
  const t = useTranslations();

  return (
    <ErrorPage
      title={t('Pages.ProductDetail.NotFound')}
      subtitle={t('Pages.ProductDetail.NotFoundDescription')}
      ctaLabel={t('Pages.ProductDetail.BackToShop')}
      ctaHref="/"
    />
  );
}
