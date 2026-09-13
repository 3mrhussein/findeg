"use server";

import { deleteSession } from '@lib/session';
import { redirect } from '@i18n/navigation';

/**
 * Logout server action.
 * 
 * Deletes the session cookie and redirects to login page.
 */
export async function logout(): Promise<void> {
    await deleteSession();
    redirect({ href: '/login', locale: 'en' });
}

export async function logoutAction(): Promise<void> {
    return await logout();
}
