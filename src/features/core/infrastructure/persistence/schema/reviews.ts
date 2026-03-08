/**
 * Reviews Database Schema
 *
 * Handles product ratings and customer feedback.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { users } from "./users";

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  status: text("status").default("approved"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewHelpfulVotes = pgTable(
  "review_helpful_votes",
  {
    id: serial("id").primaryKey(),
    reviewId: integer("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    voterKey: text("voter_key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uqReviewVoter: uniqueIndex("uq_review_helpful_votes_review_voter").on(
      table.reviewId,
      table.voterKey,
    ),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const reviewHelpfulVotesRelations = relations(reviewHelpfulVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewHelpfulVotes.reviewId],
    references: [reviews.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewHelpfulVote = typeof reviewHelpfulVotes.$inferSelect;
export type NewReviewHelpfulVote = typeof reviewHelpfulVotes.$inferInsert;
