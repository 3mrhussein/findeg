/**
 * Access Actions (Dashboard Data Layer)
 *
 * Centralized mutations for roles, permissions, and admin users.
 * Uses "use server" and revalidateTag for cache invalidation.
 */
"use server";

import { revalidateTag } from "next/cache";
import { createIdentityServices } from "@findeg/backend/features/identity";
import { getErrorMessage } from "@lib/type-guards";
import type {
  CreateAdminInput,
  UpdateAdminInput,
  PermissionOverrideInput,
} from "@findeg/backend/features/identity";
import { getSession } from "@lib/session";

/**
 * Create a new custom role
 */
export async function createRoleAction(code: string, name: string, permissionIds: number[]) {
  try {
    const { adminRoles } = createIdentityServices();
    const result = await adminRoles.createRole(code, name, permissionIds);

    revalidateTag("access", "max");
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update role permissions
 */
export async function updateRolePermissionsAction(roleId: number, permissionIds: number[]) {
  try {
    const { adminRoles } = createIdentityServices();
    const result = await adminRoles.updateRolePermissions(roleId, permissionIds);

    revalidateTag("access", "max");
    revalidateTag(`role-${roleId}`, "max");
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete a role
 */
export async function deleteRoleAction(roleId: number) {
  try {
    const { adminRoles } = createIdentityServices();
    await adminRoles.deleteRole(roleId);

    revalidateTag("access", "max");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new admin user
 */
export async function createAdminAction(input: CreateAdminInput) {
  try {
    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.createAdmin(input);

    revalidateTag("access", "max");
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update an existing admin user
 */
export async function updateAdminAction(userId: number, input: UpdateAdminInput) {
  try {
    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.updateAdmin(userId, input);

    revalidateTag("access", "max");
    revalidateTag(`user-${userId}`, "max");
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Set permission overrides for a user
 */
export async function setPermissionOverridesAction(userId: number, permissionIds: number[]) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      throw new Error("Unauthorized: Missing session user ID");
    }

    const { adminUsers } = createIdentityServices();
    const overrides: PermissionOverrideInput[] = permissionIds.map((id) => ({
      permissionId: id,
      action: "grant",
    }));

    await adminUsers.setPermissionOverrides(userId, overrides, session.userId);

    revalidateTag("access", "max");
    revalidateTag(`user-${userId}`, "max");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
