import { adminSession, hasPermission, PERMISSION_CODES } from '@findeg/backend/features/core';
import type { OrderStaffActor } from '@findeg/backend/features/administration';
import { getSession } from '@lib/session';

/**
 * Re-verifies the caller inside every order-writing Server Action, which is reachable by
 * direct POST regardless of the page guard. Returns the Staff actor the backend records.
 */
export async function requireOrderWriteActor(): Promise<OrderStaffActor> {
  const session = await getSession();
  if (
    !session ||
    !adminSession(session) ||
    !hasPermission(session, PERMISSION_CODES.ADMIN_ORDERS_WRITE)
  ) {
    throw new Error('Unauthorized: Order write permission required');
  }
  return {
    kind: 'staff',
    userId: session.userId,
    permissionCodes: session.permissionCodes,
    activeRoleIds: session.activeRoleIds,
  };
}
