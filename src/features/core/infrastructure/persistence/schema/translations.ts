/**
 * Static Translations Database Schema (Optional fallback for CMS)
 */

import { pgTable, serial, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import type { Locale } from "@/features/core/domain/value-objects";

/**
 * Translations Table
 *
 * Stores static UI labels if not using a CMS.
 */
export const translations = pgTable(
  "translations",
  {
    key: text("key").notNull(),
    language: text("language").$type<Locale>().notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.key, table.language] }),
  }),
);

/**
 * Type Exports
 */
export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;
