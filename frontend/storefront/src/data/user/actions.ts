'use server';

import { getSession } from '@lib/session';
import { revalidatePath } from 'next/cache';
import { UpdateProfileInputSchema, validateInput } from '../schemas';
import { getCurrentUser } from './queries';
import { updateProfile as backendUpdateProfile } from '@findeg/backend';

function splitName(name: string): { firstName?: string; lastName?: string } {
  const trimmed = name.trim();
  if (!trimmed) return {};

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * Server action to get the current user session data for client components.
 */
export async function getCurrentUserAction() {
  return await getCurrentUser();
}

/**
 * Update user profile.
 *
 * Validates input, persists name and phone to backend identity service,
 * and revalidates relevant paths.
 */
export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error('Not authenticated');

  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  // Validate input
  validateInput(UpdateProfileInputSchema, { name, phone: phone || undefined });

  const { firstName, lastName } = splitName(name);

  await backendUpdateProfile(session.userId, {
    firstName,
    lastName,
    phone: phone || '',
  });

  // Revalidate the account and settings pages to reflect updated data
  revalidatePath('/my-account');
  revalidatePath('/my-account/settings');

  return { success: true };
}

/**
 * Update user profile using the name expected by existing callers.
 */
export async function updateProfileAction(formData: FormData) {
  return await updateProfile(formData);
}
