/**
 * Authentication-related constants.
 */

export const AUTH_CONSTANTS = {
  JWT_ALGORITHM: 'HS256',
  USER_TOKEN_EXPIRY: '7d',
  GUEST_TOKEN_EXPIRY: '30d',
  JWT_SECRET_FALLBACK: 'findeg-dev-secret-key',
  GUEST_ID_PREFIX: 'guest_',
  GUEST_ROLE: 'guest',
} as const;

// Temporary compatibility export for the Identity response contract.
export { AUTH_SUCCESS_MESSAGES } from '../../../identity/contracts';
