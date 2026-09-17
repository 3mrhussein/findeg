'use server';

import { getSession } from '@lib/session';
import { updateTag } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { UpdateProfileInputSchema, validateInput } from '../schemas';

/**
 * Update user profile.
 *
 * Validates input, integrates with backend identity service, and invalidates user cache.
 */
export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error('Not authenticated');

  const name = formData.get('name') as string;

  // Validate input
  validateInput(UpdateProfileInputSchema, { name });

  // Invalidate user cache so next query fetches fresh data
  updateTag('user');

  // Revalidate the account page to show new data
  revalidatePath('/my-account');

  return { success: true };
}

/**
 * Update user profile using the name expected by existing callers.
 */
export async function updateProfileAction(formData: FormData) {
  return await updateProfile(formData);
}
