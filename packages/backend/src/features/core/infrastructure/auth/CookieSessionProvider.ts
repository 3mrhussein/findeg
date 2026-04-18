import type { SessionPayload } from "@backend/features/core/domain/auth";
import type { ISessionProvider } from "@backend/features/core/application/interfaces/ISessionProvider";
import { JwtSessionManager } from "./JwtSessionManager";

/**
 * Cookie store interface - abstracts Next.js cookies() API
 *
 * Allows CookieSessionProvider to be testable without Next.js runtime.
 * Apps inject real cookie store from Next.js; tests inject mocks.
 */
export interface ICookieStore {
  /**
   * Get a cookie value by name
   */
  get(name: string): { value: string } | undefined;

  /**
   * Set a cookie with name, value, and options
   */
  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      maxAge?: number;
      path?: string;
    },
  ): void;

  /**
   * Delete a cookie by name
   */
  delete(name: string): void;
}

/**
 * Cookie-based session provider using JWT tokens
 *
 * Stores session as an HttpOnly cookie with JWT payload.
 * Verification and creation delegates to the JwtSessionManager.
 *
 * Pure TypeScript - no Next.js imports. Cookie store is injected.
 */
export class CookieSessionProvider implements ISessionProvider {
  private sessionManager = new JwtSessionManager();

  /**
   * Creates a new CookieSessionProvider with injected cookie store
   *
   * @param cookieStore - Injected cookie store implementation (real Next.js or mock in tests)
   */
  constructor(private cookieStore: ICookieStore) {}

  /**
   * Creates a new session by signing a JWT and setting it as an HttpOnly cookie
   */
  async createSession(payload: SessionPayload): Promise<void> {
    const jwt = await this.sessionManager.createToken(payload);
    const { name, options } = this.sessionManager.getCookieSettings();

    this.cookieStore.set(name, jwt, options);
  }

  /**
   * Retrieves the current session from the cookie
   */
  async getSession(): Promise<SessionPayload | null> {
    const { name } = this.sessionManager.getCookieSettings();
    const token = this.cookieStore.get(name)?.value;
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
    this.cookieStore.delete(name);
  }
}
