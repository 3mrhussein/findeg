import type { SessionPayload } from '@findeg/db/types';

/** The User fields a Current Session is built from. */
export interface CurrentSessionUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  portalRole: SessionPayload['portalRole'];
  authorizationVersion: number;
}

/** The authorization snapshot embedded in a Current Session. */
export interface CurrentAuthorizationContext {
  activeRoleIds: string[];
  permissionCodes: string[];
  organizationId?: string;
}

/** The active identity and authorization context for a User, resolved by the backend session provider. */
export interface CurrentSessionIdentity {
  authorizationVersion: number;
  session: SessionPayload;
}

export interface ICurrentSessionIdentityResolver {
  resolve(userId: number): Promise<CurrentSessionIdentity | null>;
}
