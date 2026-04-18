"use server";

import { createIdentityServices } from "@backend/features/identity";
import { getSession } from "@lib/session";

/**
 * Server action to get the legacy session data for UserProvider.
 */
export async function getCurrentUserAction() {
  const session = await getSession();
  if (!session?.userId) return null;

  const { users } = createIdentityServices() as any;
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
