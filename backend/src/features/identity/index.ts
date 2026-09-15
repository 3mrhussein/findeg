// Public barrel for the identity feature. Only the factory, its consumed
// DTOs/types, and interfaces are exported here — JWTService, PermissionService,
// AuthService, AdminUserService, AdminRoleService, and
// CurrentSessionIdentityResolver are concrete implementation classes and stay
// internal to the backend package. See docs/adr/0001-backend-feature-barrels.md.
export type {
  AdminUser,
  CreateAdminInput,
  UpdateAdminInput,
  PermissionOverrideInput,
} from './application/interfaces/IAdminUserService';
export type { RoleWithPermissions } from './application/interfaces/IAdminRoleService';

export { createIdentityServices } from './application/services/factory';
