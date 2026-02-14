import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database";
import {
  auditLog,
  AuditLogEntry,
  NewAuditLogEntry,
} from "@/infrastructure/database/schema/audit-log";
import {
  IAuditLogRepository,
  AuditLogFilters,
} from "@/application/repositories/IAuditLogRepository";

/**
 * Drizzle Audit Log Repository
 *
 * PostgreSQL implementation of audit log storage using Drizzle ORM.
 * Provides filtering, pagination, and entity-specific log retrieval.
 */
export class DrizzleAuditLogRepository implements IAuditLogRepository {
  /**
   * Creates a new audit log entry
   *
   * @param data - Audit log entry data
   * @returns Created audit log entry
   */
  async create(data: NewAuditLogEntry): Promise<AuditLogEntry> {
    const result = await db.insert(auditLog).values(data).returning();
    return result[0];
  }

  /**
   * Retrieves audit logs with filtering and pagination
   *
   * Supports filtering by entity type, entity ID, action, admin user, and date range.
   *
   * @param filters - Filter criteria and pagination options
   * @returns Paginated audit log entries with total count
   */
  async getAll(filters: AuditLogFilters): Promise<{ data: AuditLogEntry[]; total: number }> {
    const conditions = [];

    if (filters.entityType) conditions.push(eq(auditLog.entityType, filters.entityType));
    if (filters.entityId) conditions.push(eq(auditLog.entityId, filters.entityId));
    if (filters.action) conditions.push(eq(auditLog.action, filters.action));
    if (filters.adminUserId) conditions.push(eq(auditLog.adminUserId, filters.adminUserId));
    if (filters.startDate) conditions.push(gte(auditLog.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(auditLog.createdAt, filters.endDate));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(auditLog)
      .where(whereClause)
      .orderBy(desc(auditLog.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    const totalResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(auditLog)
      .where(whereClause);

    return {
      data,
      total: totalResult[0]?.count || 0,
    };
  }

  /**
   * Retrieves all audit logs for a specific entity
   *
   * @param entityType - Type of entity (e.g., "product", "order")
   * @param entityId - Entity ID
   * @returns Array of audit log entries sorted by creation date (newest first)
   */
  async getByEntity(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    return db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)))
      .orderBy(desc(auditLog.createdAt));
  }

  /**
   * Counts audit log entries matching the filters
   *
   * @param filters - Optional filter criteria
   * @returns Total count of matching audit log entries
   */
  async count(filters?: AuditLogFilters): Promise<number> {
    const conditions = [];
    if (filters) {
      if (filters.entityType) conditions.push(eq(auditLog.entityType, filters.entityType));
      if (filters.entityId) conditions.push(eq(auditLog.entityId, filters.entityId));
      if (filters.action) conditions.push(eq(auditLog.action, filters.action));
      if (filters.adminUserId) conditions.push(eq(auditLog.adminUserId, filters.adminUserId));
      if (filters.startDate) conditions.push(gte(auditLog.createdAt, filters.startDate));
      if (filters.endDate) conditions.push(lte(auditLog.createdAt, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(auditLog)
      .where(whereClause);

    return result[0]?.count || 0;
  }
}
