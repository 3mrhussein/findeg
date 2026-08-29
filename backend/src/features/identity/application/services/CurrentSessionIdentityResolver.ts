import { userQueries } from '@findeg/db/queries';
import type {
  CurrentSessionIdentity,
  ICurrentSessionIdentityResolver,
} from '../../../core/application/services/CurrentSessionProvider';
import {
  defaultActivePortalForRole,
  eligibleActivePortalsForRole,
  type ActivePortal,
} from '@findeg/db';
import { buildCurrentSessionPayload } from './buildCurrentSessionPayload';

/** Loads the active User and current authorization context for Current Session resolution. */
export class CurrentSessionIdentityResolver implements ICurrentSessionIdentityResolver {
  async resolve(userId: number, requestedPortal?: ActivePortal): Promise<CurrentSessionIdentity | null> {
    const user = await userQueries.getById(userId);
    if (!user?.isActive) return null;

    const authorization = await userQueries.getAuthorizationContext(user.id);
    const eligiblePortals = eligibleActivePortalsForRole(user.portalRole);
    const activePortal = requestedPortal && eligiblePortals.includes(requestedPortal)
      ? requestedPortal
      : defaultActivePortalForRole(user.portalRole);
    const session = buildCurrentSessionPayload(user, authorization, activePortal);

    return { authorizationVersion: user.authorizationVersion, session, eligiblePortals };
  }
}
