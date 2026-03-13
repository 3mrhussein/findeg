/**
 * Server Logs Database Schema
 */

import { pgTable, serial, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { systemSchema } from "./schemas";

/**
 * server_logs
 */
export const serverLogs = systemSchema.table("server_logs", {
  id: serial("id").primaryKey(),

  requestId: varchar("request_id", { length: 50 }).notNull(),
  userId: integer("user_id"),
  sessionId: varchar("session_id", { length: 50 }),
  method: varchar("method", { length: 10 }),
  path: text("path"),
  statusCode: integer("status_code"),
  duration: integer("duration"),

  /** Log level: "info", "warn", "error", "debug" */
  level: varchar("level", { length: 20 }).default("info").notNull(),

  /** Message content */
  message: text("message").notNull(),

  /** Trace metadata (request ID, file source, etc.) */
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),

  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ServerLog = typeof serverLogs.$inferSelect;
export type NewServerLog = typeof serverLogs.$inferInsert;
