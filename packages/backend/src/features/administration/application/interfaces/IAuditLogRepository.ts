import type { AuditLogEntry } from "../../domain/entities/AuditLogEntry";
export type { AuditLogEntry };

/** Input for creating an audit log entry */
export interface AuditLogCreateInput {
  adminUserId?: number;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  action?: string;
  adminUserId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Audit Log Repository Interface
 *
 * Defines the contract for administrative activity tracking.
 */
export interface IAuditLogRepository {
  /**
   * Persists a new audit log entry.
   */
  create(data: AuditLogCreateInput): Promise<AuditLogEntry>;

  /**
   * Retrieves a paginated list of audit logs based on filters.
   */
  getAll(filters: AuditLogFilters): Promise<{ data: AuditLogEntry[]; total: number }>;

  /**
   * Retrieves logs scoped to a specific resource.
   */
  getByEntity(entityType: string, entityId: string): Promise<AuditLogEntry[]>;

  /**
   * Counts total logs matching filters.
   */
  count(filters?: AuditLogFilters): Promise<number>;
}
