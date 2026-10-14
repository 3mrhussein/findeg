import { userQueries } from '@findeg/db/queries';
import type { SessionPayload } from '@findeg/db/types';
import { PERMISSION_CODES, createUserVO } from '../contracts';
import type {
  CurrentAuthorizationContext,
  CurrentSessionIdentity,
  CurrentSessionUser,
  ICurrentSessionIdentityResolver,
} from './types';

/** Builds the authorization snapshot embedded in a Current Session. */
export function buildCurrentSessionPayload(
  user: CurrentSessionUser,
  authorization: CurrentAuthorizationContext,
): SessionPayload {
  const activeRoleIds = Array.from(new Set(authorization.activeRoleIds));
  const permissionCodes = Array.from(
    new Set([
      ...authorization.permissionCodes,
      ...(user.portalRole === 'staff' ? [PERMISSION_CODES.ADMIN_PORTAL] : []),
    ]),
  );

  return {
    userId: user.id,
    portalRole: user.portalRole,
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

/** Loads the active User and current authorization context for Current Session resolution. */
export class CurrentSessionIdentityResolver implements ICurrentSessionIdentityResolver {
  async resolve(userId: number): Promise<CurrentSessionIdentity | null> {
    const user = await userQueries.getById(userId);
    if (!user?.isActive) return null;

    const authorization = await userQueries.getAuthorizationContext(user.id);
    const session = buildCurrentSessionPayload(user, authorization);

    return { authorizationVersion: user.authorizationVersion, session };
  }
}
