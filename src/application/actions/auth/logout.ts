"use server";

import { getServices } from "@/server/getServices";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 *
 */
export async function logoutAction() {
  const { auth } = getServices();

  await auth.logout();

  revalidatePath("/");
  redirect("/en/admin-login");
}
