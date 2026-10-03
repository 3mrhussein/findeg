import type { ILoggerService } from '../interfaces/ILoggerService';
import type { ISessionProvider } from '../interfaces/ISessionProvider';
import type { ICookieStore } from './CurrentSessionProvider';
import { LoggerService } from './LoggerService';
import { CookieSessionProvider } from '../../infrastructure/auth/CookieSessionProvider';

/** Creates a cookie session adapter without exposing its concrete implementation. */
export function createCookieSessionProvider(cookieStore: ICookieStore): ISessionProvider {
  return new CookieSessionProvider(cookieStore);
}

/** Creates the structured logger (file + console) without exposing its concrete implementation. */
export function createLogger(): ILoggerService {
  return new LoggerService();
}
