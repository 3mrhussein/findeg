import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { EmailSchema } from '@findeg/db';
import { userQueries } from '@findeg/db/queries';
import type { SessionPayload } from '@findeg/db/types';
import { AUTH_ERROR_CATALOG } from '../../constants';
import { adminSession, type AuthResult } from '../contracts';
import { buildCurrentSessionPayload } from '../current-session';
import type { IAuthService } from './types';

export const AuthCredentialsSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;

export const RegisterInputSchema = z
  .object({
    email: EmailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

function resolveRegisterMessage(error: unknown): string {
  if (error instanceof Error && error.message?.trim()) return error.message;
  return AUTH_ERROR_CATALOG.AUTH_REGISTER_FAILED.message;
}

/**
 * Authentication service. Verifies passwords and resolves the authorization snapshot; it does not
 * create or destroy sessions, which the app layer owns through the backend session provider.
 */
export class AuthService implements IAuthService {
  /** Authenticates a user with email and password. */
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userQueries.getByEmailWithPassword(email);

    if (!user) {
      return { success: false, error: AUTH_ERROR_CATALOG.AUTH_INVALID_CREDENTIALS.message };
    }

    if (!user.password) {
      return { success: false, error: AUTH_ERROR_CATALOG.AUTH_ACCOUNT_NO_PASSWORD.message };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid || !user.isActive) {
      return { success: false, error: AUTH_ERROR_CATALOG.AUTH_INVALID_CREDENTIALS.message };
    }

    const authorization = await userQueries.getAuthorizationContext(user.id);
    const payload: SessionPayload = buildCurrentSessionPayload(user, authorization);

    return {
      success: true,
      session: payload,
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

  /** Registers a new Customer account, stores its bcrypt credential, and logs it in. */
  async register(input: RegisterInput): Promise<AuthResult> {
    try {
      const existing = await userQueries.getByEmail(input.email);
      if (existing) {
        return {
          success: false,
          error: AUTH_ERROR_CATALOG.AUTH_EMAIL_ALREADY_REGISTERED.message,
        };
      }

      const password = await bcrypt.hash(input.password, 10);

      const user = await userQueries.create({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        portalRole: 'customer',
      });

      await userQueries.upsertPasswordCredentials(
        user.id,
        { passwordHash: password, hashStrategy: 'bcrypt' },
        { isInitialCredential: true },
      );

      return this.login(input.email, input.password);
    } catch (error) {
      return { success: false, error: resolveRegisterMessage(error) };
    }
  }

  /** Logout is an app-layer concern. */
  async logout(): Promise<void> {
    throw new Error('logout() should not be called in backend - handle in app-layer');
  }

  /** Session retrieval is an app-layer concern. */
  async getSession(): Promise<SessionPayload | null> {
    throw new Error('getSession() should not be called in backend - handle in app-layer');
  }

  /** Session validation is an app-layer concern. */
  async validateAdmin(): Promise<SessionPayload> {
    throw new Error('validateAdmin() should not be called in backend - handle in app-layer');
  }

  /** Whether a verified session carries administrative privileges. */
  adminSession(session: SessionPayload): boolean {
    return adminSession(session);
  }
}
