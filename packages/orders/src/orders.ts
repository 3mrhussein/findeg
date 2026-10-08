import { and, count, desc, eq, gte, ilike, inArray, isNotNull, lte, or, sql } from 'drizzle-orm';
import { auditLog, orders, orderItems, users } from '@findeg/db/schema';
import { PaymentStatusSchema } from '@findeg/db/types';
import { enqueue } from '@findeg/db/queries/outbox';
import { consumeOrderStock, releaseOrderStock } from '@findeg/db/queries/stock-reservations';
import { toPiasters } from '@findeg/money';
import { assertCanWriteOrders } from './orderWritePermission';
import {
  OrderStatusUpdateSchema,
  ORDER_STATUS_OPTIONS,
  getAllowedOrderStatusTransitions,
  getAllowedPaymentStatusTransitions,
} from './schemas';
import {
  InvalidOrderStatusTransitionError,
  InvalidPaymentStatusTransitionError,
  OrderNotFoundError,
} from './errors';
import { isNotifiedOrderStatus, ORDER_STATUS_KIND, orderStatusId } from './events';
import { mapOrder } from './mapper';
import { filtersSchema, orderId, positiveId } from './validation';
import type {
  Order,
  OrderActivityEntry,
  OrderDatabase,
  OrderFilters,
  Orders,
  OrdersDependencies,
} from './types';

function filterConditions(filters: OrderFilters) {
  const conditions = [];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.paymentStatus) conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
  if (filters.userId) conditions.push(eq(orders.userId, filters.userId));
  if (filters.startDate) conditions.push(gte(orders.createdAt, filters.startDate));
  if (filters.endDate) conditions.push(lte(orders.createdAt, filters.endDate));
  if (filters.search) {
    const text = or(
      ilike(orders.orderReference, `%${filters.search}%`),
      ilike(orders.guestEmail, `%${filters.search}%`),
      ilike(orders.trackingNumber, `%${filters.search}%`),
    );
    conditions.push(
      /^\d+$/.test(filters.search) && positiveId.safeParse(Number(filters.search)).success
        ? or(eq(orders.id, Number(filters.search)), text)
        : text,
    );
  }
  return and(...conditions);
}

/** Construction and injected operations never load the default connection. */
export function createOrders({
  db: suppliedDb,
  now = () => new Date(),
}: OrdersDependencies = {}): Orders {
  let pendingDb: Promise<OrderDatabase> | undefined;
  const database = () =>
    suppliedDb
      ? Promise.resolve(suppliedDb)
      : (pendingDb ??= import('@findeg/db/connection').then(({ db }) => db));

  async function load(
    db: OrderDatabase,
    rows: { order: typeof orders.$inferSelect; user: typeof users.$inferSelect | null }[],
  ): Promise<Order[]> {
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

  const api: Orders = {
    async get(id) {
      const key = orderId.parse(id);
      const db = await database();
      const rows = await db
        .select({ order: orders, user: users })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, key))
        .limit(1);
      return (await load(db, rows))[0] ?? null;
    },
    async list(input = {}) {
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
    async listForCustomer(userId) {
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
    async latestShippingAddress(userId) {
      positiveId.parse(userId);
      const db = await database();
      const [row] = await db
        .select({ address: orders.shippingAddressSnapshot })
        .from(orders)
        .where(and(eq(orders.userId, userId), isNotNull(orders.shippingAddressSnapshot)))
        .orderBy(desc(orders.createdAt), desc(orders.id))
        .limit(1);
      return row?.address ?? null;
    },
    async detail(id) {
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
        const display = (value: unknown) => (value == null ? undefined : String(value));
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
    // Complete Cairo/range/trend statistics are delivered in #367. Preserve exact base aggregates here.
    async getStats() {
      const db = await database();
      return db.transaction(
        async (tx) => {
          const [totals] = await tx
            .select({
              totalOrders: count(),
              revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)::text`,
            })
            .from(orders);
          const rows = await tx
            .select({ status: orders.status, count: count() })
            .from(orders)
            .groupBy(orders.status);
          const ordersByStatus = Object.fromEntries(
            ORDER_STATUS_OPTIONS.map((status) => [status, 0]),
          ) as Record<(typeof ORDER_STATUS_OPTIONS)[number], number>;
          for (const row of rows) ordersByStatus[row.status] = row.count;
          return {
            totalOrders: totals.totalOrders,
            totalRevenue: toPiasters(totals.revenue),
            ordersByStatus,
          };
        },
        { isolationLevel: 'repeatable read', accessMode: 'read only' },
      );
    },
    async changeStatus(actor, id, input) {
      assertCanWriteOrders(actor);
      positiveId.parse(id);
      const update = OrderStatusUpdateSchema.parse(input);
      const db = await database();
      return db.transaction(async (tx) => {
        const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for('update');
        if (!order) throw new OrderNotFoundError(id);
        if (order.status === update.status)
          return { changed: false, previousStatus: order.status, status: order.status };
        const allowed = getAllowedOrderStatusTransitions(order.status);
        if (!allowed.includes(update.status))
          throw new InvalidOrderStatusTransitionError(order.status, update.status, allowed);
        if (update.status === 'delivered') await consumeOrderStock(id, tx);
        else if (update.status === 'cancelled') await releaseOrderStock(id, tx);
        const oldValues: Record<string, unknown> = { status: order.status };
        const newValues: Record<string, unknown> = { status: update.status };
        const changedAt = now();
        const fields: Partial<typeof orders.$inferInsert> = {
          status: update.status,
          updatedAt: changedAt,
        };
        for (const key of ['trackingNumber', 'adminNotes'] as const) {
          if (update[key] !== undefined) {
            fields[key] = update[key];
            if (update[key] !== order[key]) {
              oldValues[key] = order[key];
              newValues[key] = update[key];
            }
          }
        }
        await tx.update(orders).set(fields).where(eq(orders.id, id));
        if (isNotifiedOrderStatus(update.status))
          await enqueue(tx, orderStatusId(order.orderReference, update.status), ORDER_STATUS_KIND, {
            orderId: id,
            status: update.status,
          });
        await tx.insert(auditLog).values({
          adminUserId: actor.userId,
          entityType: 'order',
          entityId: String(id),
          action: 'update_status',
          oldValues,
          newValues,
          createdAt: changedAt,
        });
        return { changed: true, previousStatus: order.status, status: update.status };
      });
    },
    async changePaymentStatus(actor, id, input) {
      assertCanWriteOrders(actor);
      positiveId.parse(id);
      const status = PaymentStatusSchema.parse(input);
      const db = await database();
      return db.transaction(async (tx) => {
        const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for('update');
        if (!order) throw new OrderNotFoundError(id);
        if (order.paymentStatus === status)
          return { changed: false, previousStatus: order.paymentStatus, status };
        const allowed = getAllowedPaymentStatusTransitions(order.paymentStatus);
        if (!allowed.includes(status))
          throw new InvalidPaymentStatusTransitionError(order.paymentStatus, status, allowed);
        const changedAt = now();
        await tx
          .update(orders)
          .set({ paymentStatus: status, updatedAt: changedAt })
          .where(eq(orders.id, id));
        await tx.insert(auditLog).values({
          adminUserId: actor.userId,
          entityType: 'order',
          entityId: String(id),
          action: 'update_payment_status',
          oldValues: { paymentStatus: order.paymentStatus },
          newValues: { paymentStatus: status },
          createdAt: changedAt,
        });
        return { changed: true, previousStatus: order.paymentStatus, status };
      });
    },
  };
  return api;
}
