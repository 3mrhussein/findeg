"use server";

/**
 * Pure TypeScript Authentication Actions
 *
 * These actions contain business logic only - no framework-specific calls.
 * They accept the necessary services as arguments to avoid infrastructure leakage.
 */

import { NotAuthenticatedError, ValidationError } from "@backend/features/core/domain/errors";
import type { ServiceResult } from "@backend/features/core/application/types";
import { isAdminSession, createUserVO } from "@backend/features/core/domain/auth";
import type { SessionPayload } from "@backend/features/core/domain/auth";
import type { IAuthService } from "../interfaces/IAuthService";

/**
 * Pure login service - no framework calls.
 *
 * @param authService - Injected authentication service
 * @param email - User email
 * @param password - User password
 */
export async function login(
  authService: IAuthService,
  email: string,
  password: string,
): Promise<
  ServiceResult<{
    userId: number;
    email: string;
    isAdmin: boolean;
  }>
> {
  if (!email?.trim()) {
    throw new ValidationError("email", "Email is required");
  }

  if (!password) {
    throw new ValidationError("password", "Password is required");
  }

  const result = await authService.login(email, password);

  if (!result.success) {
    throw new ValidationError("credentials", result.error || "Invalid email or password");
  }

  if (!result.user) {
    throw new ValidationError("credentials", "Login failed");
  }

  const sessionLike: SessionPayload = {
    userId: result.user.id,
    user: createUserVO({
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
    }),
    portalRole: result.user.portalRole,
    activeRoleIds: result.user.activeRoleIds,
    permissionCodes: result.user.permissionCodes,
    actorType: result.user.actorType,
    organizationId: result.user.organizationId,
  };

  const isAdmin = isAdminSession(sessionLike);

  return {
    success: true,
    data: {
      userId: result.user.id,
      email: result.user.email,
      isAdmin,
    },
    cachePaths: ["/"],
  };
}

/**
 * Pure logout service - no framework calls.
 */
export async function logout(): Promise<ServiceResult<void>> {
  return {
    success: true,
    cachePaths: ["/"],
  };
}
