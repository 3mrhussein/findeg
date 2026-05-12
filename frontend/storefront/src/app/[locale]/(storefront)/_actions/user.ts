'use server';

import { getSession } from '@lib/session';
import { revalidatePath } from 'next/cache';

/**
 * Server action to get the legacy session data for UserProvider.
 * NOTE: This should be migrated to use the data layer with "use cache".
 * See: frontend/storefront/src/data/{feature}/queries.ts
 */
export async function getCurrentUserAction() {
  const session = await getSession();
  if (!session?.userId) return null;

  // Return user data from session (already loaded at auth time)
  return {
    user: session.user || null,
  };
}

/**
 * Server action to update the user's profile.
 * NOTE: This should be migrated to use proper data layer actions.
 * For now, just revalidate the cache after form submission.
 */
export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error('Not authenticated');

  // TODO: Implement proper profile update through data layer
  // This would call a backend service to update user profile

  // Revalidate the account page
  revalidatePath('/my-account');

  return { success: true };
}
