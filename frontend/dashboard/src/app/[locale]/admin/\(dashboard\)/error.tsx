/**
 * Error Handler for Admin Dashboard Routes (Phase 6.3: T139)
 *
 * Next.js error.tsx file that catches errors in the dashboard layout and provides
 * a graceful error UI instead of a crash.
 *
 * Triggers when:
 * - An error occurs in a route segment or its layout
 * - A Server Component throws an error
 * - An error is thrown in a Route Handler
 *
 * Does NOT trigger for:
 * - Errors in Suspense fallbacks
 * - Errors in nested layouts (use error.tsx in nested folders)
 * - Errors in Route Handlers that handle errors themselves
 */

"use client";

import { useEffect } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@ui";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminDashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, LogRocket, etc.)
    console.error("[AdminDashboardError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Error Card */}
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 shadow-lg p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-950/30 p-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Something Went Wrong
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              The dashboard encountered an error. Our team has been notified.
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <details className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-sm text-slate-700 dark:text-slate-300">
              <summary className="cursor-pointer font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Details
              </summary>
              <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-xs">
                {error.message}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            {/* Reset Button */}
            <Button onClick={reset} className="w-full bg-red-600 hover:bg-red-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            {/* Home Link */}
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Support Info */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
