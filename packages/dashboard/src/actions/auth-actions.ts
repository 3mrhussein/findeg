/**
 * Dashboard Authentication Server Actions
 *
 * Wraps pure backend auth services with Next.js framework integration:
 * - Extracts session from cookies
 * - Handles redirect() calls based on result
 * - Handles revalidatePath() for cache management
 * - Translates domain errors to appropriate responses
 *
 * This layer ensures framework logic stays in the app, business logic stays in backend.
 */

"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@findeg/backend/features/identity";
import { isDomainError, getErrorMessage } from "@/lib/errors";
import { invalidateCaches } from "@/lib/cache";

/**
 * Server Action: User login
 *
 * @param formData - Form data with 'email' and 'password' fields
 */
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const result = await login(email, password);

    // Invalidate caches
    await invalidateCaches(result);

    // Redirect based on user role
    const redirectTo = result.data?.isAdmin ? "/admin" : "/";
    redirect(redirectTo);
  } catch (error) {
    // Domain errors are expected (validation, auth failures)
    if (isDomainError(error)) {
      const message = getErrorMessage(error);
      return { error: message };
    }

    // Unexpected errors
    console.error("[dashboard] Login action error:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Server Action: User logout
 *
 * @param formData - Optional form data with redirectTo field
 */
export async function logoutAction(formData?: FormData) {
  try {
    const result = await logout();

    // Invalidate caches
    await invalidateCaches(result);

    // Redirect after logout
    const redirectTo = formData?.get("redirectTo") as string | undefined;
    redirect(redirectTo || "/");
  } catch (error) {
    console.error("[dashboard] Logout action error:", error);
    // Even if error occurs, redirect to login
    redirect("/");
  }
}
