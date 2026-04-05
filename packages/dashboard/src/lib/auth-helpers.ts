/**
 * Authentication Helper Functions
 *
 * Provides utility functions for authentication and authorization checks in Server Actions.
 * These helpers simplify common auth patterns and throw appropriate errors when checks fail.
 */

import {
  type ID,
  NotAuthenticatedError as UnauthorizedError,
  NotAuthorizedError as ForbiddenError
} from "@findeg/backend/features/core";
import { PermissionCode, RoleId } from "@findeg/backend/features/core";
import type { User } from "@findeg/backend/features/identity";
import type { IUserRepository, IPermissionService } from "@findeg/backend/features/identity";
import { cookies } from "next/headers";


/**
 * Get authenticated user from session/cookies
 * Throws UnauthorizedError if not authenticated
 *
 * Usage in Server Actions:
 * ```typescript
 * const user = await getAuthenticatedUser();
 * ```
 */
export async function getAuthenticatedUser(userRepository: IUserRepository): Promise<User> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    throw new UnauthorizedError("No active session. Please log in.");
  }

  // Parse session (simplified - in production, verify JWT or session token)
  let userId: ID;
  try {
    const session = JSON.parse(sessionCookie.value);
    userId = session.userId as ID;
  } catch (error) {
    throw new UnauthorizedError("Invalid session format.");
  }

  if (!userId) {
    throw new UnauthorizedError("Session missing user ID.");
  }

  const user = await userRepository.getById(userId);
  if (!user) {
    throw new UnauthorizedError("User not found.");
  }

  return user;
}

/**
 * Assert user has specific permission
 * Throws ForbiddenError if permission check fails
 *
 * Usage:
 * ```typescript
 * await requirePermission(userId, permissionService, 'products:delete');
 * ```
 */
export async function requirePermission(
  userId: ID,
  permissionService: IPermissionService,
  permission: PermissionCode,
): Promise<void> {
  const hasPermission = await permissionService.hasPermission(userId, permission);

  if (!hasPermission) {
    throw new ForbiddenError(`User does not have required permission: ${permission}`);
  }
}

/**
 * Assert user has specific role
 * Throws ForbiddenError if role check fails
 *
 * Usage:
 * ```typescript
 * await requireRole(userId, permissionService, 'admin');
 * ```
 */
export async function requireRole(
  userId: ID,
  permissionService: IPermissionService,
  role: RoleId,
): Promise<void> {
  const hasRole = await permissionService.hasRole(userId, role);

  if (!hasRole) {
    throw new ForbiddenError(`User does not have required role: ${role}`);
  }
}
