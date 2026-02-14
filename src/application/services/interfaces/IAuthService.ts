/**
 * Auth Service Interface
 *
 * Defines the contract for authentication operations.
 * The implementation handles password verification and session management
 * through injected dependencies (IUserRepository + ISessionProvider).
 */

import { AuthResult, SessionPayload } from "@/domain/types/admin";

export interface IAuthService {
  login(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getSession(): Promise<SessionPayload | null>;
  validateAdmin(): Promise<SessionPayload>;
}
