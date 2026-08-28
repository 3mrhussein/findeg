// ========================================
// DOMAIN LAYER EXPORTS
// ========================================
export * from './domain/entities';

// ========================================
// APPLICATION LAYER EXPORTS
// ========================================
export * from './application/dtos';
export * from './application/interfaces/IPermissionService';
export type { IAuthService } from './application/interfaces/IAuthService';
export * from './application/interfaces/IAdminUserService';
export type {
  IAdminRoleService,
  RoleWithPermissions,
} from './application/interfaces/IAdminRoleService';

// From JWTService: export only the service and types
export {
  JWTService,
  type TokenPair,
  type JWTPayload,
  type TokenType,
  type IJWTService,
} from './application/services/JWTService';
export * from './application/services/PermissionService';
export { CurrentSessionIdentityResolver } from './application/services/CurrentSessionIdentityResolver';

// Service factory
export { createIdentityServices } from './application/services/factory';
