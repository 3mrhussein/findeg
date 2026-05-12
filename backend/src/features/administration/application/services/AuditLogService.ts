import type { IAuditLogService } from '../interfaces/IAuditLogService';
import type { AuditLogFilters, AuditLogCreateInput } from '../interfaces/IAuditLogRepository';
import { auditLogQueries } from '@findeg/db/queries';

/**
 * Audit Log Service
 *
 * Records all admin actions for accountability and compliance.
 * Provides querying capabilities for audit trail review.
 */
export class AuditLogService implements IAuditLogService {
  /**
   * Creates an instance of AuditLogService.
   */
  constructor() { }

  /**
   * Records an administrative action in the audit trail.
   * Failures in logging are caught and reported to the console to prevent blocking mutations.
   *
   * @param entry - The event details (admin ID, action, snapshots).
   */
  async logAction(entry: AuditLogCreateInput): Promise<void> {
    try {
      await auditLogQueries.create({
        adminUserId: entry.adminUserId,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        oldValues: entry.oldValues,
        newValues: entry.newValues,
      });
    } catch (error) {
      console.error('Failed to create audit log entry:', error);
    }
  }

  /**
   * Queries the entire audit trail with filtering and pagination.
   *
   * @param filters - Search criteria.
   * @returns Filtered list of audit log entries.
   */
  async getLogs(filters: AuditLogFilters) {
    const result = await auditLogQueries.getAll({
      page: filters.offset ? Math.floor(filters.offset / (filters.limit || 20)) + 1 : 1,
      limit: filters.limit,
      entityType: filters.entityType,
      entityId: filters.entityId,
      action: filters.action,
      adminUserId: filters.adminUserId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    return {
      data: result.logs.map(log => ({
        id: log.id,
        adminUserId: log.adminUserId || undefined,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        oldValues: (log.oldValues || undefined) as Record<string, unknown> | undefined,
        newValues: (log.newValues || undefined) as Record<string, unknown> | undefined,
        createdAt: log.createdAt,
      })),
      total: result.total,
    };
  }

  /**
   * Retrieves recent activity across the system, optionally filtered by entity types.
   */
  async getRecentActivity(opts: { limit: number; entityTypes?: string[] }) {
    const logs = await auditLogQueries.getRecent(opts.limit * (opts.entityTypes ? 3 : 1), opts.entityTypes);
    return logs.slice(0, opts.limit).map(log => ({
      id: log.id,
      adminUserId: log.adminUserId || undefined,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      oldValues: (log.oldValues || undefined) as Record<string, unknown> | undefined,
      newValues: (log.newValues || undefined) as Record<string, unknown> | undefined,
      createdAt: log.createdAt,
    }));
  }

  /**
   * Retrieves all historical actions related to a specific domain entity.
   *
   * @param entityType - The type (e.g., 'product').
   * @param entityId - The specific identity of the object.
   * @returns Chronological list of changes for that entity.
   */
  async getEntityLogs(entityType: string, entityId: string) {
    const logs = await auditLogQueries.getByEntity(entityType, entityId);
    return logs.map(log => ({
      id: log.id,
      adminUserId: log.adminUserId || undefined,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      oldValues: (log.oldValues || undefined) as Record<string, unknown> | undefined,
      newValues: (log.newValues || undefined) as Record<string, unknown> | undefined,
      createdAt: log.createdAt,
    }));
  }
}
