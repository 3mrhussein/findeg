import type { ICurrentSessionIdentityResolver, ICookieStore } from './CurrentSessionProvider';
import { CurrentSessionProvider } from './CurrentSessionProvider';
import { JwtSessionManager } from '../../infrastructure/auth/JwtSessionManager';

/**
 * Creates the shared Current Session module with FindEg's signed-cookie policy.
 *
 * Portal applications provide only request-cookie access and identity resolution;
 * the JWT implementation remains an internal core detail.
 */
export function createCurrentSessionProvider(
  cookieStore: ICookieStore,
  identityResolver: ICurrentSessionIdentityResolver,
): CurrentSessionProvider {
  return new CurrentSessionProvider(cookieStore, identityResolver, new JwtSessionManager());
}
