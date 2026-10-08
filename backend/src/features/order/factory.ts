import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { auditLog, orders, orderItems, users } from '@findeg/db/schema';
import type { Order } from './domain/entities/Order';
import type { ShippingAddress } from './domain/value-objects/ShippingAddress';
import type { OrderStatus, PaymentStatus } from '@findeg/db/types';
import { mapOrder, type OrderItemRow, type OrderRow } from './mapper';
import {
  createOrderStatistics,
  cairoOrderDateRange,
  type OrderStatisticsDependencies,
} from './statistics';
import { createOrderTransitions } from './transitions';

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: number;
  /** Inclusive Cairo calendar date keys. */
  from?: string;
  to?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export type OrdersDependencies = OrderStatisticsDependencies;
export interface OrderActivityEntry {
  id: number;
  action: string;
  adminId?: number;
  adminName?: string;
  adminEmail?: string;
  oldValues: unknown;
  newValues: unknown;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

function assertId(value: number | string): number {
  const id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    throw new RangeError('Order and Customer IDs must be positive database integers');
  }
  return id;
}

/** One entry point for Order reads, statistics and authorized lifecycle changes. */
export function createOrders(dependencies: OrdersDependencies = {}) {
  const getDb = async () => dependencies.db ?? (await import('@findeg/db/connection')).db;
  async function list(filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> {
    if (
      !Number.isInteger(filters.limit ?? 50) ||
      (filters.limit ?? 50) < 1 ||
      !Number.isInteger(filters.offset ?? 0) ||
      (filters.offset ?? 0) < 0
    ) {
      throw new RangeError('Invalid Order pagination');
    }
    const calendarRange = cairoOrderDateRange(filters.from, filters.to);
    if (filters.userId !== undefined) assertId(filters.userId);
    for (const date of [filters.startDate, filters.endDate]) {
      if (date !== undefined && (!(date instanceof Date) || !Number.isFinite(date.getTime()))) {
        throw new RangeError('Invalid Order date filter');
      }
    }
    const db = await getDb();
    const search = filters.search
      ? or(
          ilike(orders.orderReference, `%${filters.search}%`),
          ilike(orders.guestEmail, `%${filters.search}%`),
          ilike(orders.trackingNumber, `%${filters.search}%`),
          /^\d+$/.test(filters.search) &&
            Number.isSafeInteger(Number(filters.search)) &&
            Number(filters.search) <= 2147483647
            ? eq(orders.id, Number(filters.search))
            : undefined,
        )
      : undefined;
    const where = and(
      filters.status ? eq(orders.status, filters.status) : undefined,
      filters.paymentStatus ? eq(orders.paymentStatus, filters.paymentStatus) : undefined,
      filters.userId !== undefined ? eq(orders.userId, filters.userId) : undefined,
      filters.startDate ? gte(orders.createdAt, filters.startDate) : undefined,
      filters.endDate ? lte(orders.createdAt, filters.endDate) : undefined,
      calendarRange,
      search,
    );
    const [rows, counts] = await Promise.all([
      db
        .select({ order: orders, customer: users })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(where)
        .orderBy(desc(orders.createdAt), desc(orders.id))
        .limit(filters.limit ?? 50)
        .offset(filters.offset ?? 0),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(where),
    ]);
    return { orders: await mapRows(rows), total: counts[0].count };
  }
  async function mapRows(
    rows: Array<{ order: OrderRow; customer: Parameters<typeof mapOrder>[2] }>,
  ): Promise<Order[]> {
    if (!rows.length) return [];
    const db = await getDb();
    const items = await db
      .select()
      .from(orderItems)
      .where(
        inArray(
          orderItems.orderId,
          rows.map((row) => row.order.id),
        ),
      );
    const byOrder = new Map<number, OrderItemRow[]>();
    for (const item of items) {
      const group = byOrder.get(item.orderId) ?? [];
      group.push(item);
      byOrder.set(item.orderId, group);
    }
    return rows.map((row) => mapOrder(row.order, byOrder.get(row.order.id) ?? [], row.customer));
  }
  async function get(id: number | string): Promise<Order | null> {
    const orderId = assertId(id);
    const db = await getDb();
    const [row] = await db
      .select({ order: orders, customer: users })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!row) return null;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, row.order.id));
    return mapOrder(row.order, items, row.customer);
  }
  return {
    get,
    list,
    async listForCustomer(userId: number): Promise<Order[]> {
      assertId(userId);
      const db = await getDb();
      const rows = await db
        .select({ order: orders, customer: users })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt), desc(orders.id));
      return mapRows(rows);
    },
    async recent(limit = 5): Promise<Order[]> {
      return (await list({ limit })).orders;
    },
    async latestShippingAddress(userId: number): Promise<ShippingAddress | null> {
      assertId(userId);
      const db = await getDb();
      const [row] = await db
        .select({ address: orders.shippingAddressSnapshot })
        .from(orders)
        .where(and(eq(orders.userId, userId), sql`${orders.shippingAddressSnapshot} is not null`))
        .orderBy(desc(orders.createdAt), desc(orders.id))
        .limit(1);
      return row?.address ?? null;
    },
    async detail(
      id: number | string,
    ): Promise<{ order: Order; activity: OrderActivityEntry[] } | null> {
      const order = await get(id);
      if (!order) return null;
      const db = await getDb();
      const rows = await db
        .select({ log: auditLog, actor: users })
        .from(auditLog)
        .leftJoin(users, eq(auditLog.adminUserId, users.id))
        .where(and(eq(auditLog.entityType, 'order'), eq(auditLog.entityId, String(order.id))))
        .orderBy(desc(auditLog.createdAt), desc(auditLog.id));
      const value = (values: unknown): string | undefined => {
        if (!values || typeof values !== 'object') return undefined;
        const fields = values as Record<string, unknown>;
        const status = fields.paymentStatus ?? fields.status;
        return typeof status === 'string' ? status : undefined;
      };
      return {
        order,
        activity: rows.map(({ log, actor }) => ({
          id: log.id,
          action: log.action,
          adminId: log.adminUserId ?? undefined,
          adminName: actor
            ? [actor.firstName, actor.lastName].filter(Boolean).join(' ') || actor.email
            : undefined,
          adminEmail: actor?.email,
          oldValues: log.oldValues,
          newValues: log.newValues,
          oldValue: value(log.oldValues),
          newValue: value(log.newValues),
          createdAt: log.createdAt,
        })),
      };
    },
    ...createOrderStatistics(dependencies),
    ...createOrderTransitions(dependencies),
  };
}

export type Orders = ReturnType<typeof createOrders>;
