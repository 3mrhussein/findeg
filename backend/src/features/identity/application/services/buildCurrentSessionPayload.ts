import type { SessionPayload } from '../../../core/domain/auth';
import { createUserVO } from '../../../core/domain/auth';
import { PERMISSION_CODES } from '../../../core/domain/auth/authorization';
import { defaultActivePortalForRole, type ActivePortal } from '@findeg/db';

export interface CurrentSessionUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  portalRole: SessionPayload['portalRole'];
  authorizationVersion: number;
}

export interface CurrentAuthorizationContext {
  activeRoleIds: string[];
  permissionCodes: string[];
  organizationId?: string;
}

/** Builds the authorization snapshot embedded in a Current Session. */
export function buildCurrentSessionPayload(
  user: CurrentSessionUser,
  authorization: CurrentAuthorizationContext,
  activePortal: ActivePortal = defaultActivePortalForRole(user.portalRole),
): SessionPayload {
  const activeRoleIds = Array.from(new Set(authorization.activeRoleIds));
  const permissionCodes = Array.from(
    new Set([
      ...authorization.permissionCodes,
      ...(user.portalRole === 'staff' || user.portalRole === 'school_staff'
        ? [PERMISSION_CODES.ADMIN_PORTAL]
        : []),
    ]),
  );

  return {
    userId: user.id,
    portalRole: user.portalRole,
    activePortal,
    user: createUserVO({
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
    }),
    subjectId: String(user.id),
    actorType: 'user',
    activeRoleIds,
    permissionCodes,
    organizationId: authorization.organizationId,
    tokenVersion: user.authorizationVersion,
  };
}
