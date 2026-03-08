import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import type { Locale } from "@/features/core/domain/value-objects";

/**
 * Search Logs
 *
 * Tracks user search queries, parameters, and outcomes for analytics
 * and tuning of search relevance.
 */
export const searchLogs = pgTable("search_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  /** The raw search query string */
  query: text("query").notNull(),

  /** Locale/language the search was performed in */
  locale: text("locale").$type<Locale>().notNull(),

  /** Number of results returned */
  resultsCount: integer("results_count").notNull(),

  /** ID of the user performing the search (null for guests) */
  userId: integer("user_id"),

  /** Anonymous session identifier for tracking guest searches */
  sessionId: text("session_id"),

  /** If the user clicked a product from the results, its ID is stored here (can be updated later) */
  clickedProductId: integer("clicked_product_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SearchLog = typeof searchLogs.$inferSelect;
export type NewSearchLog = typeof searchLogs.$inferInsert;
