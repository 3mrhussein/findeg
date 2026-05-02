/**
 * Access Management Actions (Storefront)
 *
 * Unified server actions for managing roles, permissions, and admin users.
 * These actions bridge the UI and the backend identity services.
 */
"use server";

import { createIdentityServices } from "@findeg/backend/features/identity";
import { revalidateTag } from "next/cache";
import { getErrorMessage } from "@lib/errors";
import { requirePermission } from "@lib/auth-guard";
import { PERMISSION_CODES } from "@findeg/backend/features/core";
import { getSession } from "@lib/session";

// --- Role Management Actions ---

export async function createRoleAction(code: string, name: string, permissionIds: number[]) {
  try {
    await requirePermission("en", { permission: PERMISSION_CODES.ADMIN_ROLES_WRITE });

    const { adminRoles } = createIdentityServices();
    const role = await adminRoles.createRole(code, name, permissionIds);

    revalidateTag("admin-roles", "max");
    return { success: true, data: role };
  } catch (error) {
    console.error("[createRoleAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateRolePermissionsAction(roleId: number, permissionIds: number[]) {
  try {
    await requirePermission("en", { permission: PERMISSION_CODES.ADMIN_ROLES_WRITE });

    const { adminRoles } = createIdentityServices();
    const role = await adminRoles.updateRolePermissions(roleId, permissionIds);

    revalidateTag("admin-roles", "max");
    revalidateTag(`admin-role-${roleId}`, "max");
    return { success: true, data: role };
  } catch (error) {
    console.error("[updateRolePermissionsAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteRoleAction(roleId: number) {
  try {
    await requirePermission("en", { permission: PERMISSION_CODES.ADMIN_ROLES_WRITE });

    const { adminRoles } = createIdentityServices();
    await adminRoles.deleteRole(roleId);

    revalidateTag("admin-roles", "max");
    return { success: true };
  } catch (error) {
    console.error("[deleteRoleAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// --- Admin User Management Actions ---

export interface CreateAdminInput {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  roleIds: number[];
}

export async function createAdminAction(input: CreateAdminInput) {
  try {
    await requirePermission("en", { permission: PERMISSION_CODES.ADMIN_USERS_WRITE });

    const { adminUsers } = createIdentityServices();
    const admin = await adminUsers.createAdmin({
      ...input,
      password: input.password || "",
    });

    revalidateTag("admin-users", "max");
    return { success: true, data: admin };
  } catch (error) {
    console.error("[createAdminAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export interface UpdateAdminInput {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
}

export async function updateAdminAction(adminId: number, input: UpdateAdminInput) {
  try {
    await requirePermission("en", { permission: PERMISSION_CODES.ADMIN_USERS_WRITE });

    const { adminUsers } = createIdentityServices();
    const admin = await adminUsers.updateAdmin(adminId, input);

    revalidateTag("admin-users", "max");
    revalidateTag(`admin-user-${adminId}`, "max");
    return { success: true, data: admin };
  } catch (error) {
    console.error("[updateAdminAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function setPermissionOverridesAction(adminId: number, permissionIds: number[]) {
  try {
    await requirePermission("en", { permission: PERMISSION_CODES.ADMIN_USERS_WRITE });

    const session = await getSession();
    if (!session?.userId) {
      throw new Error("Unauthorized: Missing session user ID");
    }

    const { adminUsers } = createIdentityServices();
    const overrides = permissionIds.map((id) => ({
      permissionId: id,
      action: "grant" as const,
    }));

    await adminUsers.setPermissionOverrides(adminId, overrides, session.userId);

    revalidateTag("admin-users", "max");
    revalidateTag(`admin-user-${adminId}`, "max");
    return { success: true };
  } catch (error) {
    console.error("[setPermissionOverridesAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
