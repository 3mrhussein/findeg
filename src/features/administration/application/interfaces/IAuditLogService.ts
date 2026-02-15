import type { AuditLogEntry, AuditLogCreateInput, AuditLogFilters } from "./IAuditLogRepository";

export interface IAuditLogService {
  /**
   * Records a new administrative action in the audit trail.
   */
  logAction(entry: AuditLogCreateInput): Promise<void>;

  /**
   * Retrieves a paginated list of audit logs matching the given filters.
   */
  getLogs(filters: AuditLogFilters): Promise<{ data: AuditLogEntry[]; total: number }>;

  /**
   * Retrieves all logged actions associated with a specific entity (e.g., a specific Product).
   */
  getEntityLogs(entityType: string, entityId: string): Promise<AuditLogEntry[]>;
}
