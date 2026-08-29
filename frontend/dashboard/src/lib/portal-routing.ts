import { redirect as nextRedirect } from 'next/navigation';
import {
  defaultActivePortalForRole,
  type ActivePortal,
  type SessionPayload,
} from '@findeg/backend/features/core';

export const DASHBOARD_PORTAL: ActivePortal = 'dashboard';

const PORTAL_ORIGINS: Record<ActivePortal, string> = {
  storefront: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3001',
};

/** Returns the configured home URL for an Active Portal and locale. */
export function getPortalHomeUrl(activePortal: ActivePortal, locale: string): string {
  const origin = PORTAL_ORIGINS[activePortal].replace(/\/$/, '');
  return `${origin}/${locale}`;
}

/** Resolves the Active Portal in legacy payloads that predate the field. */
export function getActivePortal(session: SessionPayload): ActivePortal {
  return session.activePortal ?? defaultActivePortalForRole(session.portalRole);
}

/** Redirects a valid Current Session to the home of its Active Portal. */
export function redirectToActivePortalHome(session: SessionPayload, locale: string): never {
  nextRedirect(getPortalHomeUrl(getActivePortal(session), locale));
}
