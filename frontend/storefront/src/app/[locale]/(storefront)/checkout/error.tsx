'use client';

import { PageStateError } from '@components/shared/state/PageStateError';
import { useTranslations } from 'next-intl';

interface CheckoutErrorProps {
  reset: () => void;
}

/**
 *
 */
export default function CheckoutError({ reset }: CheckoutErrorProps) {
  const t = useTranslations();

  return (
    <PageStateError
      title={t('Common.ErrorOccurred')}
      description={t('Pages.Checkout.FailedToPlaceOrder')}
      retryLabel={t('Common.TryAgain')}
      onRetry={reset}
    />
  );
}
