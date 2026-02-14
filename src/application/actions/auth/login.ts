"use server";

import { getServices } from "@/server/getServices";
import { AuthCredentials } from "@/domain/types/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 *
 */
export async function loginAction(data: AuthCredentials | FormData) {
  const { auth } = getServices();

  let email, password;

  if (data instanceof FormData) {
    email = data.get("email") as string;
    password = data.get("password") as string;
  } else {
    email = data.email;
    password = data.password;
  }

  try {
    const result = await auth.login(email, password);

    if (!result.success) {
      // In server actions, returning error object is fine for client handling
      return { success: false, error: result.error || "Login failed" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }

  revalidatePath("/admin");
  redirect("/en/admin"); // Default to English for now, middleware will handle locale
}
