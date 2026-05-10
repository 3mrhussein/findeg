import { PortalRole } from '../types';
import type { SessionPayload } from './SessionPayload';

/**
 * Result of an authentication attempt (login or registration).
 *
 * @description Returned by AuthService.login and AuthService.register.
 */
export interface AuthResult {
  success: boolean;
  error?: string;
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
