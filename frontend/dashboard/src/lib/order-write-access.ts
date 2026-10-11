import { adminSession, type SessionPayload } from '@findeg/backend/features/core';
import { assertCanWriteOrders, type OrderStaffActor } from '@findeg/orders';
import { getSession } from '@lib/session';

function toOrderActor(session: SessionPayload): OrderStaffActor {
  return {
    kind: 'staff',
    userId: session.userId,
    permissionCodes: session.permissionCodes,
    activeRoleIds: session.activeRoleIds,
  };
}

/**
 * Re-verifies the caller inside every order-writing Server Action, which is reachable by
 * direct POST regardless of the page guard. Staff-portal membership is checked here; the
 * order-write permission is the backend's rule, so a refusal is the backend's
 * NotAuthorizedError either way.
 */
export async function requireOrderWriteActor(): Promise<OrderStaffActor> {
  const session = await getSession();
  const actor = session && adminSession(session) ? toOrderActor(session) : undefined;
  assertCanWriteOrders(actor);
  return actor;
}
