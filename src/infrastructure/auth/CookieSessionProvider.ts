/**
 * Cookie Session Provider
 *
 * Implements ISessionProvider using JWT tokens stored in HttpOnly cookies.
 * Uses `jose` for JWT creation/verification.
 *
 * When splitting into separate apps, replace this with a Redis or
 * API-based session provider without changing the application layer.
 */

import { ISessionProvider } from "@/application/services/interfaces/ISessionProvider";
import { SessionPayload } from "@/domain/types/admin";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "admin_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "findeg-admin-secret-key-change-in-production",
);
const SESSION_DURATION = 60 * 60 * 24; // 24 hours in seconds

/**
 *
 */
export class CookieSessionProvider implements ISessionProvider {
  /**
   *
   */
  async createSession(payload: SessionPayload): Promise<void> {
    const jwt = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION}s`)
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });
  }

  /**
   *
   */
  async getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return {
        userId: payload.userId as number,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch {
      return null;
    }
  }

  /**
   *
   */
  async deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}
