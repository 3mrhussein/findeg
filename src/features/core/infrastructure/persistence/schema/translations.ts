/**
 * Translations Database Schema
 *
 * Generic translation table if localized jsonb isn't enough.
 */

import { pgTable, serial, text, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { catalogSchema } from "./schemas";

/**
 * translations
 */
export const translations = catalogSchema.table(
  "translations",
  {
    id: serial("id").primaryKey(),

    /** Grouping code (e.g., 'UI', 'SEO', 'Email') */
    namespace: varchar("namespace", { length: 50 }).notNull(),

    /** The key to translate */
    key: text("key").notNull(),

    /** Language code (e.g., 'en', 'ar') */
    language: varchar("language", { length: 10 }).notNull(),

    /** The translated string */
    value: text("value").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqTranslation: uniqueIndex("uq_translation").on(table.namespace, table.key, table.language),
  }),
);

export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;
