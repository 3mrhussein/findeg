// Backend package main entry point - re-exports all public interfaces and services
import { createIdentityServices } from './features/identity/application/services/factory';
import { createOrderServices } from './features/order/application/services/factory';
import { UpdateAdminInput } from './features/identity/application/interfaces/IUserService';

// Core feature exports (shared types, domain models, errors)
export * from './features/core';

// Identity feature exports (auth, users)
export * from './features/identity/domain/entities';
export type { User, Address } from './features/identity/domain/entities';

export * from './features/identity/application/interfaces/IUserRepository';
export * from './features/identity/application/interfaces/IPermissionService';
export * from './features/identity/application/services/AuthService';

// JWT Service
import {
  JWTService,
  type TokenPair,
  type JWTPayload,
  type TokenType,
  type IJWTService,
} from './features/identity/application/services/JWTService';
export { JWTService, type TokenPair, type JWTPayload, type TokenType, type IJWTService };

/**
 * Identity Exports (Wrappers for backward compatibility)
 */
export async function login(email: string | { email: string; password?: string }, password?: string) {
  const { auth } = createIdentityServices();
  // Handle both (email, password) and ({ email, password }) signatures
  if (typeof email === 'object' && !password) {
    return auth.login(email.email, email.password!);
  }
  return auth.login(email as string, password!);
}

export async function logout() {
  return { success: true };
}


export async function updateMyProfile(userId: number, input: UpdateAdminInput) {
  const { userService } = createIdentityServices();
  return userService.updateAdmin(userId, input);
}

export async function getDashboardData(locale: string, userId: number) {
  const { userService } = createIdentityServices();
  return userService.getDashboardData(locale, userId);
}

export async function getMyAccountData(userId: number) {
  const { userService } = createIdentityServices();
  return userService.getProfileData(userId);
}

export async function getMyOrderDetail(orderId: number) {
  const { orders } = createOrderServices();
  return orders.getById(orderId);
}

// Only export MediaService from media
export { MediaService } from './features/media/application/services';

// School feature exports
export * from './features/school';

// Shared libraries
export * from './lib';
