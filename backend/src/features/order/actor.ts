import { PERMISSION_CODES, systemAdmin } from '@findeg/db';
import { NotAuthorizedError } from '../core/errors';

/** Built at the authenticated Dashboard edge; Orders owns write authorization. */
export interface OrderStaffActor {
  kind: 'staff';
  userId: number;
  permissionCodes?: readonly string[];
  activeRoleIds?: readonly string[];
}

export function canWriteOrders(actor: OrderStaffActor | undefined): boolean {
  return (
    actor?.kind === 'staff' &&
    Number.isSafeInteger(actor.userId) &&
    actor.userId > 0 &&
    (systemAdmin(actor) ||
      actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_ORDERS_WRITE) === true)
  );
}

export function assertCanWriteOrders(
  actor: OrderStaffActor | undefined,
): asserts actor is OrderStaffActor {
  if (!canWriteOrders(actor)) throw new NotAuthorizedError('change orders');
}
