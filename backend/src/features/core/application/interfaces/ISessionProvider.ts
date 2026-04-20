import type { SessionPayload } from "@findeg/backend/features/core/domain/auth";

/**
 * Session Provider Interface
 *
 * Abstraction for session storage. Currently implemented with cookies/JWT,
 * but can be swapped for Redis, DB sessions, or external auth service.
 */
export interface ISessionProvider {
  /**
   * Persists a new session with the given payload.
   * Typically sets a secure, HTTP-only cookie or updates a token store.
   *
   * @param payload - The data to be stored in the session.
   */
  createSession(payload: SessionPayload): Promise<void>;

  /**
   * Retrieves the current session payload from storage.
   * Verifies authenticity and expiration.
   *
   * @returns The session payload if valid and present, null otherwise.
   */
  getSession(): Promise<SessionPayload | null>;

  /**
   * Destroys the current session.
   * Clears cookies or invalidates tokens.
   */
  deleteSession(): Promise<void>;
}
