"use server";

import { requireAdmin } from "@lib/auth-guard";
import { updateTag } from "next/cache";
import { createIdentityServices } from "@backend/features/identity";
import type { Locale } from "next-intl";

/**
 * Admin User Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend identity service factories.
 */

export async function createAdminAction(formData: FormData) {
  try {
    const session = await requireAdmin("en" as Locale); // Needs to be localized eventually, using en for fallback

    // Needs System Admin check
    if (!session.activeRoleIds?.includes("system_admin")) {
      return { success: false, error: "Unauthorized: System Admin role required" };
    }

    // Extract form data
    const input = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      nameEn: formData.get("nameEn") as string,
      nameAr: formData.get("nameAr") as string,
      roleIds: JSON.parse((formData.get("roleIds") as string) || "[]"),
    };

    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.createAdmin(input);

    updateTag("admin-users");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createAdminAction]", error);
    return { success: false, error: error?.message || "Failed to create admin user" };
  }
}

export async function updateAdminAction(userId: number, formData: FormData) {
  try {
    const session = await requireAdmin("en" as Locale);

    if (!session.activeRoleIds?.includes("system_admin")) {
      return { success: false, error: "Unauthorized: System Admin role required" };
    }

    // Extract form data
    const input = {
      nameEn: formData.get("nameEn") as string,
      nameAr: formData.get("nameAr") as string,
      roleIds: JSON.parse((formData.get("roleIds") as string) || "[]"),
      isActive: formData.get("isActive") === "true",
    };

    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.updateAdmin(userId, input);

    updateTag("admin-users");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[updateAdminAction]", error);
    return { success: false, error: error?.message || "Failed to update admin user" };
  }
}
