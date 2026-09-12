export type Portal = 'storefront' | 'partner' | 'back-office';
export type PortalEntry = 'allowed' | 'authentication-required';

/**
 * Public entry policy for the target portal shells. Authenticated entry stays
 * closed until the PostgreSQL-backed Current Session operation lands in #54.
 * Legacy cookies and browser-supplied roles are deliberately not credentials.
 */
export function enterPortal(portal: Portal): PortalEntry {
  return portal === 'storefront' ? 'allowed' : 'authentication-required';
}
