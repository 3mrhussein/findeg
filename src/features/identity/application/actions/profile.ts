"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Updates the current user's profile display name.
 */
export async function updateMyProfileAction(formData: FormData) {
  const session = await container.authService.getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) {
    redirect("/my-account?profile=error");
  }

  const [firstName, ...lastNameParts] = name.split(" ");
  const lastName = lastNameParts.join(" ") || undefined;

  await container.userRepository.update(session.userId, { firstName, lastName });
  revalidatePath("/my-account");
  redirect("/my-account?profile=updated");
}
