import { redirect } from '@i18n/navigation';
import { adminSession, hasPermission, systemAdmin } from '@findeg/identity/types';
import type { SessionPayload } from '@findeg/identity';
import type { PermissionCode } from '@findeg/identity/types';
import type { Locale } from '@findeg/domain';
import { NotAuthorizedError } from '@findeg/domain-errors';
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

/** Server-side permission policy, including the system-administrator bypass. */
export function sessionHasPermission(
  session: SessionPayload,
  permission: PermissionCode | string,
): boolean {
  return systemAdmin(session) || hasPermission(session, permission);
}

/**
 * Shared guard for server actions: requires an authenticated Staff session
 * and verifies that the staff member holds the required permission(s).
 *
 * System administrators bypass permission checks.
 * Throws NotAuthorizedError on refusal.
 */
export async function requireStaffAction(
  permission?: PermissionCode | string | (PermissionCode | string)[],
  actionDescription?: string,
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !adminSession(session)) {
    throw new NotAuthorizedError(
      actionDescription ??
        (Array.isArray(permission) ? permission.join(', ') : (permission ?? 'staff action')),
    );
  }

  if (permission) {
    const allowed = Array.isArray(permission)
      ? permission.some((p) => sessionHasPermission(session, p))
      : sessionHasPermission(session, permission);

    if (!allowed) {
      throw new NotAuthorizedError(
        actionDescription ?? (Array.isArray(permission) ? permission.join(', ') : permission),
      );
    }
  }

  return session;
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
    allowed = sessionHasPermission(session, options.permission);
  } else if (options.any) {
    allowed = options.any.some((c) => sessionHasPermission(session, c));
  } else if (options.all) {
    allowed = options.all.every((c) => sessionHasPermission(session, c));
  }

  if (!allowed) {
    redirect({ href: '/', locale });
  }

  return session;
}
