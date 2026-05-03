import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload } from '@findeg/backend/features/core/domain/auth';
import { adminSession } from '@findeg/backend/features/core/domain/auth/authorization';
import type { ISessionManager } from '@findeg/backend/features/core/application/interfaces/ISessionManager';
import type { PortalRole } from '@findeg/backend/features/core/domain/types/common';
import env from '@findeg/env';

/**
 * JWT implementation of SessionManager
 *
 * Uses 'jose' library for Edge runtime compatibility.
 * Handles token extraction from Authorization header or cookies.
 */
export class JwtSessionManager implements ISessionManager {
  private readonly SESSION_COOKIE_NAME = 'admin_session';
  private readonly SESSION_DURATION = 60 * 60 * 24; // 24 hours
  private readonly JWT_SECRET: Uint8Array;

  /**
   *
   */
  constructor() {
    this.JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
  }

  /**
   * Validates a session from a raw request
   */
  async validateSession(request: Request): Promise<SessionPayload | null> {
    try {
      const token = this.extractToken(request);
      if (!token) return null;

      const { payload } = await jwtVerify(token, this.JWT_SECRET);

      if (!payload.userId || !payload.portalRole || !payload.user) {
        return null;
      }

      return {
        userId: payload.userId as number,
        portalRole: payload.portalRole as PortalRole,
        user: payload.user as SessionPayload['user'],
        subjectId: payload.subjectId as string | undefined,
        actorType: payload.actorType as SessionPayload['actorType'],
        activeRoleIds: payload.activeRoleIds as string[] | undefined,
        permissionCodes: payload.permissionCodes as string[] | undefined,
        organizationId: payload.organizationId as string | undefined,
        tokenVersion: payload.tokenVersion as number | undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Checks if user has admin role
   */
  authorizeAdmin(session: SessionPayload): boolean {
    return adminSession(session);
  }

  /**
   * Creates a new signed JWT token
   */
  async createToken(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${this.SESSION_DURATION}s`)
      .sign(this.JWT_SECRET);
  }

  /**
   * Returns standardized cookie settings
   */
  getCookieSettings() {
    return {
      name: this.SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: this.SESSION_DURATION,
        path: '/',
      },
    };
  }

  /**
   *
   */
  private extractToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`${this.SESSION_COOKIE_NAME}=([^;]+)`));
      if (match) return match[1];
    }

    return null;
  }
}
