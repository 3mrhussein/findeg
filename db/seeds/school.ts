import * as schema from '../src/schema/index.ts';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { prepareSeedData, ensureParents } from './helpers';

import schoolListsData from './data/school_lists.json';
import schoolListItemsData from './data/school_list_items.json';
import schoolListItemAlternativesData from './data/school_list_item_alternatives.json';

export async function seedSchoolEngine(db: PostgresJsDatabase<typeof schema>) {
  console.log('🌱 Seeding School Engine Domain...');

  // Level 1: School Lists
  if (schoolListsData.length > 0) {
    console.log('  - Seeding School Lists...');
    await db
      .insert(schema.schoolLists)
      .values(prepareSeedData(schema.schoolLists, schoolListsData));
  }

  // Level 2: School List Items (Depends on School Lists and Product Variants)
  if (schoolListItemsData.length > 0) {
    console.log('  - Seeding School List Items...');
    await ensureParents(db, [
      { table: schema.schoolLists, name: '"school_engine"."school_lists"' },
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
    ]);
    await db
      .insert(schema.schoolListItems)
      .values(prepareSeedData(schema.schoolListItems, schoolListItemsData));
  }

  // Level 3: School List Item Alternatives (Depends on School List Items and Product Variants)
  if (schoolListItemAlternativesData.length > 0) {
    console.log('  - Seeding School List Item Alternatives...');
    await ensureParents(db, [
      { table: schema.schoolListItems, name: '"school_engine"."school_list_items"' },
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
    ]);
    await db
      .insert(schema.schoolListItemAlternatives)
      .values(prepareSeedData(schema.schoolListItemAlternatives, schoolListItemAlternativesData));
  }
}
