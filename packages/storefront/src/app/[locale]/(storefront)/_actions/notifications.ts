"use server";

import { createIdentityServices } from "@backend/features/identity";
import { getSession } from "@lib/session";

/**
 * Server action to get unread notification count.
 */
export async function getUnreadNotificationCountAction() {
  const session = await getSession();
  if (!session?.userId) return 0;

  // Placeholder for real notification logic
  // In a real app, this would query a notification repository
  return 3;
}
