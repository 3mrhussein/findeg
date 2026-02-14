import { IAuditLogService } from "@/application/services/interfaces/IAuditLogService";
import {
  IAuditLogRepository,
  AuditLogFilters,
} from "@/application/repositories/IAuditLogRepository";
import { AuditLogEntry, NewAuditLogEntry } from "@/infrastructure/database/schema/audit-log";

/**
 * Audit Log Service
 *
 * Records all admin actions for accountability and compliance.
 * Provides querying capabilities for audit trail review.
 */
export class AuditLogService implements IAuditLogService {
  /**
   * Creates an instance of AuditLogService
   *
   * @param auditLogRepository - Audit log data access layer
   */
  constructor(private auditLogRepository: IAuditLogRepository) {}

  /**
   * Logs an admin action to the audit trail
   *
   * Failures are logged to console but don't crash the application.
   *
   * @param entry - Audit log entry with entity type, action, and values
   */
  async logAction(entry: NewAuditLogEntry): Promise<void> {
    try {
      await this.auditLogRepository.create(entry);
    } catch (error) {
      // Logging fail shouldn't crash the app, but should be reported
      console.error("Failed to create audit log entry:", error);
    }
  }

  /**
   * Retrieves audit logs with optional filtering
   *
   * @param filters - Filters for entity type, action, date range, pagination
   * @returns Paginated audit log entries with total count
   */
  async getLogs(filters: AuditLogFilters): Promise<{ data: AuditLogEntry[]; total: number }> {
    return this.auditLogRepository.getAll(filters);
  }

  /**
   * Retrieves all audit logs for a specific entity
   *
   * @param entityType - Type of entity (e.g., "product", "order", "category")
   * @param entityId - Entity ID
   * @returns Array of audit log entries for the entity
   */
  async getEntityLogs(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    return this.auditLogRepository.getByEntity(entityType, entityId);
  }
}
