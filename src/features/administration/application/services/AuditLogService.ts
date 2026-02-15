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
