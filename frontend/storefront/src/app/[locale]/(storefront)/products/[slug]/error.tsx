'use client';

import { PageStateError } from '@components/shared/state/PageStateError';
import { useTranslations } from 'next-intl';

interface ProductErrorProps {
  reset: () => void;
}

/**
 *
 */
export default function ProductError({ reset }: ProductErrorProps) {
  const t = useTranslations();

  return (
    <PageStateError
      title={t('Common.ErrorOccurred')}
      description={t('Pages.ProductDetail.NotFoundDescription')}
      retryLabel={t('Common.TryAgain')}
      onRetry={reset}
    />
  );
}
