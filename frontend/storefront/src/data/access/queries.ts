/**
 * Access Management Data Layer (Storefront)
 *
 * Unified queries for roles, permissions, and admin users.
 * Adheres to Next.js 16 "use cache" standards.
 */
'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { createIdentityServices } from '@findeg/backend/features/identity';

/**
 * Get all system roles (Admin Portal level)
 */
export async function getSystemRoles() {
  cacheLife('hours');
  cacheTag('admin-roles');

  const { adminRoles } = createIdentityServices();
  return await adminRoles.listRoles();
}

/**
 * Get all available permission codes in the system
 */
export async function getAllPermissions() {
  cacheLife('hours');
  cacheTag('system-permissions');

  const { adminRoles } = createIdentityServices();
  return await adminRoles.listPermissions();
}

/**
 * Get all admin users
 */
export async function getAdminUsers() {
  cacheLife('hours');
  cacheTag('admin-users');

  const { adminUsers } = createIdentityServices();
  return await adminUsers.listAdmins();
}

/**
 * Get a specific role by its ID
 */
export async function getRoleById(roleId: number) {
  cacheLife('hours');
  cacheTag('admin-roles', `admin-role-${roleId}`);

  const { adminRoles } = createIdentityServices();
  return await adminRoles.getRole(roleId);
}

/**
 * Get admin user details by ID
 */
export async function getAdminById(adminId: number) {
  cacheLife('hours');
  cacheTag('admin-users', `admin-user-${adminId}`);

  const { adminUsers } = createIdentityServices();
  return await adminUsers.getAdmin(adminId);
}
