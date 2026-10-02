export const PARTNER_ROLES = [
  { value: 'partner-administrator', label: 'Partner Administrator' },
  { value: 'list-manager', label: 'List manager' },
  { value: 'collection-staff', label: 'Collection staff' },
  { value: 'report-viewer', label: 'Report viewer' },
] as const;

export type PartnerRoleValue = (typeof PARTNER_ROLES)[number]['value'];
