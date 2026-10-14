import type { SchoolSupplyListDatabase } from '@findeg/db';

/** Resolve an injected connection or load the production connection on first use. */
export function connectionProvider(db?: SchoolSupplyListDatabase) {
  return db
    ? () => Promise.resolve(db)
    : async () => (await import('@findeg/db/connection')).db as SchoolSupplyListDatabase;
}
