'use client';

import ErrorPage from '@/presentation/components/templates/ErrorPage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage />;
}
