/**
 * Access Queries (Dashboard Data Layer)
 *
 * Centralized fetching for roles, permissions, and admin users.
 * Uses "use cache" for optimized performance.
 */
"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { createIdentityServices } from "@findeg/backend/features/identity";

/**
 * Get all available system roles with their permissions
 */
export async function getSystemRoles() {
  cacheLife("hours");
  cacheTag("access", "roles");

  const { adminRoles } = createIdentityServices();
  return await adminRoles.listRoles();
}

/**
 * Get all available permission codes
 */
export async function getPermissionCodes() {
  cacheLife("weeks");
  cacheTag("access", "permissions");

  const { adminRoles } = createIdentityServices();
  return await adminRoles.listPermissions();
}

/**
 * Get all admin users
 */
export async function getAdminUsers() {
  cacheLife("minutes");
  cacheTag("access", "users");

  const { adminUsers } = createIdentityServices();
  return await adminUsers.listAdmins();
}

/**
 * Get a single role by ID
 */
export async function getRoleById(roleId: number) {
  cacheLife("hours");
  cacheTag("access", "roles", `role-${roleId}`);

  const { adminRoles } = createIdentityServices();
  return await adminRoles.getRole(roleId);
}

/**
 * Get a single admin user by ID
 */
export async function getAdminById(userId: number) {
  cacheLife("minutes");
  cacheTag("access", "users", `user-${userId}`);

  const { adminUsers } = createIdentityServices();
  return await adminUsers.getAdmin(userId);
}
