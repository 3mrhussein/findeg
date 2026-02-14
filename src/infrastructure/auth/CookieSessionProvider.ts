/**
 * Cookie Session Provider
 *
 * Implements ISessionProvider using JWT tokens stored in HttpOnly cookies.
 * Uses shared sessionVerifier for constants and verification.
 *
 * When splitting into separate apps, replace this with a Redis or
 * API-based session provider without changing the application layer.
 */

import { ISessionProvider } from "@/application/services/interfaces/ISessionProvider";
import { SessionPayload } from "@/domain/types/admin";
import { cookies } from "next/headers";
import { JwtSessionManager } from "./JwtSessionManager";

/**
 * Cookie-based session provider using JWT tokens
 *
 * Stores session as an HttpOnly cookie with JWT payload.
 * Verification and creation delegates to the JwtSessionManager.
 */
export class CookieSessionProvider implements ISessionProvider {
  private sessionManager = new JwtSessionManager();

  /**
   * Creates a new session by signing a JWT and setting it as an HttpOnly cookie
   *
   * @param payload - Session data to encode (userId, email, role)
   */
  async createSession(payload: SessionPayload): Promise<void> {
    const jwt = await this.sessionManager.createToken(payload);
    const { name, options } = this.sessionManager.getCookieSettings();

    const cookieStore = await cookies();
    cookieStore.set(name, jwt, options);
  }

  /**
   * Retrieves the current session from the cookie
   *
   * @returns Session payload if valid, null if missing or expired
   */
  async getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const { name } = this.sessionManager.getCookieSettings();
    const token = cookieStore.get(name)?.value;
    if (!token) return null;

    // Use validateSession which handles extraction or just verify directly if we have the token
    // Since ISessionProvider expects to work with the underlying storage, we can use verify directly if we had a method
    // But for now, we'll just use validateSession with a fake request if needed,
    // or better, ISessionProvider.getSession() should probably just be a part of the manager?
    // Actually, JwtSessionManager.validateSession works on a Request.
    // Let's add a verifyToken method to ISessionManager too for direct token verification.

    // For now, I'll just use the jose verify logic here directly or add verifyToken to JwtSessionManager
    return this.sessionManager.validateSession(
      new Request("http://localhost", {
        headers: { Cookie: `${name}=${token}` },
      }),
    );
  }

  /**
   * Deletes the current session by removing the cookie
   */
  async deleteSession(): Promise<void> {
    const { name } = this.sessionManager.getCookieSettings();
    const cookieStore = await cookies();
    cookieStore.delete(name);
  }
}
