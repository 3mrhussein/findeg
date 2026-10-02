import type { PartnerRole } from '@findeg/backend/features/partner-membership';

/** Typed by `PartnerRole`, so adding a role is a compile error until it has a label. */
export const ROLE_LABELS: Record<PartnerRole, string> = {
  'partner-administrator': 'Partner Administrator',
  'list-manager': 'List manager',
  'collection-staff': 'Collection staff',
  'report-viewer': 'Report viewer',
};

// `Object.keys` is typed `string[]`; the keys are exactly the `PartnerRole`s by the Record above.
export const PARTNER_ROLES = Object.keys(ROLE_LABELS) as PartnerRole[];
