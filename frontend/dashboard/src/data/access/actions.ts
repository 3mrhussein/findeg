/**
 * Access Actions (Dashboard Data Layer)
 *
 * Centralized mutations for roles, permissions, and admin users.
 * Uses "use server" and revalidateTag for cache invalidation.
 */
'use server';

import { updateTag } from 'next/cache';
import { createIdentityServices } from '@findeg/backend/features/identity';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { requireStaffAction } from '@lib/auth-guard';
import { getErrorMessage } from '@lib/type-guards';
import type {
  CreateAdminInput,
  UpdateAdminInput,
  PermissionOverrideInput,
} from '@findeg/backend/features/identity';

/**
 * Create a new custom role
 */
export async function createRoleAction(code: string, name: string, permissionIds: number[]) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_ROLES_WRITE, 'create role');
    const { adminRoles } = createIdentityServices();
    const result = await adminRoles.createRole(code, name, permissionIds);

    updateTag('access');
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
    await requireStaffAction(PERMISSION_CODES.ADMIN_ROLES_WRITE, 'update role permissions');
    const { adminRoles } = createIdentityServices();
    const result = await adminRoles.updateRolePermissions(roleId, permissionIds);

    updateTag('access');
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
    await requireStaffAction(PERMISSION_CODES.ADMIN_ROLES_WRITE, 'delete role');
    const { adminRoles } = createIdentityServices();
    await adminRoles.deleteRole(roleId);

    updateTag('access');
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
    await requireStaffAction(PERMISSION_CODES.ADMIN_USERS_WRITE, 'create admin user');
    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.createAdmin(input);

    updateTag('access');
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
    await requireStaffAction(PERMISSION_CODES.ADMIN_USERS_WRITE, 'update admin user');
    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.updateAdmin(userId, input);

    updateTag('access');
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
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_USERS_WRITE,
      'set permission overrides',
    );
    if (!session?.userId) {
      throw new Error('Unauthorized: Missing session user ID');
    }

    const { adminUsers } = createIdentityServices();
    const overrides: PermissionOverrideInput[] = permissionIds.map((id) => ({
      permissionId: id,
      action: 'grant',
    }));

    await adminUsers.setPermissionOverrides(userId, overrides, session.userId);

    updateTag('access');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
