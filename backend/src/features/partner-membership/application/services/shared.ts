import { PERMISSION_CODES } from '@findeg/db';
import type { StaffActor } from '../interfaces/IPartnerService';

const SYSTEM_ADMIN_ROLE = 'system_admin';

export function canManagePartners(actor: StaffActor): boolean {
  if (actor.activeRoleIds?.includes(SYSTEM_ADMIN_ROLE)) return true;
  return actor.permissionCodes?.includes(PERMISSION_CODES.PARTNERS_MANAGE) === true;
}

export function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

export function fail<E extends string>(error: E): { success: false; error: E } {
  return { success: false, error };
}
