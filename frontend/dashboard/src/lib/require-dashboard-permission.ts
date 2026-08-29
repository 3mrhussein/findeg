import { createIdentityServices } from '@findeg/backend/features/identity';
import { adminSession, type PermissionCode } from '@findeg/backend/features/core';
import { getSession } from '@lib/session';

/**
 * Authorizes a Dashboard Server Action against the current identity state.
 *
 * The session proves authentication; the application permission service makes
 * the authorization decision so permission changes take effect immediately.
 */
export async function requireDashboardPermission(permission: PermissionCode) {
  const session = await getSession();
  if (!session?.userId || !adminSession(session)) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }

  const { permissions } = createIdentityServices();
  if (!(await permissions.hasPermission(session.userId, permission))) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }

  return session;
}
