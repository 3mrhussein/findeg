import type { SessionPayload } from "@/features/core/domain/auth";
import type { ISessionProvider } from "@/features/core/application/interfaces/ISessionProvider";
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
   */
  async createSession(payload: SessionPayload): Promise<void> {
    const jwt = await this.sessionManager.createToken(payload);
    const { name, options } = this.sessionManager.getCookieSettings();

    const cookieStore = await cookies();
    cookieStore.set(name, jwt, options);
  }

  /**
   * Retrieves the current session from the cookie
   */
  async getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const { name } = this.sessionManager.getCookieSettings();
    const token = cookieStore.get(name)?.value;
    if (!token) return null;

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
