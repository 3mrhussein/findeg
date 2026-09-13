/**
 * Dashboard Queries (Dashboard Data Layer)
 *
 * Uses "use cache" directive to wrap backend service calls.
 */
'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import type { Locale } from '@findeg/backend/features/core';

/**
 * Get dashboard statistics
 *
 * Cache: Very short TTL (minutes) for real-time stats
 */
export async function getDashboardStats() {
  cacheTag('dashboard');
  cacheLife('minutes');

  const { dashboard } = createAdministrationServices();
  return await dashboard.getDashboardStats();
}

/**
 * Get recent orders
 *
 * Cache: Short TTL for dashboard widget
 */
export async function getRecentOrders(limit: number = 5) {
  cacheTag('dashboard', 'recent-orders');
  cacheLife('minutes');

  const { dashboard } = createAdministrationServices();
  return await dashboard.getRecentOrders(limit);
}
