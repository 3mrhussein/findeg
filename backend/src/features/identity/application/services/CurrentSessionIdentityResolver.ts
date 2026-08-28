import { userQueries } from '@findeg/db/queries';
import type {
  CurrentSessionIdentity,
  ICurrentSessionIdentityResolver,
} from '../../../core/application/services/CurrentSessionProvider';
import { buildCurrentSessionPayload } from './buildCurrentSessionPayload';

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
