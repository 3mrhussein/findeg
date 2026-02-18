/**
 * Audit Log Database Schema
 *
 * Records all admin mutations for accountability and debugging.
 * Stores before/after snapshots of changed data as JSONB.
 */

import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

/**
 * Audit Log Table
 *
 * Tracks every admin action:
 * - `adminUserId` — Who performed the action
 * - `entityType` — What type of entity was affected (e.g., "product", "order")
 * - `entityId` — The ID of the affected entity
 * - `action` — What was done (e.g., "create", "update", "delete")
 * - `oldValues` / `newValues` — Before/after data snapshots
 */
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => users.id, { onDelete: "set null" }),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  oldValues: jsonb("old_values").$type<Record<string, unknown>>(),
  newValues: jsonb("new_values").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  adminUser: one(users, {
    fields: [auditLog.adminUserId],
    references: [users.id],
    relationName: "user_audit_logs",
  }),
}));

/**
 * Type Exports
 */
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
