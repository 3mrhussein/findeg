/**
 * Dashboard Authentication Server Actions
 *
 * TODO: Reimplement using createIdentityServices() from backend
 *
 * The backend login/logout functions were removed from exports because they use
 * ServiceContainer with @ imports that break Turbopack bundling.
 *
 * Implementation approach:
 * 1. Import createIdentityServices from @backend/features/identity
 * 2. Call authService.login(email, password)
 * 3. Handle session creation with Next.js cookies
 * 4. Handle redirects and cache invalidation
 */

"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@lib/session";

/**
 * Server Action: User login
 *
 * @param formData - Form data with 'email' and 'password' fields
 */
export async function loginAction(formData: FormData) {
  throw new Error("Not implemented - needs refactoring after backend export changes");
}

/**
 * Server Action: User logout
 *
 * @param formData - Optional form data with redirectTo field
 */
export async function logoutAction(formData?: FormData) {
  try {
    // Delete session cookie
    await deleteSession();

    // Redirect after logout
    const redirectTo = formData?.get("redirectTo") as string | undefined;
    redirect(redirectTo || "/");
  } catch (error) {
    console.error("[dashboard] Logout action error:", error);
    // Even if error occurs, redirect to login
    redirect("/");
  }
}
