import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../connection";
import { products, categories, brands } from "../../schema/catalog";

/**
 * Primitive count queries for catalog data
 * Reusable across dashboard, analytics, and other features
 */

export async function getProductCountRaw(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(products);
  return result?.count || 0;
}

export async function getCategoryCountRaw(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(categories);
  return result?.count || 0;
}

export async function getBrandCountRaw(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(brands);
  return result?.count || 0;
}
