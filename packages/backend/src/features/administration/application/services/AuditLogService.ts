import type { IAuditLogService } from "../interfaces/IAuditLogService";
import type {
  IAuditLogRepository,
  AuditLogFilters,
  AuditLogCreateInput,
} from "../interfaces/IAuditLogRepository";

/**
 * Audit Log Service
 *
 * Records all admin actions for accountability and compliance.
 * Provides querying capabilities for audit trail review.
 */
export class AuditLogService implements IAuditLogService {
  /**
   * Creates an instance of AuditLogService.
   *
   * @param auditLogRepository - Persistence layer for audit events.
   */
  constructor(private auditLogRepository: IAuditLogRepository) {}

  /**
   * Records an administrative action in the audit trail.
   * Failures in logging are caught and reported to the console to prevent blocking mutations.
   *
   * @param entry - The event details (admin ID, action, snapshots).
   */
  async logAction(entry: AuditLogCreateInput): Promise<void> {
    try {
      await this.auditLogRepository.create(entry);
    } catch (error) {
      console.error("Failed to create audit log entry:", error);
    }
  }

  /**
   * Queries the entire audit trail with filtering and pagination.
   *
   * @param filters - Search criteria.
   * @returns Filtered list of audit log entries.
   */
  async getLogs(filters: AuditLogFilters) {
    return this.auditLogRepository.getAll(filters);
  }

  /**
   * Retrieves recent activity across the system, optionally filtered by entity types.
   */
  async getRecentActivity(opts: { limit: number; entityTypes?: string[] }) {
    // AuditLogFilters currently doesn't support an array of entityTypes in IAuditLogRepository.
    // We fetch a larger batch and filter in memory as a simple workaround for the dashboard display,
    // or rely on a future repository update.
    const filters: AuditLogFilters = {
      limit: opts.limit * (opts.entityTypes ? 3 : 1), // fetch more if we intend to filter
      offset: 0,
    };

    const { data } = await this.auditLogRepository.getAll(filters);

    if (opts.entityTypes && opts.entityTypes.length > 0) {
      const targetTypes = opts.entityTypes.map((t) => t.toLowerCase());
      return data
        .filter((log) => targetTypes.includes(log.entityType.toLowerCase()))
        .slice(0, opts.limit);
    }

    return data.slice(0, opts.limit);
  }

  /**
   * Retrieves all historical actions related to a specific domain entity.
   *
   * @param entityType - The type (e.g., 'product').
   * @param entityId - The specific identity of the object.
   * @returns Chronological list of changes for that entity.
   */
  async getEntityLogs(entityType: string, entityId: string) {
    return this.auditLogRepository.getByEntity(entityType, entityId);
  }
}
