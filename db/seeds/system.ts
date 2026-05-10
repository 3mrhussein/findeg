import * as schema from '../src/schema/index.ts';
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { prepareSeedData, ensureParents } from "./helpers";

import auditLogData from "./data/audit_log.json";
import searchLogsData from "./data/search_logs.json";

export async function seedSystem(db: PostgresJsDatabase<typeof schema>) {
  console.log("🌱 Seeding System Domain...");

  // Level 1: Audit Logs (Depends on Identity Users)
  if (auditLogData.length > 0) {
    console.log("  - Seeding Audit Logs...");
    if (auditLogData.some((l: any) => l.adminUserId)) {
      await ensureParents(db, [{ table: schema.users, name: '"identity"."users"' }]);
    }
    await db.insert(schema.auditLog).values(prepareSeedData(schema.auditLog, auditLogData));
  }

  // Level 2: Search Logs (Depends on Identity Users and Catalog Products)
  if (searchLogsData.length > 0) {
    console.log("  - Seeding Search Logs...");
    await ensureParents(db, [
      { table: schema.users, name: '"identity"."users"' },
      { table: schema.products, name: '"catalog"."products"' },
    ]);
    await db.insert(schema.searchLogs).values(prepareSeedData(schema.searchLogs, searchLogsData));
  }
}
