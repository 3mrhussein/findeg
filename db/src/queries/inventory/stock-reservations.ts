import { availableStock, freeUnits, RESERVATION_SETTLEMENTS } from '@findeg/domain';
import { mapStockBalance, domainId } from '../../mapping';

import { type ReservationSettlement } from '@findeg/domain';
/**
 * Stock Reservation primitives (ADR-0005)
 *
 * Reserve units for an accepted order, then consume them at delivery or release
 * them on cancellation. All three join the caller's transaction (`tx`) so Order
 * Acceptance and status transitions stay atomic, and all lock balances
 * `FOR UPDATE` in variant → warehouse order so concurrent orders cannot deadlock.
 */

import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { inventoryBalances, stockMovements, stockReservations, warehouses } from '../../schema';
import { withTransaction, type DbTransaction } from '../transaction';

export interface ReservationLine {
  variantId: number;
  quantity: number;
}

export interface ReservedStock {
  variantId: number;
  warehouseId: number;
  quantity: number;
}

export interface StockShortfall {
  variantId: number;
  requested: number;
  available: number;
}

/** Thrown when a reservation cannot be filled in full; nothing is written. */
export class InsufficientStockError extends Error {
  constructor(readonly shortfalls: StockShortfall[]) {
    super(
      `Insufficient stock: ${shortfalls
        .map((s) => `variant ${s.variantId} requested ${s.requested}, available ${s.available}`)
        .join('; ')}`,
    );
    this.name = 'InsufficientStockError';
  }
}

/** Thrown when an order's reservation was already settled the other way. */
export class StockReservationStateError extends Error {
  constructor(
    readonly orderId: number,
    readonly attempted: ReservationSettlement,
  ) {
    super(`Order ${orderId} reservation was already settled; cannot ${attempted} it`);
    this.name = 'StockReservationStateError';
  }
}

function aggregate(lines: ReservationLine[]): ReservationLine[] {
  const totals = new Map<number, number>();
  for (const { variantId, quantity } of lines) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new RangeError(`Reservation quantity must be a positive integer, got ${quantity}`);
    }
    totals.set(variantId, (totals.get(variantId) ?? 0) + quantity);
  }
  return [...totals]
    .map(([variantId, quantity]) => ({ variantId, quantity }))
    .sort((a, b) => a.variantId - b.variantId);
}

/**
 * Reserves `lines` for `orderId`, filling each variant greedily across active
 * warehouses in warehouse order. Duplicate variants are summed first. A shortfall
 * throws `InsufficientStockError` before any write, so the caller's transaction
 * rolls back whole.
 */
export async function reserveOrderStock(
  orderId: number,
  lines: ReservationLine[],
  tx?: DbTransaction,
): Promise<ReservedStock[]> {
  const wanted = aggregate(lines);
  if (wanted.length === 0) return [];

  return withTransaction(tx, async (tx) => {
    const balances = await lockOrderStock(
      wanted.map((line) => line.variantId),
      tx,
    );
    const reservedLines: ReservedStock[] = [];
    const shortfalls: StockShortfall[] = [];
    for (const { variantId, quantity } of wanted) {
      let remaining = quantity;
      const variantBalances = balances.filter((balance) => balance.variantId === variantId);
      const available = availableStock(
        domainId<'ProductVariant'>(variantId),
        variantBalances.map(mapStockBalance),
        variantBalances.map((balance) => ({
          id: domainId<'Warehouse'>(balance.warehouseId),
          name: '',
          status: 'active',
        })),
      );
      for (const balance of variantBalances) {
        const free = freeUnits(balance);
        const take = Math.min(free, remaining);
        if (take > 0) {
          reservedLines.push({ variantId, warehouseId: balance.warehouseId, quantity: take });
          remaining -= take;
        }
      }
      if (remaining > 0) shortfalls.push({ variantId, requested: quantity, available });
    }
    if (shortfalls.length > 0) throw new InsufficientStockError(shortfalls);

    await persistOrderStock(orderId, reservedLines, tx);
    return reservedLines;
  });
}

/** Locks authoritative balances in deterministic order before Domain allocates them. */
export async function lockOrderStock(variantIds: number[], tx: DbTransaction) {
  return tx
    .select({
      variantId: inventoryBalances.variantId,
      warehouseId: inventoryBalances.warehouseId,
      onHand: inventoryBalances.onHand,
      reserved: inventoryBalances.reserved,
    })
    .from(inventoryBalances)
    .where(
      and(
        inArray(inventoryBalances.variantId, variantIds),
        // A subquery, not a join: Postgres rejects the schema-qualified
        // `FOR UPDATE OF` Drizzle emits for joined tables.
        inArray(
          inventoryBalances.warehouseId,
          tx.select({ id: warehouses.id }).from(warehouses).where(eq(warehouses.isActive, true)),
        ),
      ),
    )
    .orderBy(asc(inventoryBalances.variantId), asc(inventoryBalances.warehouseId))
    .for('update');
}

/** Persists the allocation already decided by Domain, under the caller's balance locks. */
export async function persistOrderStock(
  orderId: number,
  reservedLines: ReservedStock[],
  tx: DbTransaction,
): Promise<void> {
  if (reservedLines.length === 0) return;
  await tx.insert(stockReservations).values(reservedLines.map((a) => ({ orderId, ...a })));
  for (const a of reservedLines) {
    await tx
      .update(inventoryBalances)
      .set({ reserved: sql`${inventoryBalances.reserved} + ${a.quantity}` })
      .where(
        and(
          eq(inventoryBalances.variantId, a.variantId),
          eq(inventoryBalances.warehouseId, a.warehouseId),
        ),
      );
  }
  await tx.insert(stockMovements).values(
    reservedLines.map((a) => ({
      variantId: a.variantId,
      warehouseId: a.warehouseId,
      movementType: 'reserve',
      quantity: a.quantity,
      referenceType: 'order',
      referenceId: String(orderId),
      notes: `Reservation for order ${orderId}`,
    })),
  );
}

type Settlement = ReservationSettlement;

/**
 * Settles every reserved line of an order's reservation. Returns false when this
 * settlement was already applied (idempotent), true when it ran now.
 */
async function settleOrderStock(
  orderId: number,
  settlement: Settlement,
  tx?: DbTransaction,
): Promise<boolean> {
  return withTransaction(tx, async (tx) => {
    const reservations = await tx
      .select({
        variantId: stockReservations.variantId,
        warehouseId: stockReservations.warehouseId,
        quantity: stockReservations.quantity,
      })
      .from(stockReservations)
      .where(eq(stockReservations.orderId, orderId))
      .orderBy(asc(stockReservations.variantId), asc(stockReservations.warehouseId));
    if (reservations.length === 0) return false;

    // Lock the balances first: a concurrent settlement queues here and then sees
    // the committed movements below.
    for (const r of reservations) {
      await tx
        .select({ id: inventoryBalances.id })
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.variantId, r.variantId),
            eq(inventoryBalances.warehouseId, r.warehouseId),
          ),
        )
        .for('update');
    }

    const settled = await tx
      .selectDistinct({ movementType: stockMovements.movementType })
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.referenceType, 'order'),
          eq(stockMovements.referenceId, String(orderId)),
          inArray(stockMovements.movementType, RESERVATION_SETTLEMENTS),
        ),
      );
    if (settled.some((s) => s.movementType === settlement)) return false;
    if (settled.length > 0) {
      throw new StockReservationStateError(orderId, settlement);
    }

    for (const r of reservations) {
      await tx
        .update(inventoryBalances)
        .set(
          settlement === 'consume'
            ? {
                onHand: sql`${inventoryBalances.onHand} - ${r.quantity}`,
                reserved: sql`${inventoryBalances.reserved} - ${r.quantity}`,
              }
            : { reserved: sql`${inventoryBalances.reserved} - ${r.quantity}` },
        )
        .where(
          and(
            eq(inventoryBalances.variantId, r.variantId),
            eq(inventoryBalances.warehouseId, r.warehouseId),
          ),
        );
    }
    await tx.insert(stockMovements).values(
      reservations.map((r) => ({
        variantId: r.variantId,
        warehouseId: r.warehouseId,
        movementType: settlement,
        // Consume takes units out of the building; release only frees the hold.
        quantity: settlement === 'consume' ? -r.quantity : r.quantity,
        referenceType: 'order',
        referenceId: String(orderId),
        notes: `${settlement === 'consume' ? 'Consume' : 'Release'} reservation for order ${orderId}`,
      })),
    );
    return true;
  });
}

/** Delivery: `on_hand -= n`, `reserved -= n` for each reserved line. Idempotent per order. */
export function consumeOrderStock(orderId: number, tx?: DbTransaction): Promise<boolean> {
  return settleOrderStock(orderId, 'consume', tx);
}

/** Cancellation: `reserved -= n` for each reserved line. Idempotent per order. */
export function releaseOrderStock(orderId: number, tx?: DbTransaction): Promise<boolean> {
  return settleOrderStock(orderId, 'release', tx);
}
