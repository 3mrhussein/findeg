import * as React from 'react';
import { getOptionalSession } from '@lib/auth-guard';
import { Skeleton } from '@findeg/ui';
import { AdminSidebarUserClient } from './AdminSidebarUserClient';

interface AdminSidebarUserProps {
  locale: string;
}

/**
 * AdminSidebarUser - Dynamic server component for the sidebar user profile.
 * Fetches session data and renders the user profile area.
 * Wrapped in Suspense to prevent blocking the static sidebar shell.
 */
export async function AdminSidebarUser({ locale }: AdminSidebarUserProps) {
  const session = await getOptionalSession();

  if (!session) {
    return (
      <div className="mt-auto border-t border-gray-200 dark:border-slate-800 p-[12px] flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-[32px] w-[32px] rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminSidebarUserClient
      userEmail={session.user.email}
      userName={session.user.fullName}
      userRole={session.portalRole}
      locale={locale}
    />
  );
}
