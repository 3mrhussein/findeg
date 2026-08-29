import { getSession } from './session';
import { getRequestSession } from '@data/auth/queries';
import { redirect } from '@i18n/navigation';
import { adminSession } from '@findeg/backend/features/core';
import type { SessionPayload, Locale } from '@findeg/backend/features/core';
import {
  getActivePortal,
  redirectToActivePortalHome,
  STOREFRONT_PORTAL,
} from '@lib/portal-routing';

/**
 * Require any authenticated user — redirects to /login if not.
 * Use in layouts/pages that require a logged-in user.
 */
export async function requireAuth(locale: string): Promise<SessionPayload> {
  const session = await getRequestSession();
  if (!session) {
    redirect({ href: '/login', locale: locale as any });
  }
  if (getActivePortal(session!) !== STOREFRONT_PORTAL) {
    redirectToActivePortalHome(session!, locale);
  }
  return session!;
}

/**
 * Require admin session — redirects to /admin/login if not.
 * Use in the (admin) protected layout.
 */
export async function requireAdmin(locale: string): Promise<SessionPayload> {
  const session = await getRequestSession();
  if (!session) {
    redirect({ href: '/login', locale: locale as any });
  }
  if (getActivePortal(session!) !== 'dashboard' || !adminSession(session!)) {
    redirectToActivePortalHome(session!, locale);
  }
  return session!;
}

/**
 * Redirect already-authenticated users away from auth pages.
 * Admins go to /admin, regular users go to /dashboard.
 */
export async function redirectIfAuthenticated(locale: string): Promise<void> {
  const session = await getRequestSession();
  if (session) {
    redirectToActivePortalHome(session, locale);
  }
}

/**
 * Get the current session without redirecting.
 * Returns null for guests. Use in public pages with auth-aware components.
 */
export async function getOptionalSession(): Promise<SessionPayload | null> {
  return getRequestSession();
}
/**
 * Require specific permission — redirects to /dashboard if unauthorized.
 */
export async function requirePermission(
  locale: string,
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
    redirect({ href: '/', locale: locale as any });
  }

  return session;
}
