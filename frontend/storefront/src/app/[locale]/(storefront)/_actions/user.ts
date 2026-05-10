'use server';

import { createIdentityServices } from '@findeg/backend/features/identity';
import { getSession } from '@lib/session';
import { revalidatePath } from 'next/cache';

/**
 * Server action to get the legacy session data for UserProvider.
 */
export async function getCurrentUserAction() {
  const session = await getSession();
  if (!session?.userId) return null;

  const { users } = createIdentityServices();
  const user = await users.getById(session.userId);

  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
}

/**
 * Server action to update the user's profile.
 */
export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error('Not authenticated');

  const name = formData.get('name') as string;
  const { users } = createIdentityServices();

  const trimmedName = (name || '').trim();
  const [firstName, ...lastNameParts] = trimmedName.split(' ');
  const lastName = lastNameParts.join(' ') || undefined;

  await users.update(session.userId, { firstName, lastName });

  // Revalidate the account page to show new name
  revalidatePath('/my-account');

  return { success: true };
}
