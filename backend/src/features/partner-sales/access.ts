import { PERMISSION_CODES, systemAdmin, type PermissionCode } from '@findeg/db';

export interface PartnerSalesStaffActor {
  readonly userId: number;
  readonly permissionCodes?: readonly PermissionCode[];
  readonly activeRoleIds?: readonly string[];
}

export type PartnerSalesResult<T, E extends string> =
  { readonly success: true; readonly data: T } | { readonly success: false; readonly error: E };

export const ok = <T>(data: T) => ({ success: true, data }) as const;
export const fail = <E extends string>(error: E) => ({ success: false, error }) as const;

/** Staff read Attributed Orders and Partner Reports with `partner-reports.view`. */
export function canViewPartnerReports(actor: PartnerSalesStaffActor): boolean {
  return (
    systemAdmin(actor) ||
    actor.permissionCodes?.includes(PERMISSION_CODES.PARTNER_REPORTS_VIEW) === true
  );
}

/** Reads that must add up take one read-only snapshot. */
export const READ_SNAPSHOT = {
  isolationLevel: 'repeatable read',
  accessMode: 'read only',
} as const;
