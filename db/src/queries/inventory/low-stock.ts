import { sql, eq } from "drizzle-orm";
import { db } from "../../connection";
import { inventoryBalances } from "../../schema/inventory";
import { productVariants } from "../../schema/catalog";
/**
 * Raw query for low stock count across all warehouses.
 * Counts variants where (onHand - reserved) <= lowStockThreshold (5 units).
 */
export async function getLowStockCountRaw(): Promise<number> {
    const [result] = await db
        .select({
            count: sql<number>`cast(count(distinct ${inventoryBalances.variantId}) as integer)`,
        })
        .from(inventoryBalances)
        .innerJoin(productVariants, eq(inventoryBalances.variantId, productVariants.id))
        .where(sql`${inventoryBalances.onHand} - ${inventoryBalances.reserved} <= 5`);

    return result?.count || 0;
}
