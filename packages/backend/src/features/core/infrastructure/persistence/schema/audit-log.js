/**
 * Audit Logs Database Schema
 *
 * Stores before/after snapshots of changed data as JSONB.
 */
import { serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { systemSchema } from "./schemas";
/**
 * Audit Log Table
 */
export const auditLog = systemSchema.table("audit_log", {
    id: serial("id").primaryKey(),
    adminUserId: integer("admin_user_id").references(() => users.id, { onDelete: "set null" }),
    entityType: text("entity_type").notNull(), // e.g., "Product", "Order"
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(), // "create", "update", "delete"
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const auditLogRelations = relations(auditLog, ({ one }) => ({
    adminUser: one(users, {
        fields: [auditLog.adminUserId],
        references: [users.id],
        relationName: "user_audit_logs",
    }),
}));
