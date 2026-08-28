import * as schema from '../src/schema/index.ts';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { prepareSeedData, ensureParents } from './helpers';

import discountRulesData from './data/discount_rules.json';
import addressesData from './data/addresses.json';
import ordersData from './data/orders.json';
import orderItemsData from './data/order_items.json';

export async function seedSales(db: PostgresJsDatabase<typeof schema>) {
  console.log('🌱 Seeding Sales Domain...');

  // Level 1: Discount Rules (Independent)
  if (discountRulesData.length > 0) {
    console.log('  - Seeding Discount Rules...');
    await db
      .insert(schema.discountRules)
      .values(prepareSeedData(schema.discountRules, discountRulesData));
  }

  // Level 2: Addresses (Depends on Identity Users)
  if (addressesData.length > 0) {
    console.log('  - Seeding Addresses...');
    if (addressesData.some((a: any) => a.userId)) {
      await ensureParents(db, [{ table: schema.users, name: '"identity"."users"' }]);
    }
    await db.insert(schema.addresses).values(prepareSeedData(schema.addresses, addressesData));
  }

  // Level 3: Orders (Depends on Identity Users)
  if (ordersData.length > 0) {
    console.log('  - Seeding Orders...');
    await ensureParents(db, [{ table: schema.users, name: '"identity"."users"' }]);
    await db.insert(schema.orders).values(prepareSeedData(schema.orders, ordersData));
  }

  // Level 4: Order Items (Depends on Orders and Catalog Product Variants)
  if (orderItemsData.length > 0) {
    console.log('  - Seeding Order Items...');
    await ensureParents(db, [
      { table: schema.orders, name: '"sales"."orders"' },
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
    ]);
    await db.insert(schema.orderItems).values(prepareSeedData(schema.orderItems, orderItemsData));
  }
}
