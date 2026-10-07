import { setRequestLocale } from 'next-intl/server';
import { requireAdmin } from '@lib/auth-guard';
import { SessionProvider } from '@providers/SessionProvider';
import { PermissionsProvider } from '@providers/PermissionsProvider';
import { AdminShell } from '../_components/shell/AdminShell';
import type { Locale } from '@findeg/backend/features/core';

/**
 * Protected Admin Dashboard Layout
 *
 * Enforces admin authentication at layout root, redirecting unauthenticated
 * users cleanly to /login without rendering a hollow shell or throwing Suspense errors.
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

  const session = await requireAdmin(locale as Locale);

  return (
    <SessionProvider session={session}>
      <PermissionsProvider session={session}>
        <AdminShell locale={locale}>{children}</AdminShell>
      </PermissionsProvider>
    </SessionProvider>
  );
}
