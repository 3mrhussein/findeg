/**
 * Dashboard Profile Server Actions
 *
 * TODO: Reimplement using createIdentityServices()
 *
 * The backend updateMyProfile function was removed from exports because it uses
 * ServiceContainer with @ imports that break Turbopack bundling.
 *
 * Implementation approach:
 * 1. Import createIdentityServices from @backend/features/identity
 * 2. Call appropriate service method
 * 3. Handle session and error management
 */

"use server";

import { redirect } from "@i18n/navigation";
import { getSession, createSession } from "@lib/session";
import { createIdentityServices } from "@backend/features/identity";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@lib/type-guards";
import type { SessionPayload } from "@backend/features/core";

/**
 * Server Action: Update current user's profile
 *
 * @param formData - Form data with firstName and lastName
 */
export async function updateMyProfileAction(
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      throw new Error("Not authenticated");
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!firstName || !lastName) {
      throw new Error("First name and last name are required");
    }

    // 1. Update backend profile
    const { adminUsers } = createIdentityServices();
    const updatedUser = await adminUsers.updateAdmin(session.userId, {
      firstName,
      lastName,
    });

    // 2. Update local session in cookies
    const fName = updatedUser.firstName || session.user.firstName;
    const lName = updatedUser.lastName || session.user.lastName;

    const newSession: SessionPayload = {
      ...session,
      user: {
        ...session.user,
        firstName: fName,
        lastName: lName,
        fullName: `${fName} ${lName}`.trim(),
      },
    };

    await createSession(newSession);

    // 3. Revalidate path to update UI
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: unknown) {
    console.error("[updateMyProfileAction] Error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
