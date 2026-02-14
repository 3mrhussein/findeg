import { AuditLogEntry, NewAuditLogEntry } from "@/infrastructure/database/schema/audit-log";
import { AuditLogFilters } from "@/application/repositories/IAuditLogRepository";

export interface IAuditLogService {
  /**
   * Log an admin action.
   */
  logAction(entry: NewAuditLogEntry): Promise<void>;

  /**
   * Get filtered audit logs.
   */
  getLogs(filters: AuditLogFilters): Promise<{ data: AuditLogEntry[]; total: number }>;

  /**
   * Get logs for a specific entity.
   */
  getEntityLogs(entityType: string, entityId: string): Promise<AuditLogEntry[]>;
}
