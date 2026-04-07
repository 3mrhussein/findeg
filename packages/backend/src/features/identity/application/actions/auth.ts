/**
 * Pure TypeScript Authentication Actions
 *
 * These actions contain business logic only - no framework-specific calls.
 * App-layer (dashboard) handles redirect(), revalidatePath() after successful login/logout.
 *
 * This enables:
 * - Pure TypeScript execution in Vitest (no Next.js runtime needed)
 * - Framework portability
 * - Clear separation of concerns (backend = logic, app = framework integration)
 */

import { container } from "@features/core/infrastructure/di/ServiceContainer";
import { NotAuthenticatedError, ValidationError } from "@features/core/domain/errors";
import type { ServiceResult } from "@features/core/application/types";
import { isAdminSession, createUserVO } from "@features/core/domain/auth";
import type { SessionPayload } from "@features/core/domain/auth";

/**
 * Pure login service - no framework calls.
 *
 * Returns login result with data or throws validation error.
 * App-layer handles redirect() based on isAdmin flag and error type.
 */
export async function login(
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

  const authService = container.authService;
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
 *
 * Logout is purely an app-layer concern (removing cookies, clearing state).
 * Backend just returns success; app-layer handles the actual session deletion.
 *
 * App-layer handles redirect() after logout.
 */
export async function logout(): Promise<ServiceResult<void>> {
  return {
    success: true,
    cachePaths: ["/"],
  };
}
