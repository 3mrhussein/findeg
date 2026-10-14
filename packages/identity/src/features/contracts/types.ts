import type { PortalRole, SessionPayload } from '@findeg/db/types';

/** Result of an authentication attempt (login or registration). */
export interface AuthResult {
  success: boolean;
  error?: string;
  /** Signed into the app layer's cookie after successful authentication. */
  session?: SessionPayload;
  user?: {
    id: number;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    portalRole: PortalRole;
    activeRoleIds?: SessionPayload['activeRoleIds'];
    permissionCodes?: SessionPayload['permissionCodes'];
    actorType?: SessionPayload['actorType'];
    organizationId?: SessionPayload['organizationId'];
  };
}

/** User with password hash, only for auth verification. Never expose it to the client. */
export interface UserWithPassword {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  portalRole: PortalRole;
  password: string | null;
}
