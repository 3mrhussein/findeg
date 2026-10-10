/**
 * Account-wide portal roles. A person's portal role never changes what they may do for a
 * Business Partner: that is Partner Membership (GLOSSARY, ADR-0003).
 */
export const PORTAL_ROLES = ['customer', 'staff'] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];
