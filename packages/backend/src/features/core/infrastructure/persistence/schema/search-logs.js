/**
 * Search Logs Database Schema
 */
import { text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { systemSchema } from "./schemas";
import { sql } from "drizzle-orm";
/**
 * search_logs
 */
export const searchLogs = systemSchema.table("search_logs", {
    id: uuid("id")
        .primaryKey()
        .default(sql `gen_random_uuid()`),
    /** What was searched */
    query: text("query").notNull(),
    /** Search locale */
    locale: text("locale").notNull(),
    /** Results count shown to user */
    resultsCount: integer("results_count").notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    /** Anonymized session identifier or userId */
    sessionId: text("session_id"),
    /** Optional: recording the first result clicked */
    clickedProductId: integer("clicked_product_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const searchLogsRelations = relations(searchLogs, ({ one }) => ({
    user: one(users, {
        fields: [searchLogs.userId],
        references: [users.id],
    }),
}));
