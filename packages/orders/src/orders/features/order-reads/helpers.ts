import { and, count, desc, eq, gte, ilike, inArray, isNotNull, lte, or } from 'drizzle-orm';
import { auditLog, orders, orderItems, users } from '@findeg/db/schema';
import { mapOrder } from '../order-mapping';
import { filtersSchema, orderId, positiveId } from '../validation';
import type {
  Order,
  OrderActivityEntry,
  OrderContext,
  OrderDatabase,
  OrderFilters,
  Orders,
} from '../../types';

type OrderReadRow = { order: typeof orders.$inferSelect; user: typeof users.$inferSelect | null };

/** Escapes LIKE wildcards so user input is matched literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function filterConditions(filters: OrderFilters) {
  const conditions = [];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.paymentStatus) conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
  if (filters.userId) conditions.push(eq(orders.userId, filters.userId));
  if (filters.startDate) conditions.push(gte(orders.createdAt, filters.startDate));
  if (filters.endDate) conditions.push(lte(orders.createdAt, filters.endDate));
  if (filters.search) {
    const pattern = `%${escapeLike(filters.search)}%`;
    const text = or(
      ilike(orders.orderReference, pattern),
      ilike(orders.guestEmail, pattern),
      ilike(orders.trackingNumber, pattern),
    );
    conditions.push(
      /^\d+$/.test(filters.search) && positiveId.safeParse(Number(filters.search)).success
        ? or(eq(orders.id, Number(filters.search)), text)
        : text,
    );
  }
  return and(...conditions);
}

/** Read-only Order queries: lookups, lists, the customer history and the Staff detail view. */
export function createOrderReads({
  database,
}: OrderContext): Pick<
  Orders,
  'get' | 'list' | 'listForCustomer' | 'recent' | 'latestShippingAddress' | 'detail'
> {
  async function load(db: OrderDatabase, rows: OrderReadRow[]): Promise<Order[]> {
    if (!rows.length) return [];
    const items = await db
      .select()
      .from(orderItems)
      .where(
        inArray(
          orderItems.orderId,
          rows.map((r) => r.order.id),
        ),
      );
    const byOrder = new Map<number, typeof items>();
    for (const item of items) {
      const group = byOrder.get(item.orderId) ?? [];
      group.push(item);
      byOrder.set(item.orderId, group);
    }
    return rows.map((row) => mapOrder(row.order, byOrder.get(row.order.id) ?? [], row.user));
  }

  const api = {
    async get(id: number | string): Promise<Order | null> {
      const key = orderId.parse(id);
      const db = await database();
      const rows = await db
        .select({ order: orders, user: users })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, key))
        .limit(1);
      return (await load(db, rows)).at(0) ?? null;
    },
    async list(input: OrderFilters = {}) {
      const filters = filtersSchema.parse(input);
      const db = await database();
      const where = filterConditions(filters);
      const rows = await db
        .select({ order: orders, user: users })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(where)
        .orderBy(desc(orders.createdAt), desc(orders.id))
        .limit(filters.limit ?? 50)
        .offset(filters.offset ?? 0);
      const [total] = await db.select({ count: count() }).from(orders).where(where);
      return { orders: await load(db, rows), total: total.count };
    },
    async listForCustomer(userId: number) {
      positiveId.parse(userId);
      const db = await database();
      const rows = await db
        .select({ order: orders, user: users })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt), desc(orders.id));
      return load(db, rows);
    },
    async recent(limit = 5) {
      return (await api.list({ limit })).orders;
    },
    async latestShippingAddress(userId: number) {
      positiveId.parse(userId);
      const db = await database();
      const rows = await db
        .select({ address: orders.shippingAddressSnapshot })
        .from(orders)
        .where(and(eq(orders.userId, userId), isNotNull(orders.shippingAddressSnapshot)))
        .orderBy(desc(orders.createdAt), desc(orders.id))
        .limit(1);
      return rows.at(0)?.address ?? null;
    },
    async detail(id: number | string) {
      const order = await api.get(id);
      if (!order) return null;
      const db = await database();
      const rows = await db
        .select({ log: auditLog, firstName: users.firstName, lastName: users.lastName })
        .from(auditLog)
        .leftJoin(users, eq(auditLog.adminUserId, users.id))
        .where(and(eq(auditLog.entityType, 'order'), eq(auditLog.entityId, String(order.id))))
        .orderBy(desc(auditLog.createdAt), desc(auditLog.id));
      const activity: OrderActivityEntry[] = rows.map(({ log, firstName, lastName }) => {
        const oldValues = (log.oldValues ?? {}) as Record<string, unknown>;
        const newValues = (log.newValues ?? {}) as Record<string, unknown>;
        const key = Object.keys(newValues).find((k) => k in oldValues) ?? Object.keys(oldValues)[0];
        // Audit values are JSON scalars (status, tracking number, notes), never objects.
        const display = (value: unknown) =>
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
            ? String(value)
            : undefined;
        return {
          id: log.id,
          action: log.action,
          adminId: log.adminUserId ?? undefined,
          adminName: [firstName, lastName].filter(Boolean).join(' ') || undefined,
          oldValue: key ? display(oldValues[key]) : undefined,
          newValue: key ? display(newValues[key]) : undefined,
          oldValues,
          newValues,
          createdAt: log.createdAt,
        };
      });
      return { order, activity };
    },
  };
  return api;
}
