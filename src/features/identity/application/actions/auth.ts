"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession, createUserVO } from "@/features/core/domain/auth";
import type { SessionPayload } from "@/features/core/domain/auth";

/**
 * Authenticates a user using email and password credentials.
 * Sets a session cookie upon successful login and redirects based on user role.
 *
 * @param formData - Form data containing 'email' and 'password'.
 * @returns AuthResult object if login fails (redirects on success).
 */
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const authService = container.authService;
  const result = await authService.login(email, password);

  if (result.success) {
    revalidatePath("/");

    if (result.user) {
      const sessionLike: SessionPayload = {
        userId: result.user.id,
        user: createUserVO({
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        }),
        portalRole: result.user.portalRole,
        activeRoleIds: result.user.activeRoleIds,
        permissionCodes: result.user.permissionCodes,
        actorType: result.user.actorType,
        organizationId: result.user.organizationId,
      };

      if (isAdminSession(sessionLike)) {
        redirect("/admin");
      }
    }

    redirect("/");
  }

  return result;
}

/**
 * Terminates the current user session and redirects to the home page.
 */
export async function logoutAction(formData?: FormData) {
  const authService = container.authService;
  const redirectTo = formData?.get("redirectTo") as string | undefined;

  await authService.logout();
  revalidatePath("/");
  redirect(redirectTo || "/");
}
