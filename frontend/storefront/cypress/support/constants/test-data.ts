/**
 * Reusable test input payloads for Cypress scenarios.
 */
export const GUEST_CHECKOUT_DATA = {
  fullName: 'Cypress Guest',
  email: 'guest.cypress@example.com',
  phone: '01012345678',
  city: 'Cairo',
  area: 'Nasr City',
  street: 'Street 10',
} as const;
