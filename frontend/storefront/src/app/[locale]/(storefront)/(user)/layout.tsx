import React from 'react';
import { Sidebar } from './_components/Sidebar';
import { Topbar } from './_components/Topbar';
import { requireAuth } from '@lib/auth-guard';
import { getCachedActivePartnerMemberships } from '@data/partner/queries';
import type { Locale } from '@findeg/domain';

/**
 * User Account Layout
 *
 * Requires any authenticated user. Redirects guests to /login.
 * Wraps user account pages with a sidebar and topbar.
 */
export default async function UserAccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAuth(locale as Locale);

  // The Partner Workspace link is a convenience: a failure here must not break the account area.
  const hasPartnerWorkspace = await getCachedActivePartnerMemberships().then(
    (memberships) => memberships.length > 0,
    () => false,
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar hasPartnerWorkspace={hasPartnerWorkspace} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
