/**
 * API Middleware
 *
 * Authentication and authorization wrappers for REST API endpoints.
 * Uses the shared sessionVerifier for token extraction and verification.
 * Each wrapper adds its own response behavior (401/403 JSON).
 */

import { apiErrorByCode } from "./api-response";
import { JwtSessionManager } from "@/features/core/infrastructure/auth/JwtSessionManager";
import type { SessionPayload } from "@/features/core/domain/auth";

const sessionManager = new JwtSessionManager();

/**
 * Request context with authenticated user
 */
export interface AuthContext {
  user: SessionPayload;
}

/**
 * Authentication middleware
 *
 * Validates JWT token and enriches request with user context.
 * Returns 401 error if token is missing or invalid.
 *
 * @param request - Request object
 * @param handler - Route handler function that receives auth context
 * @returns Response from handler or 401 error
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   return withAuth(request, async (context) => {
 *     const userId = context.user.userId;
 *     return apiResponse({ data: "protected" });
 *   });
 * }
 * ```
 */
export async function withAuth(
  request: Request,
  handler: (context: AuthContext) => Promise<Response>,
): Promise<Response> {
  const user = await sessionManager.validateSession(request);
  if (!user) {
    return apiErrorByCode("AUTH_UNAUTHORIZED");
  }

  return handler({ user });
}

/**
 * Admin authorization middleware
 *
 * Validates JWT token AND verifies user has admin role.
 * Returns 401 if not authenticated, 403 if not admin.
 *
 * @param request - Request object
 * @param handler - Route handler function that receives auth context
 * @returns Response from handler or 401/403 error
 *
 * @example
 * ```typescript
 * export async function DELETE(request: Request) {
 *   return withAdmin(request, async (context) => {
 *     await deleteProduct(id);
 *     return apiResponse({ success: true });
 *   });
 * }
 * ```
 */
export async function withAdmin(
  request: Request,
  handler: (context: AuthContext) => Promise<Response>,
): Promise<Response> {
  return withAuth(request, async (context) => {
    if (!sessionManager.authorizeAdmin(context.user)) {
      return apiErrorByCode("AUTH_ADMIN_REQUIRED");
    }
    return handler(context);
  });
}

/**
 * Optional authentication middleware
 *
 * Attempts to authenticate but doesn't fail if token is missing.
 * Useful for endpoints that work for both guests and authenticated users.
 *
 * @param request - Request object
 * @param handler - Route handler function that receives optional auth context
 * @returns Response from handler
 */
export async function withOptionalAuth(
  request: Request,
  handler: (context: { user: SessionPayload | null }) => Promise<Response>,
): Promise<Response> {
  const user = await sessionManager.validateSession(request);
  return handler({ user });
}
