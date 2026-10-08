import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  auditLog,
  orders,
  outbox,
  inventoryBalances,
  stockMovements,
  categories,
  products,
  productVariants,
  warehouses,
  users,
} from '@findeg/db/schema';
import { reserveOrderStock } from '@findeg/db/queries';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { createOrders, InvalidPaymentStatusTransitionError } from '..';
import type { OrderStatus, PaymentStatus } from '../../core';
import { InvalidOrderStatusValueError, InvalidOrderStatusTransitionError } from '../errors';
import type { OrderStaffActor } from '../actor';

// Fixture writes are independent of Checkout/global connection: every operation is injected.
describe('Orders atomic transitions', () => {
  let testDb: TestDatabase;
  let actor: OrderStaffActor;
  let sequence = 0;
  const clock = new Date('2026-10-08T12:00:00Z');
  beforeAll(async () => {
    testDb = connectToTestDatabase();
    const [staff] = await testDb.db
      .insert(users)
      .values({ email: 'factory-transition-staff@example.com', portalRole: 'staff' })
      .returning();
    actor = { kind: 'staff', userId: staff.id, activeRoleIds: ['system_admin'] };
  });
  afterAll(async () => testDb.close());

  function transitions() {
    return createOrders({ db: testDb.db, now: () => clock });
  }
  async function fixture(status: 'pending' | 'shipped' = 'pending') {
    const suffix = ++sequence;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `factory-transition-category-${suffix}` })
      .returning();
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `factory-transition-product-${suffix}`,
        localizedName: { en: 'Notebook' },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
        categoryId: category.id,
      })
      .returning();
    const [variant] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `FACTORY-TRANSITION-${suffix}`,
        basePrice: '25.00',
        localizedLabel: { en: 'Default' },
      })
      .returning();
    const [warehouse] = await testDb.db
      .insert(warehouses)
      .values({ code: `factory-transition-warehouse-${suffix}`, name: 'Cairo' })
      .returning();
    await testDb.db
      .insert(inventoryBalances)
      .values({ variantId: variant.id, warehouseId: warehouse.id, onHand: 10 });
    const [order] = await testDb.db
      .insert(orders)
      .values({ status, totalAmount: '50.00' })
      .returning();
    await testDb.db.transaction((tx) =>
      reserveOrderStock(order.id, [{ variantId: variant.id, quantity: 2 }], tx),
    );
    return { order, variant };
  }
  async function auditFor(id: number) {
    return testDb.db
      .select()
      .from(auditLog)
      .where(eq(auditLog.entityId, String(id)));
  }

  const lifecycleTargets: Record<OrderStatus, readonly OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: [],
  };
  const lifecycleStatuses = Object.keys(lifecycleTargets) as OrderStatus[];
  it.each(lifecycleStatuses.flatMap((from) => lifecycleStatuses.map((to) => ({ from, to }))))(
    'enforces lifecycle $from → $to and its audit footprint',
    async ({ from, to }) => {
      const [order] = await testDb.db
        .insert(orders)
        .values({ status: from, totalAmount: '1.00' })
        .returning();
      const service = transitions();
      const command = service.changeStatus(actor, order.id, { status: to });
      const allowed = lifecycleTargets[from].includes(to);
      if (from === to) {
        await expect(command).resolves.toEqual({
          changed: false,
          previousStatus: from,
          status: to,
        });
      } else if (allowed) {
        await expect(command).resolves.toEqual({ changed: true, previousStatus: from, status: to });
        await expect(service.changeStatus(actor, order.id, { status: to })).resolves.toMatchObject({
          changed: false,
        });
      } else {
        await expect(command).rejects.toBeInstanceOf(InvalidOrderStatusTransitionError);
        await expect(command).rejects.toMatchObject({
          from,
          to,
          allowedTargets: lifecycleTargets[from],
        });
      }
      const [saved] = await testDb.db.select().from(orders).where(eq(orders.id, order.id));
      expect(saved.status).toBe(allowed ? to : from);
      const audit = await auditFor(order.id);
      expect(audit).toHaveLength(allowed && from !== to ? 1 : 0);
      if (audit.length)
        expect(audit[0]).toMatchObject({
          action: 'update_status',
          adminUserId: actor.userId,
          oldValues: { status: from },
          newValues: { status: to },
        });
    },
  );

  const paymentTargets: Record<PaymentStatus, readonly PaymentStatus[]> = {
    unpaid: ['paid'],
    paid: ['refunded'],
    refunded: [],
  };
  const paymentStatuses = Object.keys(paymentTargets) as PaymentStatus[];
  it.each(paymentStatuses.flatMap((from) => paymentStatuses.map((to) => ({ from, to }))))(
    'enforces payment $from → $to and its audit footprint',
    async ({ from, to }) => {
      const [order] = await testDb.db
        .insert(orders)
        .values({ paymentStatus: from, totalAmount: '1.00' })
        .returning();
      const service = transitions();
      const command = service.changePaymentStatus(actor, order.id, to);
      const allowed = paymentTargets[from].includes(to);
      if (from === to) {
        await expect(command).resolves.toEqual({
          changed: false,
          previousStatus: from,
          status: to,
        });
      } else if (allowed) {
        await expect(command).resolves.toEqual({ changed: true, previousStatus: from, status: to });
        await expect(service.changePaymentStatus(actor, order.id, to)).resolves.toMatchObject({
          changed: false,
        });
      } else {
        await expect(command).rejects.toBeInstanceOf(InvalidPaymentStatusTransitionError);
        await expect(command).rejects.toMatchObject({
          from,
          to,
          allowedTargets: paymentTargets[from],
        });
      }
      const [saved] = await testDb.db.select().from(orders).where(eq(orders.id, order.id));
      expect(saved.paymentStatus).toBe(allowed ? to : from);
      const audit = await auditFor(order.id);
      expect(audit).toHaveLength(allowed && from !== to ? 1 : 0);
      if (audit.length)
        expect(audit[0]).toMatchObject({
          action: 'update_payment_status',
          adminUserId: actor.userId,
          oldValues: { paymentStatus: from },
          newValues: { paymentStatus: to },
        });
    },
  );

  it('checks permissions and rejects unknown values before attempting any database access', async () => {
    // No injected connection: these paths must fail without loading the default DB.
    const service = createOrders();
    await expect(
      service.changeStatus({ kind: 'staff', userId: 1 }, 1, { status: 'confirmed' }),
    ).rejects.toMatchObject({ name: 'NotAuthorizedError' });
    await expect(
      service.changeStatus(actor, 1, { status: 'unknown' as never }),
    ).rejects.toBeInstanceOf(InvalidOrderStatusValueError);
    await expect(service.changePaymentStatus(actor, 1, 'unknown' as never)).rejects.toBeInstanceOf(
      InvalidOrderStatusValueError,
    );
  });

  it('writes one audited status, stock consumption and message under concurrent delivery and ignores repeat notes', async () => {
    const { order, variant } = await fixture('shipped');
    const service = transitions();
    const results = await Promise.all(
      ['first', 'second', 'third'].map((adminNotes) =>
        service.changeStatus(actor, order.id, { status: 'delivered', adminNotes }),
      ),
    );
    expect(results.filter((r) => r.changed)).toHaveLength(1);
    await service.changeStatus(actor, order.id, { status: 'delivered', adminNotes: 'late repeat' });
    const [saved] = await testDb.db.select().from(orders).where(eq(orders.id, order.id));
    expect(saved.adminNotes).not.toBe('late repeat');
    expect(saved.updatedAt).toEqual(clock);
    const audit = await auditFor(order.id);
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({
      adminUserId: actor.userId,
      oldValues: { status: 'shipped' },
      createdAt: clock,
    });
    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variant.id));
    expect(balance).toMatchObject({ onHand: 8, reserved: 0 });
    const movements = await testDb.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.referenceId, String(order.id)));
    expect(movements.filter((row) => row.movementType === 'consume')).toHaveLength(1);
    expect(
      await testDb.db
        .select()
        .from(outbox)
        .where(eq(outbox.id, `order-status:${order.orderReference}:delivered`)),
    ).toHaveLength(1);
  });

  it('rejects illegal lifecycle transitions without an audit', async () => {
    const { order } = await fixture();
    await expect(
      transitions().changeStatus(actor, order.id, { status: 'delivered' }),
    ).rejects.toBeInstanceOf(InvalidOrderStatusTransitionError);
    expect(await auditFor(order.id)).toHaveLength(0);
  });

  it('rolls back status, stock and message when the audit insert fails', async () => {
    const { order, variant } = await fixture();
    await testDb.sql.unsafe(
      `ALTER TABLE system.audit_log ADD CONSTRAINT factory_fail_status_audit CHECK (entity_type <> 'order' OR entity_id <> '${order.id}')`,
    );
    try {
      await expect(
        transitions().changeStatus(actor, order.id, { status: 'cancelled' }),
      ).rejects.toThrow();
      const [saved] = await testDb.db.select().from(orders).where(eq(orders.id, order.id));
      expect(saved.status).toBe('pending');
      const [balance] = await testDb.db
        .select()
        .from(inventoryBalances)
        .where(eq(inventoryBalances.variantId, variant.id));
      expect(balance).toMatchObject({ onHand: 10, reserved: 2 });
      const movements = await testDb.db
        .select()
        .from(stockMovements)
        .where(eq(stockMovements.referenceId, String(order.id)));
      expect(movements.map((row) => row.movementType)).toEqual(['reserve']);
      expect(
        await testDb.db
          .select()
          .from(outbox)
          .where(eq(outbox.id, `order-status:${order.orderReference}:cancelled`)),
      ).toHaveLength(0);
      expect(await auditFor(order.id)).toHaveLength(0);
    } finally {
      await testDb.sql.unsafe(
        'ALTER TABLE system.audit_log DROP CONSTRAINT factory_fail_status_audit',
      );
    }
  });

  it('audits concurrent payment changes once and rolls payment back on audit failure', async () => {
    const { order } = await fixture();
    const service = transitions();
    const results = await Promise.all([
      service.changePaymentStatus(actor, order.id, 'paid'),
      service.changePaymentStatus(actor, order.id, 'paid'),
    ]);
    expect(results.filter((r) => r.changed)).toHaveLength(1);
    expect(await auditFor(order.id)).toHaveLength(1);
    await testDb.sql.unsafe(
      `ALTER TABLE system.audit_log ADD CONSTRAINT factory_fail_payment_audit CHECK (entity_type <> 'order' OR entity_id <> '${order.id}' OR action <> 'update_payment_status' OR new_values->>'paymentStatus' <> 'refunded')`,
    );
    try {
      await expect(service.changePaymentStatus(actor, order.id, 'refunded')).rejects.toThrow();
      const [saved] = await testDb.db.select().from(orders).where(eq(orders.id, order.id));
      expect(saved.paymentStatus).toBe('paid');
      expect(await auditFor(order.id)).toHaveLength(1);
    } finally {
      await testDb.sql.unsafe(
        'ALTER TABLE system.audit_log DROP CONSTRAINT factory_fail_payment_audit',
      );
    }
  });
});
