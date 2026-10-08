import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { orderItems, orders, users } from '@findeg/db/schema';
import { PERMISSION_CODES } from '@findeg/db';
import { createAdministrationServices, type OrderStaffActor } from '..';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

describe('Dashboard Order detail query', () => {
  let testDb: TestDatabase;
  let staff: OrderStaffActor;
  const { orders: adminOrders } = createAdministrationServices();

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    const [user] = await testDb.db
      .insert(users)
      .values({ email: 'detail-staff@example.com', firstName: 'Mona', lastName: 'Saleh' })
      .returning();
    staff = {
      kind: 'staff',
      userId: user.id,
      permissionCodes: [PERMISSION_CODES.ADMIN_ORDERS_WRITE],
      activeRoleIds: [],
    };
  });
  afterAll(async () => testDb.close());

  async function seedOrder() {
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: 'FE-DT0001',
        guestEmail: 'buyer@example.com',
        subtotal: '90.00',
        shippingCost: '10.00',
        totalAmount: '100.00',
        paymentMethod: 'cod',
        shippingAddressSnapshot: {
          fullName: 'Ahmed Hassan',
          phone: '01012345678',
          city: 'Cairo',
          area: 'Nasr City',
          street: 'Abbas El Akkad',
        },
      })
      .returning();
    await testDb.db.insert(orderItems).values({
      orderId: order.id,
      quantity: 2,
      unitPriceSnapshot: '45.00',
      lineTotal: '90.00',
      productNameSnapshot: 'Notebook',
    });
    return order.id;
  }

  it('returns the Order with items, totals, customer, payment and its activity', async () => {
    const id = await seedOrder();
    await adminOrders.updatePaymentStatus(staff, id, 'paid');

    const detail = await adminOrders.getDetail(id);

    expect(detail?.order).toMatchObject({
      id,
      orderReference: 'FE-DT0001',
      status: 'pending',
      paymentStatus: 'paid',
      subtotal: 90,
      shippingCost: 10,
      totalAmount: 100,
      customerName: 'Ahmed Hassan',
    });
    expect(detail?.order.items).toHaveLength(1);
    expect(detail?.activity).toEqual([
      expect.objectContaining({
        action: 'update_payment_status',
        adminId: staff.userId,
        adminName: 'Mona Saleh',
        oldValue: 'unpaid',
        newValue: 'paid',
      }),
    ]);
  });

  it('returns null for an Order that does not exist', async () => {
    expect(await adminOrders.getDetail(2_000_000_000)).toBeNull();
  });
});
