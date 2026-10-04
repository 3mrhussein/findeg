import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  categories,
  inventoryBalances,
  orders,
  outbox,
  products,
  productVariants,
  stockMovements,
  users,
  warehouses,
} from '@findeg/db/schema';
import { createCheckoutService } from '../../checkout';
import { createAdministrationServices } from '../../administration';
import { createOutbox, retryOutbox, type EmailProvider, type OutgoingEmail } from '../../outbox';
import {
  InvalidOrderStatusTransitionError,
  transitionOrderStatus,
} from '../application/services/transition-order-status';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

describe('transitionOrderStatus on real Postgres', () => {
  let testDb: TestDatabase;
  let sequence = 0;
  const checkout = createCheckoutService({ shippingFee: 50 });

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());

  async function acceptOrder(quantity = 2) {
    sequence += 1;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `transition-category-${sequence}` })
      .returning();
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `transition-product-${sequence}`,
        localizedName: { en: 'Notebook', ar: 'كشكول' },
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
        sku: `TRANSITION-${sequence}`,
        basePrice: '25.00',
        localizedLabel: { en: 'Default' },
      })
      .returning();
    const [warehouse] = await testDb.db
      .insert(warehouses)
      .values({ code: `transition-warehouse-${sequence}`, name: 'Cairo Main' })
      .returning();
    await testDb.db.insert(inventoryBalances).values({
      variantId: variant.id,
      warehouseId: warehouse.id,
      onHand: 10,
    });

    const lines = [{ variantId: variant.id, quantity }];
    const quote = await checkout.validate({ source: 'cart', lines });
    if (!quote.success) throw new Error(`Quote failed: ${quote.error.message}`);
    const accepted = await checkout.accept(
      {
        source: 'cart',
        lines,
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod',
        guestEmail: `transition-${sequence}@example.com`,
        address: {
          fullName: 'Ahmed Hassan',
          phone: '01012345678',
          city: 'Cairo',
          area: 'Nasr City',
          street: 'Abbas El Akkad',
          building: '15',
        },
      },
      { idempotencyKey: `transition-${sequence}` },
    );
    if (!accepted.success) throw new Error(`Acceptance failed: ${accepted.error.message}`);

    return {
      orderId: accepted.data.order.id,
      orderReference: accepted.data.order.orderReference,
      variantId: variant.id,
      warehouseId: warehouse.id,
    };
  }

  it('rejects an invalid transition and lists the allowed targets', async () => {
    const { orderId } = await acceptOrder();

    await expect(transitionOrderStatus(orderId, { status: 'delivered' })).rejects.toEqual(
      expect.objectContaining<Partial<InvalidOrderStatusTransitionError>>({
        from: 'pending',
        to: 'delivered',
        allowedTargets: ['confirmed', 'cancelled'],
      }),
    );
  });

  it('delivering consumes the reservation exactly once', async () => {
    const { orderId, variantId } = await acceptOrder(2);

    await transitionOrderStatus(orderId, { status: 'confirmed' });
    await transitionOrderStatus(orderId, { status: 'processing' });
    await transitionOrderStatus(orderId, { status: 'shipped' });
    expect(await transitionOrderStatus(orderId, { status: 'delivered' })).toMatchObject({
      changed: true,
      previousStatus: 'shipped',
      status: 'delivered',
    });
    expect(await transitionOrderStatus(orderId, { status: 'delivered' })).toMatchObject({
      changed: false,
      previousStatus: 'delivered',
      status: 'delivered',
    });

    const [order] = await testDb.db.select().from(orders).where(eq(orders.id, orderId));
    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));
    const movements = await testDb.db
      .select({ movementType: stockMovements.movementType })
      .from(stockMovements)
      .where(eq(stockMovements.referenceId, String(orderId)));

    expect(order.status).toBe('delivered');
    expect(balance).toMatchObject({ onHand: 8, reserved: 0 });
    expect(movements.map((movement) => movement.movementType).sort()).toEqual([
      'consume',
      'reserve',
    ]);
  });

  it('cancelling before delivery releases the reservation exactly once', async () => {
    const { orderId, variantId } = await acceptOrder(3);

    expect(await transitionOrderStatus(orderId, { status: 'cancelled' })).toMatchObject({
      changed: true,
      previousStatus: 'pending',
      status: 'cancelled',
    });
    expect(await transitionOrderStatus(orderId, { status: 'cancelled' })).toMatchObject({
      changed: false,
    });

    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));
    const movements = await testDb.db
      .select({ movementType: stockMovements.movementType })
      .from(stockMovements)
      .where(eq(stockMovements.referenceId, String(orderId)));

    expect(balance).toMatchObject({ onHand: 10, reserved: 0 });
    expect(movements.map((movement) => movement.movementType).sort()).toEqual([
      'release',
      'reserve',
    ]);
  });

  it('is idempotent per order and transition, even when repeated concurrently', async () => {
    const { orderId, variantId } = await acceptOrder(2);
    await transitionOrderStatus(orderId, { status: 'confirmed' });
    await transitionOrderStatus(orderId, { status: 'processing' });
    await transitionOrderStatus(orderId, { status: 'shipped' });

    const results = await Promise.all([
      transitionOrderStatus(orderId, { status: 'delivered', adminNotes: 'first' }),
      transitionOrderStatus(orderId, { status: 'delivered', adminNotes: 'second' }),
      transitionOrderStatus(orderId, { status: 'delivered', adminNotes: 'third' }),
    ]);
    expect(results.filter((result) => result.changed)).toHaveLength(1);

    const repeat = await transitionOrderStatus(orderId, {
      status: 'delivered',
      adminNotes: 'late repeat',
    });
    expect(repeat.changed).toBe(false);

    const [order] = await testDb.db.select().from(orders).where(eq(orders.id, orderId));
    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));
    const movements = await testDb.db
      .select({ movementType: stockMovements.movementType })
      .from(stockMovements)
      .where(eq(stockMovements.referenceId, String(orderId)));

    expect(order.adminNotes).not.toBe('late repeat');
    expect(balance).toMatchObject({ onHand: 8, reserved: 0 });
    expect(movements.filter((movement) => movement.movementType === 'consume')).toHaveLength(1);
  });

  it.each([
    ['processing', ['confirmed', 'processing']],
    ['shipped', ['confirmed', 'processing', 'shipped']],
  ] as const)('refuses to refund a %s Order before delivery', async (from, path) => {
    const { orderId } = await acceptOrder();
    for (const step of path) await transitionOrderStatus(orderId, { status: step });

    await expect(transitionOrderStatus(orderId, { status: 'refunded' })).rejects.toEqual(
      expect.objectContaining<Partial<InvalidOrderStatusTransitionError>>({
        from,
        to: 'refunded',
        allowedTargets: expect.not.arrayContaining(['refunded']),
      }),
    );
    const [order] = await testDb.db.select().from(orders).where(eq(orders.id, orderId));
    expect(order.status).toBe(from);
  });

  it('cancelling a shipped Order releases the reservation exactly once', async () => {
    const { orderId, variantId } = await acceptOrder(2);
    await transitionOrderStatus(orderId, { status: 'confirmed' });
    await transitionOrderStatus(orderId, { status: 'processing' });
    await transitionOrderStatus(orderId, { status: 'shipped' });

    expect(await transitionOrderStatus(orderId, { status: 'cancelled' })).toMatchObject({
      changed: true,
      previousStatus: 'shipped',
      status: 'cancelled',
    });
    expect(await transitionOrderStatus(orderId, { status: 'cancelled' })).toMatchObject({
      changed: false,
    });

    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));
    const movements = await testDb.db
      .select({ movementType: stockMovements.movementType })
      .from(stockMovements)
      .where(eq(stockMovements.referenceId, String(orderId)));

    expect(balance).toMatchObject({ onHand: 10, reserved: 0 });
    expect(movements.map((movement) => movement.movementType).sort()).toEqual([
      'release',
      'reserve',
    ]);
  });

  it('refunding a delivered Order has no automatic stock effect', async () => {
    const { orderId, variantId } = await acceptOrder(2);
    for (const step of ['confirmed', 'processing', 'shipped', 'delivered'] as const) {
      await transitionOrderStatus(orderId, { status: step });
    }

    expect(await transitionOrderStatus(orderId, { status: 'refunded' })).toMatchObject({
      changed: true,
      previousStatus: 'delivered',
      status: 'refunded',
    });

    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));
    const movements = await testDb.db
      .select({ movementType: stockMovements.movementType })
      .from(stockMovements)
      .where(eq(stockMovements.referenceId, String(orderId)));

    expect(balance).toMatchObject({ onHand: 8, reserved: 0 });
    expect(movements.map((movement) => movement.movementType).sort()).toEqual([
      'consume',
      'reserve',
    ]);
  });

  it('routes Admin status updates through the transition and retains the audit log', async () => {
    const { orderId } = await acceptOrder();
    const administration = createAdministrationServices();
    const [admin] = await testDb.db
      .insert(users)
      .values({ email: `transition-admin-${orderId}@example.com`, portalRole: 'staff' })
      .returning();
    const systemAdministrator = {
      kind: 'staff' as const,
      userId: admin.id,
      activeRoleIds: ['system_admin'],
    };

    await administration.orders.updateStatus(systemAdministrator, orderId, {
      status: 'confirmed',
      adminNotes: 'Confirmed in the Dashboard',
    });

    const order = await administration.orders.getById(orderId);
    const auditEntries = await administration.auditLog.getEntityLogs('order', String(orderId));
    expect(order).toMatchObject({
      status: 'confirmed',
      adminNotes: 'Confirmed in the Dashboard',
    });
    expect(auditEntries).toEqual([
      expect.objectContaining({
        action: 'update_status',
        oldValues: { status: 'pending' },
        newValues: expect.objectContaining({
          status: 'confirmed',
          adminNotes: 'Confirmed in the Dashboard',
        }),
      }),
    ]);
  });

  it('finds an accepted Order by its Order Reference', async () => {
    const { orderId, orderReference } = await acceptOrder();
    const administration = createAdministrationServices();

    const result = await administration.orders.getAll({ search: orderReference });

    expect(result.total).toBe(1);
    expect(result.orders).toEqual([expect.objectContaining({ id: orderId, orderReference })]);
  });
  describe('status emails', () => {
    class FakeEmailProvider implements EmailProvider {
      sent: OutgoingEmail[] = [];
      failing = false;
      async send(email: OutgoingEmail) {
        if (this.failing) throw new Error('provider down');
        this.sent.push(email);
      }
    }

    const statusRowsFor = async (orderReference: string) =>
      (await testDb.db.select().from(outbox)).filter((row) =>
        row.id.startsWith(`order-status:${orderReference}:`),
      );

    it.each([
      ['shipped', ['confirmed', 'processing', 'shipped']],
      ['delivered', ['confirmed', 'processing', 'shipped', 'delivered']],
      ['cancelled', ['cancelled']],
    ] as const)(
      'sends exactly one %s email even when the transition is repeated',
      async (status, path) => {
        const { orderId, orderReference } = await acceptOrder();
        for (const step of path) await transitionOrderStatus(orderId, { status: step });
        await transitionOrderStatus(orderId, { status });
        await Promise.all([
          transitionOrderStatus(orderId, { status }),
          transitionOrderStatus(orderId, { status }),
        ]);

        const provider = new FakeEmailProvider();
        await createOutbox({ emailProvider: provider }).drain({ limit: 100 });

        const id = `order-status:${orderReference}:${status}`;
        const rows = await statusRowsFor(orderReference);
        expect(rows.filter((row) => row.id === id)).toHaveLength(1);
        const statusEmails = provider.sent.filter((email) => email.idempotencyKey === id);
        expect(statusEmails).toHaveLength(1);
        expect(JSON.stringify(statusEmails[0].react)).toContain(`/guest-orders/${orderReference}`);
        expect(statusEmails[0].to).toMatch(/^transition-\d+@example\.com$/);
      },
    );

    it('does not email for statuses that are not customer-facing', async () => {
      const { orderId, orderReference } = await acceptOrder();
      await transitionOrderStatus(orderId, { status: 'confirmed' });
      await transitionOrderStatus(orderId, { status: 'processing' });
      expect(await statusRowsFor(orderReference)).toHaveLength(0);
    });

    it('rolls the email back with a rejected transition', async () => {
      const { orderId, orderReference } = await acceptOrder();
      await expect(transitionOrderStatus(orderId, { status: 'delivered' })).rejects.toBeInstanceOf(
        InvalidOrderStatusTransitionError,
      );
      expect(await statusRowsFor(orderReference)).toHaveLength(0);
    });

    it('exhausts after repeated failures and a Staff retry re-queues and delivers it', async () => {
      const { orderId, orderReference } = await acceptOrder();
      await transitionOrderStatus(orderId, { status: 'cancelled' });
      const id = `order-status:${orderReference}:cancelled`;

      const provider = new FakeEmailProvider();
      provider.failing = true;
      const drainer = createOutbox({ emailProvider: provider });
      await testDb.db
        .update(outbox)
        .set({ attempts: 7, nextAttemptAt: new Date(Date.now() - 1000) })
        .where(eq(outbox.id, id));
      await drainer.drain({ limit: 100 });
      expect((await statusRowsFor(orderReference))[0].status).toBe('exhausted');

      expect(await retryOutbox(id)).toBe(true);
      expect(await retryOutbox(id)).toBe(false);
      provider.failing = false;
      await drainer.drain({ limit: 100 });

      expect((await statusRowsFor(orderReference))[0].status).toBe('delivered');
      expect(provider.sent.filter((email) => email.idempotencyKey === id)).toHaveLength(1);
    });
  });
});
