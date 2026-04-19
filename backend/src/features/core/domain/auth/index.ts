/**
 * Core auth domain types.
 *
 * Used by identity, administration, and middleware for authentication and session handling.
 */
export { AuthCredentialsSchema, type AuthCredentials } from "./AuthCredentials";
export type { AuthResult } from "./AuthResult";
export {
  PERMISSION_CODES,
  isSystemAdmin,
  isStaffRole,
  isSchoolRole,
  isCustomerRole,
  isAdminSession,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./authorization";
export { RegisterInputSchema, type RegisterInput } from "./RegisterInput";
export { SessionPayloadSchema, type SessionPayload } from "./SessionPayload";
export type { UserWithPassword } from "./UserWithPassword";
export { UserVOSchema, type UserVO, createUserVO } from "../value-objects/User";
