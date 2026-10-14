import type { Email, SessionPayload } from '@findeg/db/types';
import type { AuthResult } from '../contracts';
import type { RegisterInput } from './helpers';

export interface IAuthService {
  /** Authenticates a user with email and password, returning the Current Session payload on success. */
  login(email: Email, password: string): Promise<AuthResult>;
  /** Registers a new Customer account and logs it in. */
  register(input: RegisterInput): Promise<AuthResult>;
  /** Session destruction is an app-layer concern. */
  logout(): Promise<void>;
  /** Session retrieval is an app-layer concern. */
  getSession(): Promise<SessionPayload | null>;
  /** Session validation is an app-layer concern. */
  validateAdmin(): Promise<SessionPayload>;
}
