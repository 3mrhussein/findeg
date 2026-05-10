import ErrorPage from '@components/shared/ErrorPage';
import { Suspense } from 'react';

/**
 *
 */
export default function NotFound() {
  return (
    <Suspense fallback={null}>
      <ErrorPage />
    </Suspense>
  );
}
