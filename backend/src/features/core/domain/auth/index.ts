/**
 * Core auth domain types.
 *
 * Used by identity, administration, and middleware for authentication and session handling.
 */
export type { AuthResult } from './AuthResult';
export {
  PERMISSION_CODES,
  systemAdmin,
  staffRole,
  schoolRole,
  customerRole,
  adminSession,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from './authorization';
export { SessionPayloadSchema, type SessionPayload } from './SessionPayload';
export type { UserWithPassword } from './UserWithPassword';
export { UserVOSchema, type UserVO, createUserVO } from '../value-objects/User';
