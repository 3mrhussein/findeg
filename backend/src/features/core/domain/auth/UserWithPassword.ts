import { Email, PortalRole } from '../types';

/**
 * User with password hash — only for auth verification.
 *
 * @description Used internally by UserRepository for password verification during login.
 * Never expose this type or the password field to the client.
 */
export interface UserWithPassword {
  id: number;
  email: Email;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  portalRole: PortalRole;
  password: string | null;
}
