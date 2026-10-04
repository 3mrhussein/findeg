import { PERMISSION_CODES, systemAdmin } from '@findeg/db';
import type { OrderStaffActor } from '../application/interfaces/IAdminOrderService';

export class OrderWriteForbiddenError extends Error {
  constructor() {
    super('Unauthorized: Order write permission required');
    this.name = 'OrderWriteForbiddenError';
  }
}

/** Staff may change an Order's status or payment only with order-write access. */
export function canWriteOrders(actor: OrderStaffActor | undefined): boolean {
  if (actor?.kind !== 'staff' || !Number.isSafeInteger(actor.userId) || actor.userId <= 0) {
    return false;
  }
  return (
    systemAdmin(actor) ||
    actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_ORDERS_WRITE) === true
  );
}
