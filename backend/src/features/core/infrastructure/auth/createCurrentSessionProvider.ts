import type {
  ICurrentSessionIdentityResolver,
  ICookieStore,
} from '../../application/services/CurrentSessionProvider';
import { CurrentSessionProvider } from '../../application/services/CurrentSessionProvider';
import { JwtSessionManager } from './JwtSessionManager';

/**
 * Composition root for FindEg's signed-cookie Current Session implementation.
 * The application module receives the codec through its constructor; this
 * infrastructure factory is the only place that selects the JWT adapter.
 */
export function createCurrentSessionProvider(
  cookieStore: ICookieStore,
  identityResolver: ICurrentSessionIdentityResolver,
): CurrentSessionProvider {
  return new CurrentSessionProvider(cookieStore, identityResolver, new JwtSessionManager());
}
