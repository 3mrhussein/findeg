/**
 * Auth Service Implementation
 *
 * Handles authentication logic. Depends on:
 * - IUserRepository: to look up users
 * - ISessionProvider: to create/verify/delete sessions
 *
 * Uses bcryptjs for password verification.
 * When splitting apps, swap ISessionProvider implementation.
 */

import { IAuthService } from "../interfaces/IAuthService";
import { IUserRepository } from "../interfaces/IUserRepository";
import { ISessionProvider } from "@/features/core/application/interfaces/ISessionProvider";
import { AuthResult, RegisterInput, SessionPayload } from "@/features/core/domain/auth";
import bcrypt from "bcryptjs";
import { getErrorDefinition, resolveErrorMessage } from "@/features/core/domain/errors";

/**
 * Authentication Service
 *
 * Handles user authentication, session management, and admin validation.
 * Uses bcryptjs for secure password verification.
 */
export class AuthService implements IAuthService {
  /**
   * Creates an instance of AuthService
   *
   * @param userRepository - User data access layer
   * @param sessionProvider - Session management provider (cookie-based or JWT)
   */
  constructor(
    private userRepository: IUserRepository,
    private sessionProvider: ISessionProvider,
  ) {}

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
    const user = await this.userRepository.getByEmailWithPassword(email);

    if (!user) {
      return { success: false, error: getErrorDefinition("AUTH_INVALID_CREDENTIALS").message };
    }

    if (!user.password) {
      return { success: false, error: getErrorDefinition("AUTH_ACCOUNT_NO_PASSWORD").message };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: getErrorDefinition("AUTH_INVALID_CREDENTIALS").message };
    }

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    await this.sessionProvider.createSession(payload);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phone: user.phone || undefined,
        role: user.role,
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
      const existing = await this.userRepository.getByEmail(input.email);
      if (existing) {
        return {
          success: false,
          error: getErrorDefinition("AUTH_EMAIL_ALREADY_REGISTERED").message,
        };
      }

      // Hash password
      const password = await bcrypt.hash(input.password, 10);
      const displayName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();

      // Create user
      const user = await this.userRepository.create({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        name: displayName || undefined,
        phone: input.phone,
        password,
        role: "user",
      } as any);

      // Log them in automatically
      return this.login(input.email, input.password);
    } catch (error) {
      return {
        success: false,
        error: resolveErrorMessage(error, "AUTH_REGISTER_FAILED"),
      };
    }
  }

  /**
   * Logs out the current user
   *
   * Deletes the active session (cookie or token invalidation).
   */
  async logout(): Promise<void> {
    await this.sessionProvider.deleteSession();
  }

  /**
   * Retrieves the current session payload
   *
   * @returns Session payload with user ID, email, and role, or null if not authenticated
   */
  async getSession(): Promise<SessionPayload | null> {
    return this.sessionProvider.getSession();
  }

  /**
   * Validates that the current user is an admin
   *
   * @returns Session payload if user is authenticated and has admin role
   * @throws Error if not authenticated or not an admin
   */
  async validateAdmin(): Promise<SessionPayload> {
    const session = await this.sessionProvider.getSession();
    if (!session) {
      throw new Error(getErrorDefinition("AUTH_UNAUTHORIZED").message);
    }
    if (session.role !== "admin") {
      throw new Error(getErrorDefinition("AUTH_ADMIN_REQUIRED").message);
    }
    return session;
  }
}
