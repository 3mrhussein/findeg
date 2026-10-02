import type { PartnerRole } from '@findeg/backend/features/partner-membership';

// Typed against the backend's role union (type-only import: Client Components must not pull in the
// feature barrel's server code), so adding a role there fails type-checking until it has a label.
const ROLE_LABELS: Record<PartnerRole, string> = {
  'partner-administrator': 'Partner Administrator',
  'list-manager': 'List manager',
  'collection-staff': 'Collection staff',
  'report-viewer': 'Report viewer',
};

export const PARTNER_ROLES = (Object.keys(ROLE_LABELS) as PartnerRole[]).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

export const roleLabel = (value: string) => ROLE_LABELS[value as PartnerRole] ?? value;

export interface ActionState {
  status: 'idle' | 'done' | 'error';
  message?: string;
  /** Invitation link to copy, present after invite and resend. Shown once; the token is not stored. */
  link?: string;
}
