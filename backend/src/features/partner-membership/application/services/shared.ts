import { PERMISSION_CODES } from '@findeg/db';
import {
  getCurrentPartnerMembership,
  getPartnerUserById,
  type PartnerExecutor,
} from '@findeg/db/queries/partners';
import type { PartnerRole } from '@findeg/db/schema';
import type { StaffActor } from '../interfaces/IPartnerService';

const SYSTEM_ADMIN_ROLE = 'system_admin';

export function canManagePartners(actor: StaffActor): boolean {
  if (actor.activeRoleIds?.includes(SYSTEM_ADMIN_ROLE)) return true;
  return actor.permissionCodes?.includes(PERMISSION_CODES.PARTNERS_MANAGE) === true;
}

export const PARTNER_ADMINISTRATOR: PartnerRole = 'partner-administrator';

/** Whether a membership is active and holds the `partner-administrator` role. */
export const isActiveAdministrator = (membership: { roles: readonly string[]; status: string }) =>
  membership.status === 'active' && membership.roles.includes(PARTNER_ADMINISTRATOR);

/**
 * Whether the user is an active account holding an active `partner-administrator`
 * membership of the partner. Call it after taking the partner lock so a
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
  return membership !== undefined && isActiveAdministrator(membership);
}

export function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

export function fail<E extends string>(error: E): { success: false; error: E } {
  return { success: false, error };
}
