/**
 * Dashboard Profile Server Actions
 *
 * Wraps pure backend profile services with Next.js framework integration:
 * - Extracts session from cookies
 * - Handles revalidatePath() for cache management
 * - Translates domain errors to responses
 */

"use server";

import { redirect } from "next/navigation";
import { updateMyProfile } from "@findeg/backend/features/identity";
import { getSession } from "@/lib/session";
import { isDomainError, getErrorMessage } from "@/lib/errors";
import { invalidateCaches } from "@/lib/cache";

/**
 * Server Action: Update user profile
 *
 * @param formData - Form data with 'name' field
 */
export async function updateMyProfileAction(formData: FormData) {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const name = formData.get("name") as string;

  try {
    const result = await updateMyProfile(session.userId, name);

    // Invalidate caches
    await invalidateCaches(result);

    // Redirect to success page
    redirect("/my-account?profile=updated");
  } catch (error) {
    // Handle domain errors
    if (isDomainError(error)) {
      const message = getErrorMessage(error);
      // Redirect with error query param for display
      redirect(`/my-account?profile=error&message=${encodeURIComponent(message)}`);
    }

    console.error("[dashboard] Update profile action error:", error);
    redirect("/my-account?profile=error");
  }
}
