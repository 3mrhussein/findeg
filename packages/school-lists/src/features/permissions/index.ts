import { PERMISSION_CODES, systemAdmin } from '@findeg/db';
import { SupplyListIdSchema as supplyListIdSchema } from '@findeg/db';
import type { SupplyListStaffActor } from '../../types';

function isStaff(actor: SupplyListStaffActor): boolean {
  // Runtime guard: untyped callers can pass any kind, so widen before comparing.
  const kind: string = actor.kind;
  return kind === 'staff' && supplyListIdSchema.safeParse(actor.userId).success;
}

export function canWriteSupplyLists(actor: SupplyListStaffActor): boolean {
  return (
    isStaff(actor) &&
    (systemAdmin(actor) ||
      actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE) === true)
  );
}

export function canReadSupplyLists(actor: SupplyListStaffActor): boolean {
  return (
    canWriteSupplyLists(actor) ||
    (isStaff(actor) &&
      actor.permissionCodes?.includes(PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ) === true)
  );
}
