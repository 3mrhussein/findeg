// ========================================
// DOMAIN LAYER EXPORTS
// ========================================
export * from "./domain/entities";

// ========================================
// APPLICATION LAYER EXPORTS
// ========================================
export * from "./application/interfaces/IUserRepository";
export * from "./application/interfaces/IPermissionService";
export type { IAuthService } from "./application/interfaces/IAuthService";
export * from "./application/interfaces/IAdminUserService";
export type {
  IAdminRoleService,
  RoleWithPermissions,
} from "./application/interfaces/IAdminRoleService";
// NOTE: AuthService NOT exported - has @ imports that break Turbopack
// Apps should use repository classes directly or implement own service wrappers
// export * from "./application/services/AuthService"; // REMOVED
// From JWTService: export only the service and types, not UnauthorizedError (use lib/errors instead)
export {
  JWTService,
  type TokenPair,
  type JWTPayload,
  type TokenType,
  type IJWTService,
} from "./application/services/JWTService";
export * from "./application/services/PermissionService";
// Service factory - exporting for apps to use (may require fixing @features/* imports in dependencies)
export { createIdentityServices } from "./application/services/factory";
// NOTE: auth-helpers.ts contains next/headers import and is app-layer concern, not exported from backend

// NOTE: login, logout, and other action/query functions are NOT exported because they use
// ServiceContainer with @ imports that break Turbopack bundling.
// Apps should use repository classes directly and implement own logic.
export { login, logout } from "./application/actions/auth";
// export { updateMyProfile } from "./application/actions/profile"; // REMOVED
// export { getDashboardData, type DashboardData } from "./application/queries/dashboard"; // REMOVED
// export { getMyAccountData, getMyOrderDetail, type MyAccountData } from "./application/queries/my-account"; // REMOVED

// ========================================
// INFRASTRUCTURE EXPORTS REMOVED
// ========================================
// DrizzleUserRepository is an infrastructure implementation.
// Apps should depend on IUserRepository interface instead.
