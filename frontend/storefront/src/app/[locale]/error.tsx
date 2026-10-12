'use client';

import ErrorPage from '@components/shared/ErrorPage';

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      title="Something went wrong!"
      subtitle="We apologize for the inconvenience. Please try again later."
      onRetry={() => reset()}
      retryLabel="Try again"
    />
  );
}
