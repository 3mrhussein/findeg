import { createOrderReads } from './features/order-reads';
import { createOrderStatistics } from './features/order-statistics';
import { createOrderStatusChanges } from './features/order-status-changes';
import type { OrderDatabase, Orders, OrdersDependencies } from './types';

/** Construction and injected operations never load the default connection. */
export function createOrders({
  db: suppliedDb,
  now = () => new Date(),
}: OrdersDependencies = {}): Orders {
  let pendingDb: Promise<OrderDatabase> | undefined;
  const context = {
    database: () =>
      suppliedDb
        ? Promise.resolve(suppliedDb)
        : (pendingDb ??= import('@findeg/db/connection').then(({ db }) => db)),
    now,
  };
  return {
    ...createOrderReads(context),
    ...createOrderStatistics(context),
    ...createOrderStatusChanges(context),
  };
}
