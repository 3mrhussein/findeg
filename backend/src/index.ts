// Backend package main entry point - re-exports all public interfaces and services

// Core feature exports (shared types, domain models, errors)
export * from "./features/core";

// Identity feature exports (auth, users) - explicitly to avoid re-exporting errors
export * from "./features/identity/domain/entities";
export * from "./features/identity/application/interfaces/IUserRepository";
export * from "./features/identity/application/interfaces/IPermissionService";
export * from "./features/identity/application/services/AuthService";
// JWTService exported via identity/index.ts (which excludes UnauthorizedError)
import { JWTService, type TokenPair, type JWTPayload, type TokenType, type IJWTService } from "./features/identity/application/services/JWTService";
export { JWTService, type TokenPair, type JWTPayload, type TokenType, type IJWTService };
export * from "./features/identity/application/services/PermissionService";
export { login, logout } from "./features/identity/application/actions/auth";
export { updateMyProfile } from "./features/identity/application/actions/profile";
export { getDashboardData } from "./features/identity/application/queries/dashboard";
export { getMyAccountData, getMyOrderDetail } from "./features/identity/application/queries/my-account";

// Only export MediaService from media (MediaAsset comes from core to avoid conflicts)
export { MediaService } from "./features/media/application/services";

// Shared libraries (i18n utilities, error classes)
export * from "./lib";
