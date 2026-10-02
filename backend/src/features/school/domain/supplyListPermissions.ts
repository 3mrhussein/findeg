import { PERMISSION_CODES, systemAdmin } from '@findeg/db';
import { SupplyListIdSchema } from '@findeg/db/types';
import type { SupplyListStaffActor } from '../application/interfaces/ISchoolSupplyListService';

function isStaff(actor: SupplyListStaffActor): boolean {
  return actor?.kind === 'staff' && SupplyListIdSchema.safeParse(actor.userId).success;
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
