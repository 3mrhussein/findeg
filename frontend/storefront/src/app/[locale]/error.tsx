'use client';

import ErrorPage from '@components/shared/ErrorPage';

export default function Error({
  error: _error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorPage
      title="Something went wrong!"
      subtitle="We apologize for the inconvenience. Please try again later."
      onRetry={() => retry()}
      retryLabel="Try again"
    />
  );
}
