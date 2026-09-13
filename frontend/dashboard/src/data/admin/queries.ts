/**
 * Admin Queries (Dashboard Data Layer)
 *
 * Administrative data fetching with "use cache" for audit logs, dashboard stats, etc.
 * Uses "use cache" directive to wrap backend service calls.
 */
'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import type { AuditLogEntry } from '@findeg/backend/features/administration/domain/entities/AuditLogEntry';

/**
 * Get catalog health statistics for admin dashboard
 *
 * Cache: Short TTL for real-time stats
 */
export async function getCatalogHealthStats() {
  cacheLife('minutes');
  cacheTag('dashboard', 'catalog-health');

  const { dashboard } = createAdministrationServices();
  return await dashboard.getCatalogHealthStats();
}

/**
 * Get category product distribution for dashboard analytics
 *
 * Cache: Moderate TTL - doesn't change rapidly
 */
export async function getCategoryProductDistribution() {
  cacheLife('hours');
  cacheTag('dashboard', 'category-distribution');

  const { dashboard } = createAdministrationServices();
  return await dashboard.getCategoryProductDistribution();
}

/**
 * Get recent activity from audit log
 *
 * Cache: Short TTL - activity happens frequently
 */
export async function getRecentActivity(options?: { limit?: number; entityTypes?: string[] }) {
  cacheLife('minutes');
  cacheTag('audit-logs');

  const { auditLog } = createAdministrationServices();
  // Call getRecentActivity on the service
  const logs = await auditLog.getRecentActivity({
    limit: options?.limit || 10,
    entityTypes: options?.entityTypes,
  });
  return logs || [];
}

/**
 * Get dashboard data (stats, revenue, etc.) for authenticated admin
 *
 * Cache: Very short TTL for real-time stats
 */
export async function getDashboardData() {
  cacheLife('minutes');
  cacheTag('dashboard');

  const { dashboard } = createAdministrationServices();
  return await dashboard.getDashboardStats();
}

/**
 * Get recent orders for dashboard widget
 *
 * Cache: Short TTL for real-time orders
 */
export async function getRecentOrders(limit: number = 5) {
  cacheLife('minutes');
  cacheTag('dashboard', 'recent-orders');

  const { dashboard } = createAdministrationServices();
  return await dashboard.getRecentOrders(limit);
}

/**
 * Get paginated audit logs with filters
 *
 * Cache: Short TTL - audit logs are time-sensitive
 */
export async function getAuditLogs(options?: {
  entityType?: string;
  action?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: AuditLogEntry[]; total: number }> {
  cacheLife('minutes');
  cacheTag('audit-logs');

  const { auditLog } = createAdministrationServices();
  const logs = await auditLog.getRecentActivity({ limit: options?.limit || 50 });

  // Filter by options if provided
  let filteredLogs = logs || [];
  if (options?.entityType) {
    filteredLogs = filteredLogs.filter(
      (log: AuditLogEntry) => log.entityType === options.entityType,
    );
  }
  if (options?.action) {
    filteredLogs = filteredLogs.filter((log: AuditLogEntry) => log.action === options.action);
  }
  if (options?.entityId) {
    filteredLogs = filteredLogs.filter(
      (log: AuditLogEntry) => String(log.entityId) === options.entityId,
    );
  }

  // Apply pagination
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  const paginatedLogs = filteredLogs.slice(offset, offset + limit);

  return {
    data: paginatedLogs,
    total: filteredLogs.length,
  };
}
