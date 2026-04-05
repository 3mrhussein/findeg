/**
 * Brands Database Schema
 */
import { serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { catalogSchema } from "./schemas";
import { products } from "./products";
/**
 * Brands Table
 */
export const brands = catalogSchema.table("brands", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    localizedName: jsonb("localized_name").$type().default({}).notNull(),
    localizedDescription: jsonb("localized_description").$type(),
    logoUrl: text("logo_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const brandsRelations = relations(brands, ({ many }) => ({
    products: many(products),
}));
