/**
 * Server Logs Database Schema
 *
 * Tracks all incoming requests and significant server-side events.
 * Used for monitoring, debugging, and customer support.
 */

import { pgTable, serial, text, integer, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// We won't import users directly here either to avoid future circularities.

/**
 * Server Logs Table
 *
 * Tracks:
 * - `requestId` — Unique ID for tracing across services
 * - `userId` — Optional ID of the user who performed the action
 * - `method` — HTTP method (GET, POST, etc.)
 * - `path` — Request URL path
 * - `statusCode` — HTTP response status
 * - `duration` — Execution time in milliseconds
 * - `level` — Log level (info, warn, error)
 * - `message` — Log description
 * - `metadata` — Additional structured data (request body, headers, etc. - sanitized)
 */
export const serverLogs = pgTable("server_logs", {
  id: serial("id").primaryKey(),
  requestId: varchar("request_id", { length: 50 }).notNull(),
  userId: integer("user_id"),
  sessionId: varchar("session_id", { length: 50 }),
  method: varchar("method", { length: 10 }),
  path: text("path"),
  statusCode: integer("status_code"),
  duration: integer("duration"), // ms
  level: varchar("level", { length: 20 }).default("info").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Type Exports
 */
export type ServerLogEntry = typeof serverLogs.$inferSelect;
export type NewServerLogEntry = typeof serverLogs.$inferInsert;
