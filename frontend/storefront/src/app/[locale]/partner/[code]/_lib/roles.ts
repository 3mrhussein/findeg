import { PARTNER_ROLES as domainPartnerRoles, type PartnerRole } from '@findeg/domain';

/** Typed by `PartnerRole`, so adding a role is a compile error until it has a label. */
export const ROLE_LABELS = {
  'partner-administrator': 'Partner Administrator',
  'list-manager': 'List manager',
  'collection-staff': 'Collection staff',
  'report-viewer': 'Report viewer',
} satisfies Record<PartnerRole, string>;

// `Object.keys` is typed `string[]`; the keys are exactly the `PartnerRole`s by the Record above.
export const PARTNER_ROLES = domainPartnerRoles;
