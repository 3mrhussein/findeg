import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { AdminSessionGate } from '../_components/AdminSessionGate';
import { AdminShell } from '../_components/shell/AdminShell';

/**
 * Generate static params for supported locales
 */
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

/**
 * Protected Admin Dashboard Layout
 *
 * Uses the new AdminShell component for consistent admin navigation and layout.
 * The Shell is rendered outside the SessionGate to allow for PPR (Partial Prerendering).
 */

export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AdminShell locale={locale}>
      <Suspense
        fallback={
          <div className="flex-1 animate-pulse bg-gray-50 dark:bg-slate-900 rounded-lg h-full w-full" />
        }
      >
        <AdminSessionGate locale={locale}>{children}</AdminSessionGate>
      </Suspense>
    </AdminShell>
  );
}

