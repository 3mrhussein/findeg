import { AuditLogEntry, NewAuditLogEntry } from "@/infrastructure/database/schema/audit-log";

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

export interface IAuditLogRepository {
  create(data: NewAuditLogEntry): Promise<AuditLogEntry>;
  getAll(filters: AuditLogFilters): Promise<{ data: AuditLogEntry[]; total: number }>;
  getByEntity(entityType: string, entityId: string): Promise<AuditLogEntry[]>;
  count(filters?: AuditLogFilters): Promise<number>;
}
