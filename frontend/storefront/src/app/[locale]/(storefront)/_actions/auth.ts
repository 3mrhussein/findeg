'use server';

import { deleteSession } from '@lib/session';
import { redirect } from '@i18n/navigation';

/**
 * Storefront logout server action.
 *
 * Deletes the session cookie and redirects to the login page.
 * This is a local action wrapper — it does NOT call@backend/features/identity
 * directly, which would pull server-only code into the client bundle.
 */
export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect({ href: '/login', locale: 'en' });
}
