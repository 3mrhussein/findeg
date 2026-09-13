import * as React from 'react';
import { getOptionalSession } from '@lib/auth-guard';
import { Skeleton } from '@findeg/ui';
import { AdminHeaderUserClient } from './AdminHeaderUserClient';

interface AdminHeaderUserProps {
  locale: string;
}

/**
 * AdminHeaderUser - Dynamic server component for the header user menu.
 * Fetches session data and renders the user dropdown.
 * Wrapped in Suspense to prevent blocking the static header shell.
 */
export async function AdminHeaderUser({ locale }: AdminHeaderUserProps) {
  const session = await getOptionalSession();

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-[32px] w-[32px] rounded-full" />
      </div>
    );
  }

  return (
    <AdminHeaderUserClient
      userEmail={session.user.email}
      userName={session.user.fullName}
      locale={locale}
    />
  );
}
