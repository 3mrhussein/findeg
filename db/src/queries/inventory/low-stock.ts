import { availableStockByVariant } from './availability';
import { sql } from 'drizzle-orm';
import { LOW_STOCK_MAX_UNITS } from '@findeg/domain';
import { db } from '../../connection';

/** Count variants with 1 to 5 available units summed over active warehouses. */
export async function getLowStockCountRaw(): Promise<number> {
  const availability = availableStockByVariant();
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(availability)
    .where(
      sql`${availability.available} > 0 and ${availability.available} <= ${LOW_STOCK_MAX_UNITS}`,
    );
  return result?.count ?? 0;
}
