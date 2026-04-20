import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { auditLog } from "@findeg/db/schema";
import type {
  IAuditLogRepository,
  AuditLogCreateInput,
  AuditLogFilters,
} from "../application/interfaces/IAuditLogRepository";
import type { AuditLogEntry } from "../domain/entities/AuditLogEntry";
import { db } from "@findeg/db";

/**
 * Drizzle Audit Log Repository
 *
 * PostgreSQL implementation of audit log storage using Drizzle ORM.
 */
export class DrizzleAuditLogRepository implements IAuditLogRepository {
  /**
   *
   */
  async create(data: AuditLogCreateInput): Promise<AuditLogEntry> {
    const row = await db
      .insert(auditLog)
      .values({
        adminUserId: data.adminUserId,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        oldValues: data.oldValues,
        newValues: data.newValues,
      })
      .returning();
    return this.toDomain(row[0]);
  }

  /**
   *
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
      data: data.map(this.toDomain),
      total: totalResult[0]?.count || 0,
    };
  }

  /**
   *
   */
  async getByEntity(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    const rows = await db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)))
      .orderBy(desc(auditLog.createdAt));
    return rows.map(this.toDomain);
  }

  /**
   *
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

  /**
   *
   */
  private toDomain(row: typeof auditLog.$inferSelect & { createdAt: Date }): AuditLogEntry {
    return {
      id: row.id,
      adminUserId: row.adminUserId ?? undefined,
      entityType: row.entityType,
      entityId: row.entityId,
      action: row.action,
      oldValues: (row.oldValues as Record<string, unknown>) ?? undefined,
      newValues: (row.newValues as Record<string, unknown>) ?? undefined,
      createdAt: row.createdAt,
    };
  }
}
