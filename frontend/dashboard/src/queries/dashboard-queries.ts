/**
 * Dashboard Data Queries
 *
 * Queries for dashboard-specific data using backend services.
 * All queries use "use cache" for performance.
 */

'use cache';

import { createAdministrationServices } from '@findeg/backend/features/administration';
import { createOrderServices } from '@findeg/backend/features/order';
import { createIdentityServices } from '@findeg/backend/features/identity';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Get dashboard data for authenticated user
 */
export async function getDashboardDataQuery(locale: string) {
  cacheLife('minutes');
  cacheTag('dashboard');

  const { dashboard } = createAdministrationServices();
  return await dashboard.getDashboardStats();
}

/**
 * Get account data for authenticated user
 */
export async function getMyAccountDataQuery(userId: number) {
  cacheLife('minutes');
  cacheTag('my-account');

  // Use identity service to get user data
  const { adminUsers } = createIdentityServices();
  const user = await adminUsers.getAdmin(userId);

  return user;
}

/**
 * Get order detail for authenticated user
 */
export async function getMyOrderDetailQuery(orderId: number, locale: string) {
  cacheLife('minutes');
  cacheTag(`order-${orderId}`);

  const { orders } = createOrderServices();
  return await orders.getById(orderId);
}
