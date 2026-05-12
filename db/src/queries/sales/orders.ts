/**
 * Query Primitives for Sales Orders
 *
 * Pure database queries for order operations with N+1 optimization.
 * Handles order retrieval, filtering, aggregations, and status tracking.
 *
 * Note: Returns raw database rows. Domain mapping handled by OrderService.
 */

import { db } from '../../connection';
import {
    orders,
    orderItems,
    users,
    type Order as DbOrder,
    type OrderItem as DbOrderItem,
} from '../../schema';
import { eq, and, gte, lte, ilike, or, inArray, desc, sql, count as sqlCount } from 'drizzle-orm';
import { type ID, type OrderStatus, type PaymentStatus } from '@findeg/db/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderRow = DbOrder & { customerName?: string; customerEmail?: string };
export type OrderItemRow = DbOrderItem;

export interface OrderWithItems {
    order: OrderRow;
    items: OrderItemRow[];
}

export interface OrderFiltersInput {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    userId?: ID;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
}

export interface OrderCountByStatus {
    status: OrderStatus;
    count: number;
}

// ─── Order Retrieval ─────────────────────────────────────────────────────────

/**
 * Get order by ID with customer info and items
 */
export async function getById(id: ID | string): Promise<OrderWithItems | null> {
    const orderResult = await db
        .select({
            order: orders,
            user: users,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, Number(id)))
        .limit(1);

    if (orderResult.length === 0) return null;

    const itemsResult = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, Number(id)));

    const row = orderResult[0];
    const customerName =
        (row.user
            ? [row.user.firstName, row.user.lastName].filter(Boolean).join(' ').trim()
            : (row.order.shippingAddressSnapshot as Record<string, unknown>)?.fullName as string) || 'Guest';

    return {
        order: {
            ...row.order,
            customerName,
            customerEmail: row.user?.email || row.order.guestEmail || undefined,
        },
        items: itemsResult,
    };
}

/**
 * Get all orders for a user with items (batch-optimized)
 */
export async function getByUserId(userId: ID): Promise<OrderWithItems[]> {
    const orderResults = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

    if (orderResults.length === 0) return [];

    // Batch fetch all items for these orders
    const orderIds = orderResults.map((o) => o.id);
    const itemsResults = await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds));

    // Map items to orders
    const itemsByOrderId = new Map<number, OrderItemRow[]>();
    itemsResults.forEach((item) => {
        if (!itemsByOrderId.has(item.orderId)) {
            itemsByOrderId.set(item.orderId, []);
        }
        itemsByOrderId.get(item.orderId)!.push(item);
    });

    return orderResults.map((order) => ({
        order: order as OrderRow,
        items: itemsByOrderId.get(order.id) || [],
    }));
}

/**
 * Check if user has purchased a specific product
 */
export async function hasPurchasedProduct(userId: ID, productId: ID): Promise<boolean> {
    const purchasableStatuses: OrderStatus[] = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
    ];

    const rows = await db
        .select({ id: orderItems.id })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
            and(
                eq(orders.userId, Number(userId)),
                eq(orderItems.productId, Number(productId)),
                inArray(orders.status, purchasableStatuses),
            ),
        )
        .limit(1);

    return rows.length > 0;
}

/**
 * Get filtered orders with batch item loading (N+1 optimized)
 */
export async function getFiltered(filters: OrderFiltersInput): Promise<{
    orders: OrderWithItems[];
    total: number;
}> {
    const conditions = [];

    if (filters.status) conditions.push(eq(orders.status, filters.status));
    if (filters.paymentStatus) conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
    if (filters.userId) conditions.push(eq(orders.userId, filters.userId));
    if (filters.startDate) conditions.push(gte(orders.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(orders.createdAt, filters.endDate));

    if (filters.search) {
        if (!isNaN(Number(filters.search))) {
            conditions.push(eq(orders.id, Number(filters.search)));
        } else {
            conditions.push(
                or(
                    ilike(orders.guestEmail, `%${filters.search}%`),
                    ilike(orders.trackingNumber, `%${filters.search}%`),
                ),
            );
        }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch orders with user info
    const orderRows = await db
        .select({
            order: orders,
            user: users,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

    // Count total
    const totalResult = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(orders)
        .where(whereClause);

    if (orderRows.length === 0) {
        return { orders: [], total: totalResult[0]?.count || 0 };
    }

    // Batch fetch items for all orders
    const orderIds = orderRows.map((r) => r.order.id);
    const itemsResults = await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrderId = new Map<number, OrderItemRow[]>();
    itemsResults.forEach((item) => {
        if (!itemsByOrderId.has(item.orderId)) {
            itemsByOrderId.set(item.orderId, []);
        }
        itemsByOrderId.get(item.orderId)!.push(item);
    });

    return {
        orders: orderRows.map((row) => {
            const customerName =
                (row.user
                    ? [row.user.firstName, row.user.lastName].filter(Boolean).join(' ').trim()
                    : (row.order.shippingAddressSnapshot as Record<string, unknown>)?.fullName as string) ||
                'Guest';

            return {
                order: {
                    ...row.order,
                    customerName,
                    customerEmail: row.user?.email || row.order.guestEmail || undefined,
                },
                items: itemsByOrderId.get(row.order.id) || [],
            };
        }),
        total: totalResult[0]?.count || 0,
    };
}

/**
 * Get recent orders (used by getRecent)
 */
export async function getRecent(limit: number = 5): Promise<OrderWithItems[]> {
    const result = await getFiltered({ limit });
    return result.orders;
}

/**
 * Count orders with optional filters
 */
export async function count(filters?: OrderFiltersInput): Promise<number> {
    const conditions = [];

    if (filters) {
        if (filters.status) conditions.push(eq(orders.status, filters.status));
        if (filters.userId) conditions.push(eq(orders.userId, filters.userId));
        if (filters.paymentStatus) conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const result = await db.select({ value: sqlCount() }).from(orders).where(whereClause);
    return result[0]?.value || 0;
}

// ─── Order Mutations ────────────────────────────────────────────────────────

/**
 * Create order with items (transactional)
 */
export async function create(data: {
    userId?: number;
    guestEmail?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    subtotal: string;
    shippingCost: string;
    totalAmount: string;
    currency?: string;
    paymentMethod?: string;
    shippingAddressSnapshot?: Record<string, unknown>;
    items?: Array<{
        productId: number;
        variantId?: number;
        quantity: number;
        uomCode?: string;
        unitPriceSnapshot?: string;
        totalPrice?: string;
        productNameSnapshot?: string;
        productSkuSnapshot?: string;
        variantSnapshot?: Record<string, unknown>;
    }>;
}): Promise<OrderWithItems> {
    const { items, ...orderData } = data;

    return await db.transaction(async (tx) => {
        const dbOrderData: typeof orders.$inferInsert = {
            userId: orderData.userId,
            guestEmail: orderData.guestEmail,
            status: orderData.status || 'pending',
            paymentStatus: orderData.paymentStatus || 'unpaid',
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            totalAmount: orderData.totalAmount,
            currency: orderData.currency || 'EGP',
            paymentMethod: (orderData.paymentMethod as 'cod' | 'card') || null,
            shippingAddressSnapshot: (orderData.shippingAddressSnapshot || null) as any,
        };

        const [newOrder] = await tx.insert(orders).values(dbOrderData).returning();

        let newItems: OrderItemRow[] = [];
        if (items && items.length > 0) {
            newItems = await tx
                .insert(orderItems)
                .values(
                    items.map((item) => ({
                        orderId: newOrder.id,
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        uomCode: item.uomCode,
                        unitPriceSnapshot: item.unitPriceSnapshot,
                        totalPrice: item.totalPrice,
                        productNameSnapshot: item.productNameSnapshot,
                        productSkuSnapshot: item.productSkuSnapshot,
                        variantSnapshot: item.variantSnapshot,
                    })),
                )
                .returning();
        }

        return {
            order: newOrder as OrderRow,
            items: newItems,
        };
    });
}

/**
 * Update order status
 */
export async function updateStatus(id: ID | string, status: OrderStatus): Promise<void> {
    await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, Number(id)));
}

/**
 * Update order status with tracking info
 */
export async function updateStatusWithTracking(
    id: ID | string,
    data: {
        status: OrderStatus;
        trackingNumber?: string;
        adminNotes?: string;
    },
): Promise<void> {
    const updateData: Partial<typeof orders.$inferInsert> = {
        status: data.status,
        updatedAt: new Date(),
    };

    if (data.trackingNumber) updateData.trackingNumber = data.trackingNumber;
    if (data.adminNotes) updateData.adminNotes = data.adminNotes;

    await db.update(orders).set(updateData).where(eq(orders.id, Number(id)));
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(id: ID | string, status: PaymentStatus): Promise<void> {
    await db
        .update(orders)
        .set({ paymentStatus: status, updatedAt: new Date() })
        .where(eq(orders.id, Number(id)));
}

// ─── Analytics ──────────────────────────────────────────────────────────────

/**
 * Get order counts grouped by status
 */
export async function getOrdersCountByStatus(): Promise<OrderCountByStatus[]> {
    const counts = await db
        .select({
            status: orders.status,
            count: sql<number>`cast(count(*) as integer)`,
        })
        .from(orders)
        .groupBy(orders.status);

    return counts as OrderCountByStatus[];
}

/**
 * Get total revenue with optional date range
 */
export async function getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const conditions = [];
    if (startDate) conditions.push(gte(orders.createdAt, startDate));
    if (endDate) conditions.push(lte(orders.createdAt, endDate));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
        .select({ total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` })
        .from(orders)
        .where(whereClause);

    return Number(result[0]?.total || 0);
}

/**
 * Get revenue grouped by period (day or month)
 */
export async function getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'month' = 'day',
): Promise<RevenueDataPoint[]> {
    const dateFormat = interval === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM';

    const result = await db.execute<{ date: string; revenue: string }>(sql`
    SELECT 
      TO_CHAR(${orders.createdAt}, ${dateFormat}) as date,
      SUM(${orders.totalAmount}) as revenue
    FROM ${orders}
    WHERE ${orders.createdAt} >= ${startDate.toISOString()} 
      AND ${orders.createdAt} <= ${endDate.toISOString()}
    GROUP BY date
    ORDER BY date ASC
  `);

    return result.map((row) => ({
        date: row.date,
        revenue: Number(row.revenue),
    }));
}
