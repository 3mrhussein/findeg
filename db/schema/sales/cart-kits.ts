/**
 * Cart Kits Database Schema
 */

import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { schoolEngineSchema } from "../schemas";
import { schoolLists } from "../school-engine/school-lists";

/**
 * cart_kits
 */
export const cartKits = schoolEngineSchema.table("cart_kits", {
  id: serial("id").primaryKey(),

  /** Link to parent school list */
  schoolListId: integer("school_list_id")
    .notNull()
    .references(() => schoolLists.id, { onDelete: "cascade" }),

  /** Display name (e.g., "Complete Grade 1 Kit") */
  localizedName: jsonb("localized_name").notNull(),

  /** Raw variant IDs included in this kit snapshot */
  itemSnapshots: jsonb("item_snapshots").$type<number[]>().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CartKit = typeof cartKits.$inferSelect;
export type NewCartKit = typeof cartKits.$inferInsert;
