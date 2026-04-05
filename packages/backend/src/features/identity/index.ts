export * from "./domain/entities";
export * from "./application/interfaces/IUserRepository";
export * from "./application/interfaces/IPermissionService";
export * from "./application/services/AuthService";
// From JWTService: export only the service and types, not UnauthorizedError (use lib/errors instead)
export { JWTService, type TokenPair, type JWTPayload, type TokenType, type IJWTService } from "./application/services/JWTService";
export * from "./application/services/PermissionService";
// NOTE: auth-helpers.ts contains next/headers import and is app-layer concern, not exported from backend
export * from "./infrastructure/persistence/DrizzleUserRepository";

// Explicit exports for pure TypeScript actions and queries (to avoid re-exporting imports)
export { login, logout } from "./application/actions/auth";
export { updateMyProfile } from "./application/actions/profile";
export { getDashboardData } from "./application/queries/dashboard";
export { getMyAccountData, getMyOrderDetail } from "./application/queries/my-account";
