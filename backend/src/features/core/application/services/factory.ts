import type { ISessionProvider } from '../interfaces/ISessionProvider';
import type { ICookieStore } from './CurrentSessionProvider';
import { CookieSessionProvider } from '../../infrastructure/auth/CookieSessionProvider';

/** Creates a cookie session adapter without exposing its concrete implementation. */
export function createCookieSessionProvider(cookieStore: ICookieStore): ISessionProvider {
  return new CookieSessionProvider(cookieStore);
}
