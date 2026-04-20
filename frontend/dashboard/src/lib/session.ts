/**
 * Dashboard Session Management (Next.js Integration)
 *
 * Lightweight session helpers using Next.js cookies() and jose library.
 * Mirrors backend's JwtSessionManager pattern but adapted for Next.js App Router.
 */

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@findeg/backend/features/core";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION = 60 * 60 * 24; // 24 hours in seconds
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "findeg-dev-secret-key");

/**
 * Get current session from cookies
 *
 * Extracts and verifies JWT from admin_session cookie.
 * Returns session payload if valid, null otherwise.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId || !payload.portalRole || !payload.user) {
      return null;
    }

    return {
      userId: payload.userId as number,
      portalRole: payload.portalRole as SessionPayload["portalRole"],
      user: payload.user as SessionPayload["user"],
      subjectId: payload.subjectId as string | undefined,
      actorType: payload.actorType as SessionPayload["actorType"],
      activeRoleIds: payload.activeRoleIds as string[] | undefined,
      permissionCodes: payload.permissionCodes as string[] | undefined,
      organizationId: payload.organizationId as string | undefined,
      tokenVersion: payload.tokenVersion as number | undefined,
    };
  } catch (error) {
    // Invalid or expired token
    return null;
  }
}

/**
 * Alias for getSession
 */
export const extractSession = getSession;

/**
 * Create and store session in cookies
 *
 * Creates signed JWT with session payload and sets secure cookie.
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

/**
 * Clear session cookies
 *
 * Removes admin_session cookie.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Require valid session or throw error
 *
 * Throws error if no valid session exists.
 * Use this in protected routes/actions.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Not authenticated");
  }

  return session;
}

/**
 * Get user ID from session
 *
 * Convenience method for extracting userId.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ? String(session.userId) : null;
}
