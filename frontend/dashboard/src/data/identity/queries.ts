/**
 * Identity Data Layer (Dashboard)
 *
 * Provides cached data for admin identity and users.
 * Adheres to Next.js 16 "use cache" standards.
 */
'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { createIdentityServices } from '@findeg/backend/features/identity';

/**
 * Get all admin users
 *
 * Cache: Moderate TTL
 */
export async function getAdminUsers() {
  cacheLife('hours');
  cacheTag('admin-users');

  const { adminUsers } = createIdentityServices();
  return await adminUsers.listAdmins();
}

/**
 * Get admin user by ID
 */
export async function getAdminUserById(id: number) {
  cacheTag('admin-users', `admin-user-${id}`);
  cacheLife('hours');

  const { adminUsers } = createIdentityServices();
  return await adminUsers.getAdmin(id);
}
