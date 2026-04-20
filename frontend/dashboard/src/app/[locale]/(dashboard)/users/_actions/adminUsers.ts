"use server";

import { requireAdmin } from "@lib/auth-guard";
import { updateTag } from "next/cache";
import { createIdentityServices } from "@findeg/backend/features/identity";
import type { Locale } from "next-intl";
import { getErrorMessage } from "@lib/type-guards";

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
      firstName: (formData.get("firstName") || formData.get("nameEn")) as string,
      lastName: (formData.get("lastName") || "") as string,
      roleIds: JSON.parse((formData.get("roleIds") as string) || "[]"),
    };

    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.createAdmin(input);

    updateTag("admin-users");
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[createAdminAction]", error);
    return { success: false, error: getErrorMessage(error) };
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
      firstName: (formData.get("firstName") || formData.get("nameEn")) as string,
      lastName: (formData.get("lastName") || "") as string,
      roleIds: JSON.parse((formData.get("roleIds") as string) || "[]"),
      isActive: formData.get("isActive") === "true",
    };

    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.updateAdmin(userId, input);

    updateTag("admin-users");
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[updateAdminAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
