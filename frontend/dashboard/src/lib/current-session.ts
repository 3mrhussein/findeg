import {
  createCurrentSessionProvider,
  type ICookieStore,
} from '@findeg/backend/features/core';
import { CurrentSessionIdentityResolver } from '@findeg/backend/features/identity';

/** Dashboard composition root for the shared Current Session module. */
export function createDashboardCurrentSession(cookieStore: ICookieStore) {
  return createCurrentSessionProvider(cookieStore, new CurrentSessionIdentityResolver());
}
