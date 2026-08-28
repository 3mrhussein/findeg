/**
 * Query Primitives for Audit Logs
 *
 * Pure database queries for audit log operations.
 * No ORM abstraction - direct Drizzle SQL operations.
 *
 * Note: Returns raw database rows. Domain mapping handled by service.
 */

import { db } from '../../connection';
import { auditLog } from '../../schema';
import { eq, and, desc, count, gte, lte } from 'drizzle-orm';
import { type ID } from '@findeg/db/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuditLogRow = typeof auditLog.$inferSelect;

export interface AuditLogFiltersInput {
    page?: number;
    limit?: number;
    entityType?: string;
    entityId?: string;
    action?: string;
    adminUserId?: number;
    startDate?: Date;
    endDate?: Date;
}

// ─── Read Operations ─────────────────────────────────────────────────────────

/**
 * Get audit logs with filtering and pagination
 */
export async function getAll(
    filters?: AuditLogFiltersInput,
): Promise<{ logs: AuditLogRow[]; total: number }> {
    const page = Math.max(filters?.page || 1, 1);
    const limit = Math.min(Math.max(filters?.limit || 20, 1), 100);

    const conditions = [];

    if (filters?.entityType) {
        conditions.push(eq(auditLog.entityType, filters.entityType));
    }

    if (filters?.entityId) {
        conditions.push(eq(auditLog.entityId, filters.entityId));
    }

    if (filters?.action) {
        conditions.push(eq(auditLog.action, filters.action));
    }

    if (filters?.adminUserId) {
        conditions.push(eq(auditLog.adminUserId, filters.adminUserId));
    }

    if (filters?.startDate) {
        conditions.push(gte(auditLog.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
        conditions.push(lte(auditLog.createdAt, filters.endDate));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db.select({ count: count() }).from(auditLog).where(where);
    const total = countResult[0]?.count || 0;

    // Get paginated results
    const logs = await db
        .select()
        .from(auditLog)
        .where(where)
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

    return { logs, total };
}

/**
 * Get audit logs for a specific entity
 */
export async function getByEntity(entityType: string, entityId: string): Promise<AuditLogRow[]> {
    return db
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)))
        .orderBy(desc(auditLog.createdAt));
}

/**
 * Get recent audit logs with optional entity filtering
 */
export async function getRecent(
    limit: number = 10,
    entityTypes?: string[],
): Promise<AuditLogRow[]> {
    const logs = await db
        .select()
        .from(auditLog)
        .orderBy(desc(auditLog.createdAt))
        .limit(Math.min(Math.max(limit, 1), 100));

    // Filter by entity types in memory if provided
    if (entityTypes && entityTypes.length > 0) {
        return logs.filter((log) => entityTypes.includes(log.entityType));
    }

    return logs;
}

/**
 * Count audit logs with optional filtering
 */
export async function countLogs(filters?: AuditLogFiltersInput): Promise<number> {
    const conditions = [];

    if (filters?.entityType) {
        conditions.push(eq(auditLog.entityType, filters.entityType));
    }

    if (filters?.entityId) {
        conditions.push(eq(auditLog.entityId, filters.entityId));
    }

    if (filters?.action) {
        conditions.push(eq(auditLog.action, filters.action));
    }

    if (filters?.adminUserId) {
        conditions.push(eq(auditLog.adminUserId, filters.adminUserId));
    }

    if (filters?.startDate) {
        conditions.push(gte(auditLog.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
        conditions.push(lte(auditLog.createdAt, filters.endDate));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db.select({ count: count() }).from(auditLog).where(where);
    return result[0]?.count || 0;
}

// ─── Write Operations ────────────────────────────────────────────────────────

export interface CreateAuditLogInput {
    adminUserId?: number;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
}

/**
 * Create a new audit log entry
 */
export async function create(input: CreateAuditLogInput): Promise<AuditLogRow> {
    const [created] = await db
        .insert(auditLog)
        .values({
            adminUserId: input.adminUserId,
            entityType: input.entityType,
            entityId: input.entityId,
            action: input.action,
            oldValues: input.oldValues,
            newValues: input.newValues,
            createdAt: new Date(),
        })
        .returning();

    return created;
}
