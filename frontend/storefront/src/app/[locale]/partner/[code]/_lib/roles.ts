export const PARTNER_ROLES = [
  { value: 'partner-administrator', label: 'Partner Administrator' },
  { value: 'list-manager', label: 'List manager' },
  { value: 'collection-staff', label: 'Collection staff' },
  { value: 'report-viewer', label: 'Report viewer' },
] as const;

export const roleLabel = (value: string) =>
  PARTNER_ROLES.find((role) => role.value === value)?.label ?? value;

export interface ActionState {
  status: 'idle' | 'done' | 'error';
  message?: string;
  /** The edit lost to a newer one; the caller should reload the row. */
  stale?: boolean;
  /** Invitation link to copy, present after invite and resend. Shown once; the token is not stored. */
  link?: string;
}
