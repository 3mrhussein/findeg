'use client';

import { useEffect } from 'react';
import { Button } from '@findeg/ui';

/**
 * Global Error Boundary
 *
 * Catches errors from the root layout or templates.
 * Replaces the entire UI with a fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to server
    fetch('/api/v1/logging/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'error',
        message: `Global Client Error: ${error.message}`,
        metadata: {
          digest: error.digest,
          stack: error.stack,
        },
      }),
    }).catch((e) => console.error('Failed to report global error:', e));
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">Something went wrong!</h1>
          <p className="text-muted-foreground">
            A critical error occurred. Our team has been notified.
          </p>
          <div className="p-4 bg-muted rounded-md text-left text-sm font-mono overflow-auto max-h-[200px]">
            {error.message}
            {error.digest && <div className="mt-2 text-xs opacity-70">Digest: {error.digest}</div>}
          </div>
          <Button onClick={() => reset()} size="lg">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
