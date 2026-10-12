'use client';

import ErrorPage from '@components/shared/ErrorPage';

export default function Error({
  error: _error,
  reset,
  retry,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
  unstable_retry?: () => void;
}) {
  const onRetry = unstable_retry ?? retry ?? reset;

  return (
    <ErrorPage
      title="Something went wrong!"
      subtitle="We apologize for the inconvenience. Please try again later."
      onRetry={onRetry}
      retryLabel="Try again"
    />
  );
}
