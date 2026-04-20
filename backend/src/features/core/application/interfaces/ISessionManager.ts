import type { SessionPayload } from "@findeg/backend/features/core/domain/auth";

/**
 * Session Manager Interface
 *
 * Defines the contract for session validation and authorization.
 * Following Clean Architecture, this allows swapping auth strategies (JWT, Session Cookies, OAuth, etc.)
 */
export interface ISessionManager {
  /**
   * Validates a session from a raw request
   * Extracts credentials (token/cookie) and verifies them.
   *
   * @param request - The incoming Request object
   * @returns The session payload if valid, null otherwise
   */
  validateSession(request: Request): Promise<SessionPayload | null>;

  /**
   * Checks if a given session has admin privileges
   *
   * @param session - The session payload to check
   * @returns true if the user is an admin
   */
  authorizeAdmin(session: SessionPayload): boolean;
}
