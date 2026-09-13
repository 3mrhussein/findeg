import { redirect } from '@i18n/navigation';
import { adminSession } from '@findeg/backend/features/core';
import type { SessionPayload } from '@findeg/backend/features/core';
import type { Locale } from 'next-intl';
import { getSession } from '@lib/session';

/**
 * Require any authenticated user — redirects to /login if not.
 * Use in layouts/pages that require a logged-in user.
 */
export async function requireAuth(locale: Locale): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect({ href: '/login', locale });
  }
  return session!;
}

/**
 * Require admin session — redirects to /admin/login if not.
 * Use in the (admin) protected layout.
 */
export async function requireAdmin(locale: Locale): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !adminSession(session)) {
    redirect({ href: '/login', locale });
  }
  return session!;
}

/**
 * Redirect already-authenticated users away from auth pages.
 * Admins go to /admin, regular users go to /dashboard.
 */
export async function redirectIfAuthenticated(locale: Locale): Promise<void> {
  const session = await getSession();
  if (session) {
    if (adminSession(session)) {
      redirect({ href: '/', locale });
    } else {
      redirect({ href: '/', locale });
    }
  }
}

/**
 * Get the current session without redirecting.
 * Returns null for guests. Use in public pages with auth-aware components.
 */
export async function getOptionalSession(): Promise<SessionPayload | null> {
  return await getSession();
}
/**
 * Require specific permission — redirects to / if unauthorized.
 */
export async function requirePermission(
  locale: Locale,
  options: {
    permission?: string;
    any?: string[];
    all?: string[];
  },
): Promise<SessionPayload> {
  const session = await requireAdmin(locale);

  // System admins bypass checks
  if (session.activeRoleIds?.includes('system_admin')) {
    return session;
  }

  let allowed = false;
  if (options.permission) {
    allowed = session.permissionCodes?.includes(options.permission) ?? false;
  } else if (options.any) {
    allowed = options.any.some((c) => session.permissionCodes?.includes(c));
  } else if (options.all) {
    allowed = options.all.every((c) => session.permissionCodes?.includes(c));
  }

  if (!allowed) {
    redirect({ href: '/', locale });
  }

  return session;
}
