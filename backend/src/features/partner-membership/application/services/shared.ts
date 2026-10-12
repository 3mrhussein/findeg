import { PERMISSION_CODES } from '@findeg/db';
import {
  getCurrentPartnerMembership,
  getPartnerUserById,
  type PartnerExecutor,
} from '@findeg/db/queries/partners';
import { canManagePartnerMembers } from '@findeg/domain';
import type { StaffActor } from '../interfaces/IPartnerService';

const SYSTEM_ADMIN_ROLE = 'system_admin';

export function canManagePartners(actor: StaffActor): boolean {
  if (actor.activeRoleIds?.includes(SYSTEM_ADMIN_ROLE)) return true;
  return actor.permissionCodes?.includes(PERMISSION_CODES.PARTNERS_MANAGE) === true;
}

/** Staff who manage Business Partners or read their Partner Reports may read the directory. */
export function canViewPartners(actor: StaffActor): boolean {
  return (
    canManagePartners(actor) ||
    actor.permissionCodes?.includes(PERMISSION_CODES.PARTNER_REPORTS_VIEW) === true
  );
}

/**
 * Whether the user is an active account whose current membership of the partner manages its
 * members (an active Partner Administrator, PA-6). Call it after taking the partner lock so a
 * concurrent change to the membership is seen.
 */
export async function isActivePartnerAdministrator(
  executor: PartnerExecutor,
  businessPartnerId: number,
  userId: number,
): Promise<boolean> {
  const user = await getPartnerUserById(executor, userId);
  if (!user?.isActive) return false;
  const membership = await getCurrentPartnerMembership(executor, businessPartnerId, userId);
  return membership !== undefined && canManagePartnerMembers(membership);
}

export function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

export function fail<E extends string>(error: E): { success: false; error: E } {
  return { success: false, error };
}
