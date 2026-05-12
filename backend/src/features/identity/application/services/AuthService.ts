/**
 * Auth Service Implementation
 *
 * Handles authentication logic. Depends on db query primitives
 * for user lookup and authorization resolution.
 *
 * Performs password verification but does NOT create sessions.
 * Session creation is app-layer responsibility (done via CookieSessionProvider in app-layer).
 *
 * Uses bcryptjs for password verification.
 */

import { IAuthService } from '../interfaces/IAuthService';
import { AuthResult, SessionPayload, createUserVO } from '../../../core/domain/auth';
import { adminSession, PERMISSION_CODES } from '../../../core/domain/auth/authorization';
import { RegisterInput } from '../dtos/RegisterInput';
import bcrypt from 'bcryptjs';
import { getErrorDefinition, resolveErrorMessage } from '../../../core/domain/errors';
import { userQueries } from '@findeg/db/queries';

/**
 * Authentication Service
 *
 * Handles user authentication and authorization context retrieval.
 * Uses bcryptjs for secure password verification.
 * Does NOT create sessions - that's the app-layer's responsibility.
 */
export class AuthService implements IAuthService {
  constructor() { }

  /**
   * Authenticates a user with email and password
   *
   * Validates credentials, checks admin role, and creates a session.
   *
   * @param email - User email address
   * @param password - Plain text password
   * @returns Authentication result with user data or error message
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userQueries.getByEmailWithPassword(email);

    if (!user) {
      return { success: false, error: getErrorDefinition('AUTH_INVALID_CREDENTIALS').message };
    }

    if (!user.password) {
      return { success: false, error: getErrorDefinition('AUTH_ACCOUNT_NO_PASSWORD').message };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: getErrorDefinition('AUTH_INVALID_CREDENTIALS').message };
    }

    const authorization = await userQueries.getAuthorizationContext(user.id);
    const activeRoleIds = Array.from(new Set([...(authorization.activeRoleIds || [])]));
    const permissionCodes = Array.from(
      new Set([
        ...(authorization.permissionCodes || []),
        ...(user.portalRole === 'staff' || user.portalRole === 'school_staff'
          ? [PERMISSION_CODES.ADMIN_PORTAL]
          : []),
      ]),
    );

    const payload: SessionPayload = {
      userId: user.id,
      portalRole: user.portalRole,
      user: createUserVO({
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      }),
      subjectId: String(user.id),
      actorType: 'user',
      activeRoleIds,
      permissionCodes,
      organizationId: authorization.organizationId,
      tokenVersion: 1,
    };

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phone: user.phone || undefined,
        portalRole: user.portalRole,
        activeRoleIds: payload.activeRoleIds,
        permissionCodes: payload.permissionCodes,
        actorType: payload.actorType,
        organizationId: payload.organizationId,
      },
    };
  }

  /**
   * Registers a new user account and logs them in automatically.
   *
   * @param input - Registration data including email, password, and profile details.
   * @returns Authentication result containing the new user profile or an error message.
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    try {
      // Check if user exists
      const existing = await userQueries.getByEmail(input.email);
      if (existing) {
        return {
          success: false,
          error: getErrorDefinition('AUTH_EMAIL_ALREADY_REGISTERED').message,
        };
      }

      // Hash password
      const password = await bcrypt.hash(input.password, 10);

      // Create user
      const user = await userQueries.create({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        portalRole: 'customer',
      });

      // Save password
      await userQueries.upsertPasswordCredentials(user.id, {
        passwordHash: password,
        hashStrategy: 'bcrypt',
      });

      // Log them in automatically
      return this.login(input.email, input.password);
    } catch (error) {
      return {
        success: false,
        error: resolveErrorMessage(error, 'AUTH_REGISTER_FAILED'),
      };
    }
  }

  /**
   * NOT IMPLEMENTED IN BACKEND
   * Logout is an app-layer concern. The app-layer handles session deletion.
   * @throws Error - This function should not be called from backend
   */
  async logout(): Promise<void> {
    throw new Error('logout() should not be called in backend - handle in app-layer');
  }

  /**
   * NOT IMPLEMENTED IN BACKEND
   * Session retrieval is an app-layer concern. The app-layer retrieves from cookies.
   * @throws Error - This function should not be called from backend
   */
  async getSession(): Promise<SessionPayload | null> {
    throw new Error('getSession() should not be called in backend - handle in app-layer');
  }

  /**
   * NOT IMPLEMENTED IN BACKEND
   * Session validation is an app-layer concern.
   * @throws Error - This function should not be called from backend
   */
  async validateAdmin(): Promise<SessionPayload> {
    throw new Error('validateAdmin() should not be called in backend - handle in app-layer');
  }

  /**
   * Validates that the current user is an admin
   *
   * Note: Session validation happens in app-layer.
   * This is a helper to check authorization after session is verified.
   *
   * @param session - The session payload to validate
   * @returns True if the user is an admin
   */
  adminSession(session: SessionPayload): boolean {
    return adminSession(session);
  }
}
