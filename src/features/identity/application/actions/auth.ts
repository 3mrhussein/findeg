"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    // Check if it was an admin login
    if (result.user?.role === "admin") {
      redirect("/admin");
    }
    redirect("/");
  }

  return result;
}

/**
 * Terminates the current user session and redirects to the home page.
 */
export async function logoutAction() {
  const authService = container.authService;
  await authService.logout();
  revalidatePath("/");
  redirect("/");
}
