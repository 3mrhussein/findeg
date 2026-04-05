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

export async function updateMyProfileAction(
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();

  if (!session?.userId) {
    return { error: "Authentication required" };
  }

  const firstName = (formData.get("firstName") as string) || "";
  const lastName = (formData.get("lastName") as string) || "";
  const fullName = `${firstName} ${lastName}`.trim();

  try {
    const result = await updateMyProfile(Number(session.userId), fullName);

    // Invalidate caches
    await invalidateCaches(result);

    return { success: true };
  } catch (error) {
    // Handle domain errors
    if (isDomainError(error)) {
      return { error: getErrorMessage(error) };
    }

    console.error("[dashboard] Update profile action error:", error);
    return { error: "Failed to update profile" };
  }
}
