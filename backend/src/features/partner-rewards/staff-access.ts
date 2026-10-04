import { PERMISSION_CODES, type PermissionCode } from '@findeg/db';

export interface RewardsStaffActor {
  readonly userId: number;
  readonly permissionCodes?: readonly PermissionCode[];
  readonly activeRoleIds?: readonly string[];
}

export type RewardRateResult<T, E extends string> =
  { readonly success: true; readonly data: T } | { readonly success: false; readonly error: E };

export const ok = <T>(data: T) => ({ success: true, data }) as const;
export const fail = <E extends string>(error: E) => ({ success: false, error }) as const;

export function hasPermission(actor: RewardsStaffActor, permission: PermissionCode) {
  if (actor.activeRoleIds?.includes('system_admin')) return true;
  return actor.permissionCodes?.includes(permission) === true;
}

export function canViewRewards(actor: RewardsStaffActor) {
  return (
    hasPermission(actor, PERMISSION_CODES.REWARDS_VIEW) ||
    hasPermission(actor, PERMISSION_CODES.REWARDS_RATES_MANAGE)
  );
}
