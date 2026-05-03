import React from 'react';
import { redirectIfAuthenticated } from '@lib/auth-guard';
import type { Locale } from 'next-intl';

async function AuthGuard({ locale }: { locale: string }) {
  await redirectIfAuthenticated(locale as Locale);
  return null;
}

/**
 * Auth Layout — Login, Registration
 *
 * Redirects already-authenticated users to their appropriate homepage:
 * - Admins → /admin
 * - Regular users → /dashboard
 */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <React.Suspense fallback={null}>
        <AuthGuard locale={locale} />
        {children}
      </React.Suspense>
    </div>
  );
}
