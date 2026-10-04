import { PERMISSION_CODES, systemAdmin } from '@findeg/db';
import { NotAuthorizedError } from '../../core/domain/errors';
import type { OrderStaffActor } from './OrderStaffActor';

/**
 * Staff may change an Order's status or payment only with order-write access
 * (`system_admin` bypasses). This checks the permission only: membership of the
 * Staff portal (`adminSession`) is enforced at the Dashboard edge, which builds
 * the actor from the session.
 */
export function canWriteOrders(actor: OrderStaffActor | undefined): boolean {
  if (actor?.kind !== 'staff' || !Number.isSafeInteger(actor.userId) || actor.userId <= 0) {
    return false;
  }
  return (
    systemAdmin(actor) ||
    actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_ORDERS_WRITE) === true
  );
}

/** Throws NotAuthorizedError unless the actor may write Orders; see canWriteOrders. */
export function assertCanWriteOrders(
  actor: OrderStaffActor | undefined,
): asserts actor is OrderStaffActor {
  if (!canWriteOrders(actor)) throw new NotAuthorizedError('change orders');
}
