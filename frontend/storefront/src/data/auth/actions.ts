'use server';

import { deleteSession } from '@lib/session';
import { redirect } from '@i18n/navigation';
import { getLocale } from 'next-intl/server';

/**
 * Logout server action.
 *
 * Deletes the session cookie and redirects to login page, preserving current locale.
 */
export async function logout(): Promise<void> {
  await deleteSession();
  const locale = await getLocale();
  redirect({ href: '/login', locale });
}

export async function logoutAction(): Promise<void> {
  return await logout();
}
