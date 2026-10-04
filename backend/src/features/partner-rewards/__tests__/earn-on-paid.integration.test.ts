import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import {
  auditLog,
  businessPartners,
  orderItems,
  orders,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
  users,
} from '@findeg/db/schema';
import { PERMISSION_CODES } from '@findeg/db';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { transitionOrderStatus } from '../../order/application/services/transition-order-status';
import {
  InvalidPaymentStatusTransitionError,
  transitionPaymentStatus,
} from '../../order/application/services/transition-payment-status';
import { createAdministrationServices } from '../../administration';
import { createPartnerRewardsServices } from '..';

describe('earn on delivered and paid', () => {
  let testDb: TestDatabase;
  let partnerId: number;
  let rateId: number;
  let sequence = 0;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: 'earn-school', nameEn: 'Earn School', nameAr: 'مدرسة' })
      .returning();
    partnerId = partner.id;
    const [rate] = await testDb.db
      .insert(rewardRates)
      .values({ businessPartnerId: partnerId, pointsPerEgp: '1.000000', egpPerPoint: '0.0100' })
      .returning();
    rateId = rate.id;
  });
  afterAll(async () => testDb.close());

  async function createOrder(status: 'processing' | 'shipped' = 'shipped') {
    sequence += 1;
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-E${String(sequence).padStart(5, '0')}`,
        totalAmount: '100.00',
        status,
      })
      .returning();
    const [item] = await testDb.db
      .insert(orderItems)
      .values({ orderId: order.id, quantity: 1, lineTotal: '100.00' })
      .returning();
    const [entitlement] = await testDb.db
      .insert(rewardEntitlements)
      .values({
        businessPartnerId: partnerId,
        orderItemId: item.id,
        rewardRateId: rateId,
        chargedLineTotalPiasters: 10_000n,
        points: 100n,
        egpValuePiasters: 100n,
      })
      .returning();
    await testDb.db.insert(rewardEvents).values({
      businessPartnerId: partnerId,
      entitlementId: entitlement.id,
      eventType: 'accepted',
      points: 100n,
      egpValuePiasters: 100n,
    });
    return { orderId: order.id, entitlementId: entitlement.id };
  }

  async function paidEvents(entitlementId: number) {
    return testDb.db
      .select()
      .from(rewardEvents)
      .where(
        and(eq(rewardEvents.entitlementId, entitlementId), eq(rewardEvents.eventType, 'paid')),
      );
  }

  it('earns once when delivered comes last', async () => {
    const { orderId, entitlementId } = await createOrder();
    await transitionPaymentStatus(orderId, 'paid');
    expect(await paidEvents(entitlementId)).toHaveLength(0);

    await transitionOrderStatus(orderId, { status: 'delivered' });
    expect(await paidEvents(entitlementId)).toHaveLength(1);
  });

  it('earns once when paid comes last, and repeats change nothing', async () => {
    const { orderId, entitlementId } = await createOrder();
    await transitionOrderStatus(orderId, { status: 'delivered' });
    expect(await paidEvents(entitlementId)).toHaveLength(0);

    expect(await transitionPaymentStatus(orderId, 'paid')).toMatchObject({ changed: true });
    expect(await transitionPaymentStatus(orderId, 'paid')).toMatchObject({ changed: false });
    expect(await transitionOrderStatus(orderId, { status: 'delivered' })).toMatchObject({
      changed: false,
    });
    expect(await paidEvents(entitlementId)).toHaveLength(1);
  });

  it('earns exactly once when delivered and paid run concurrently', async () => {
    const { orderId, entitlementId } = await createOrder();
    await Promise.all([
      transitionOrderStatus(orderId, { status: 'delivered' }),
      transitionPaymentStatus(orderId, 'paid'),
    ]);
    expect(await paidEvents(entitlementId)).toHaveLength(1);
  });

  it('never earns for a cancelled order', async () => {
    const { orderId, entitlementId } = await createOrder('processing');
    await transitionOrderStatus(orderId, { status: 'cancelled' });
    await transitionPaymentStatus(orderId, 'paid');
    expect(await paidEvents(entitlementId)).toHaveLength(0);
  });

  it('never earns for a refunded payment', async () => {
    const { orderId, entitlementId } = await createOrder();
    await transitionPaymentStatus(orderId, 'paid');
    await transitionPaymentStatus(orderId, 'refunded');
    await transitionOrderStatus(orderId, { status: 'delivered' });
    expect(await paidEvents(entitlementId)).toHaveLength(0);
  });

  it('allows only paid to refunded out of paid', async () => {
    const { orderId } = await createOrder();
    await transitionPaymentStatus(orderId, 'paid');
    await expect(transitionPaymentStatus(orderId, 'unpaid')).rejects.toBeInstanceOf(
      InvalidPaymentStatusTransitionError,
    );
  });

  async function paymentAuditRows(orderId: number) {
    return testDb.db
      .select()
      .from(auditLog)
      .where(
        and(eq(auditLog.entityId, String(orderId)), eq(auditLog.action, 'update_payment_status')),
      );
  }

  it('commits the payment change and its audit row together', async () => {
    const { orderId } = await createOrder();
    await transitionPaymentStatus(orderId, 'paid');
    await transitionPaymentStatus(orderId, 'paid');
    const logs = await paymentAuditRows(orderId);
    expect(logs).toHaveLength(1);
    expect(logs[0].newValues).toEqual({ paymentStatus: 'paid' });
  });

  it('rolls back the payment change and earn when the audit row fails', async () => {
    const { orderId, entitlementId } = await createOrder();
    await transitionOrderStatus(orderId, { status: 'delivered' });

    // No such user, so the audit row's admin_user_id foreign key rejects the insert.
    await expect(
      transitionPaymentStatus(orderId, 'paid', { userId: 2_147_483_647 }),
    ).rejects.toThrow();

    const [order] = await testDb.db
      .select({ paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.id, orderId));
    expect(order.paymentStatus).toBe('unpaid');
    expect(await paymentAuditRows(orderId)).toHaveLength(0);
    expect(await paidEvents(entitlementId)).toHaveLength(0);
  });

  it('records the dashboard admin on the payment audit row', async () => {
    const [admin] = await testDb.db
      .insert(users)
      .values({ email: 'payment-admin@example.com', portalRole: 'staff' })
      .returning();
    const { orderId } = await createOrder();
    await createAdministrationServices().orders.updatePaymentStatus(
      { kind: 'staff', userId: admin.id, permissionCodes: [PERMISSION_CODES.ADMIN_ORDERS_WRITE] },
      orderId,
      'paid',
    );
    const logs = await paymentAuditRows(orderId);
    expect(logs).toHaveLength(1);
    expect(logs[0].adminUserId).toBe(admin.id);
  });

  it('reports earned points to Staff', async () => {
    const services = createPartnerRewardsServices({ db: testDb.db });
    const staff = { userId: 1, activeRoleIds: ['system_admin'] };
    const before = await services.rates.getEarned(staff, partnerId);
    const { orderId } = await createOrder();
    await transitionPaymentStatus(orderId, 'paid');
    await transitionOrderStatus(orderId, { status: 'delivered' });
    const after = await services.rates.getEarned(staff, partnerId);
    if (!before.success || !after.success) throw new Error('expected success');
    expect(after.data.points - before.data.points).toBe(100n);
    expect(after.data.egpValuePiasters - before.data.egpValuePiasters).toBe(100n);
  });
});
