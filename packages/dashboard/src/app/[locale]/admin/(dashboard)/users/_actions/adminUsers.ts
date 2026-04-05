"use server";

import { getServices } from "@/server/getServices";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import type { Locale } from "next-intl";

/**
 *
 */
export async function createAdminAction(formData: FormData) {
  const session = await requireAdmin("en" as Locale); // Needs to be localized eventually, using en for fallback

  // Needs System Admin check
  if (!session.activeRoleIds?.includes("system_admin")) {
    throw new Error("Unauthorized");
  }

  const email = formData.get("email")?.toString() || "";
  const firstName = formData.get("firstName")?.toString() || "";
  const lastName = formData.get("lastName")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  // Roles are sent as 'roleIds'
  const roleIdsRaw = formData.getAll("roleIds");
  const roleIds = roleIdsRaw.map((v) => parseInt(v.toString())).filter((v) => !isNaN(v));

  const { adminUser } = getServices();

  try {
    await adminUser.createAdmin({
      email,
      firstName,
      lastName,
      password,
      roleIds,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create admin" };
  }
}

/**
 *
 */
export async function updateAdminAction(userId: number, formData: FormData) {
  const session = await requireAdmin("en" as Locale);

  if (!session.activeRoleIds?.includes("system_admin")) {
    throw new Error("Unauthorized");
  }

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const isActiveStr = formData.get("isActive")?.toString();

  const roleIdsRaw = formData.getAll("roleIds");
  const roleIds = roleIdsRaw.map((v) => parseInt(v.toString())).filter((v) => !isNaN(v));

  const { adminUser } = getServices();

  try {
    await adminUser.updateAdmin(userId, {
      firstName,
      lastName,
      roleIds, // Allow empty array to clear all roles
      isActive: isActiveStr === "true" || isActiveStr === "on",
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update admin" };
  }
}
