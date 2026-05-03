import { User } from '../entities/User';
import { Email, PortalRole } from '@findeg/backend/features/core/domain/types/common';
import type { SessionPayload as CoreSessionPayload } from '@findeg/backend/features/core/domain/auth';

export type SessionPayload = CoreSessionPayload;

export interface AuthResult {
  success: boolean;
  user?: Partial<User>;
  error?: string;
}

export interface UserWithPassword extends Omit<Partial<User>, 'portalRole' | 'email'> {
  id: number;
  email: Email;
  portalRole: PortalRole;
  password?: string | null;
}
