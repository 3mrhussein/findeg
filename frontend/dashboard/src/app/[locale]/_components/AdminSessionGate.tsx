import { requireAdmin } from '@lib/auth-guard';
import { PermissionsProvider } from '@providers/PermissionsProvider';
import { SessionProvider } from '@providers/SessionProvider';
import { type Locale } from '@findeg/backend/features/core';

interface AdminSessionGateProps {
  children: React.ReactNode;
  locale: string;
}

/**
 * AdminSessionGate - Handles admin authentication and provides permissions context.
 * Refactored to only wrap the dynamic page content, allowing the shell to be static.
 */
export async function AdminSessionGate({ children, locale }: AdminSessionGateProps) {
  const session = await requireAdmin(locale as Locale);

  return (
    <SessionProvider session={session}>
      <PermissionsProvider session={session}>
        {children}
      </PermissionsProvider>
    </SessionProvider>
  );
}
