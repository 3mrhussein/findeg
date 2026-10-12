import type { Locale } from '../common';

/** Account-wide portal roles. They never grant Partner access, which comes only from Partner Membership (ADR-0003). */
export const PORTAL_ROLES = ['customer', 'staff'] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];

/** A person who shops on the storefront, browsing generally or fulfilling a School Supply List. */
export interface Customer {
  id: number;
  locale: Locale;
  portalRole: PortalRole;
}
