/**
 * Session Provider Interface
 * 
 * Contract for session management abstraction.
 * Backend depends on this interface; app-layer provides concrete implementation.
 */

import type { SessionPayload } from "@/features/core/domain/auth";

export interface ISessionProvider {
  /**
   * Creates a new session with the given payload.
   * 
   * Implementation details:
   * - App-layer: Signs JWT, sets HttpOnly cookie
   * - Test: Stores session in memory map
   * 
   * @param payload - Session data (user ID, permissions, etc.)
   * @throws {Error} if session creation fails (e.g., JWT signing error)
   */
  createSession(payload: SessionPayload): Promise<void>;
  
  /**
   * Retrieves the current session from request context.
   * 
   * Implementation details:
   * - App-layer: Reads cookie, validates JWT
   * - Test: Returns mock session from memory
   * 
   * @returns Session payload if valid session exists, null otherwise
   */
  getSession(): Promise<SessionPayload | null>;
  
  /**
   * Deletes the current session.
   * 
   * Implementation details:
   * - App-layer: Clears session cookie
   * - Test: Removes session from memory map
   */
  deleteSession(): Promise<void>;
}

/**
 * Usage Example (Backend Service):
 * 
 * ```typescript
 * class AuthService {
 *   constructor(private sessionProvider: ISessionProvider) {}
 * 
 *   async login(email: string, password: string): Promise<LoginResult> {
 *     const user = await this.validateCredentials(email, password);
 *     if (!user) return { success: false, error: "Invalid credentials" };
 * 
 *     await this.sessionProvider.createSession({
 *       userId: user.id,
 *       user: { email: user.email, firstName: user.firstName, lastName: user.lastName },
 *       portalRole: user.portalRole,
 *       // ... other session fields
 *     });
 * 
 *     return { success: true, user };
 *   }
 * 
 *   async logout(): Promise<void> {
 *     await this.sessionProvider.deleteSession();
 *   }
 * }
 * ```
 * 
 * Usage Example (App-Layer Implementation):
 * 
 * ```typescript
 * import { cookies } from "next/headers";
 * import { ISessionProvider } from "@findeg/backend/features/core";
 * 
 * export class NextJsSessionProvider implements ISessionProvider {
 *   async createSession(payload: SessionPayload): Promise<void> {
 *     const jwt = await signJWT(payload);
 *     const cookieStore = await cookies();
 *     cookieStore.set("session", jwt, { httpOnly: true, secure: true, sameSite: "lax" });
 *   }
 * 
 *   async getSession(): Promise<SessionPayload | null> {
 *     const cookieStore = await cookies();
 *     const token = cookieStore.get("session")?.value;
 *     if (!token) return null;
 *     return validateJWT(token);
 *   }
 * 
 *   async deleteSession(): Promise<void> {
 *     const cookieStore = await cookies();
 *     cookieStore.delete("session");
 *   }
 * }
 * ```
 */
