/**
 * Review Database Schema
 */

import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { products } from "./products";

/**
 * Reviews Table
 */
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  language: text("language").default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Relations
 */
export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

/**
 * Type Exports
 */
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
