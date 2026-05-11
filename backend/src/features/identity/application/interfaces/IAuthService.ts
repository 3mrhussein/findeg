/**
 * Auth Service Interface
 *
 * Defines the contract for authentication operations.
 * The implementation handles password verification and session management
 * through injected dependencies (IUserRepository + ISessionProvider).
 */

import { Email } from '@findeg/backend/features/core/domain/types/common';
import {
  AuthResult,
  SessionPayload,
} from '@findeg/backend/features/core/domain/auth';
import { RegisterInput } from '../dtos/RegisterInput';

export interface IAuthService {
  /**
   * Authenticates a user with email and password.
   * If successful, an authentication session is created.
   *
   * @param email - User's email address.
   * @param password - User's plain-text password.
   * @returns AuthResult containing success status and optional user data or error message.
   */
  login(email: Email, password: string): Promise<AuthResult>;

  /**
   * Registers a new user account.
   *
   * @param input - Registration data (name, email, password, etc.).
   * @returns AuthResult containing success status and optional user data or error message.
   */
  register(input: RegisterInput): Promise<AuthResult>;

  /**
   * Destroys the current authentication session.
   */
  logout(): Promise<void>;

  /**
   * Retrieves the current session payload if the user is authenticated.
   *
   * @returns SessionPayload if authenticated, null otherwise.
   */
  getSession(): Promise<SessionPayload | null>;

  /**
   * Validates that the current session has administrative privileges.
   * Throws an error if not authorized.
   *
   * @returns SessionPayload of the admin user.
   */
  validateAdmin(): Promise<SessionPayload>;
}
