import { cache } from 'react';
import { getSession } from '@lib/session';

/**
 * Deduplicate session reads within one server render. Session cookies belong
 * to the current request and must never enter the shared Next.js data cache.
 */
export const getCachedSession = cache(getSession);
