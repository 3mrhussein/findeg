import { PARTNER_ROLES as domainPartnerRoles, type PartnerRole } from '@findeg/domain';

const roleLabels = {
  'partner-administrator': 'Partner Administrator',
  'list-manager': 'List manager',
  'collection-staff': 'Collection staff',
  'report-viewer': 'Report viewer',
} satisfies Record<PartnerRole, string>;

export const PARTNER_ROLES = domainPartnerRoles.map((value) => ({
  value,
  label: roleLabels[value],
}));
export type PartnerRoleValue = PartnerRole;
