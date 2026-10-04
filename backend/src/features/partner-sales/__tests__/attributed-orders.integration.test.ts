import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createPartnerSalesServices,
  type PartnerSalesServices,
  type PartnerSalesStaffActor,
} from '..';
import { partnerSalesFixtures } from './fixtures';

describe('Attributed Order reads', () => {
  let testDb: TestDatabase;
  let services: PartnerSalesServices;
  let fixtures: ReturnType<typeof partnerSalesFixtures>;
  let staff: PartnerSalesStaffActor;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerSalesServices({ db: testDb.db });
    fixtures = partnerSalesFixtures(testDb, 'attributed');
    staff = {
      userId: await fixtures.staffUser(),
      permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW],
    };
  });
  afterAll(async () => testDb.close());

  async function partnerWithItem() {
    const partnerId = await fixtures.createPartner();
    const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Notebook');
    return { partnerId, item };
  }

  async function read(
    partnerId: number,
    filter: Parameters<PartnerSalesServices['attributedOrders']['getAttributedOrders']>[2],
    actor: PartnerSalesStaffActor = staff,
  ) {
    const result = await services.attributedOrders.getAttributedOrders(actor, partnerId, filter);
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  it('returns each Attributed Order with gross, discount and charged totals', async () => {
    const { partnerId, item } = await partnerWithItem();
    const first = await fixtures.seedOrder({
      item,
      at: '2026-03-10T10:00:00Z',
      quantity: 2,
      unitPrice: '25.00',
      discount: '5.00',
    });
    const second = await fixtures.seedOrder({
      item,
      at: '2026-03-11T10:00:00Z',
      unitPrice: '10.05',
    });

    const data = await read(partnerId, { from: '2026-03-01', to: '2026-03-31' });

    expect(data.orders).toEqual([
      expect.objectContaining({
        id: first.id,
        orderReference: first.orderReference,
        status: 'pending',
        paymentStatus: 'unpaid',
        acceptedAt: new Date('2026-03-10T10:00:00Z'),
        schoolSupplyListId: item.listId,
        grossPiasters: 5_000n,
        discountPiasters: 500n,
        chargedPiasters: 4_500n,
      }),
      expect.objectContaining({
        id: second.id,
        grossPiasters: 1_005n,
        discountPiasters: 0n,
        chargedPiasters: 1_005n,
      }),
    ]);
    expect(data.totals).toEqual({
      orderCount: 2,
      grossPiasters: 6_005n,
      discountPiasters: 500n,
      chargedPiasters: 5_505n,
    });
  });

  it('carries no Customer data', async () => {
    const { partnerId, item } = await partnerWithItem();
    await fixtures.seedOrder({ item, at: '2026-03-10T10:00:00Z' });
    const data = await read(partnerId, { from: '2026-03-01', to: '2026-03-31' });
    expect(Object.keys(data.orders[0])).not.toEqual(
      expect.arrayContaining(['guestEmail', 'userId', 'shippingAddressSnapshot']),
    );
    expect(JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? `${v}` : v))).not.toMatch(
      /customer@example\.com/,
    );
  });

  describe('Cairo-time date boundaries', () => {
    it('places orders by Cairo date in winter (UTC+2)', async () => {
      const { partnerId, item } = await partnerWithItem();
      // 2026-01-31 23:30 Cairo
      const lastJan = await fixtures.seedOrder({ item, at: '2026-01-31T21:30:00Z' });
      // 2026-02-01 00:30 Cairo, still 31 January in UTC
      const firstFeb = await fixtures.seedOrder({ item, at: '2026-01-31T22:30:00Z' });

      const january = await read(partnerId, { from: '2026-01-01', to: '2026-01-31' });
      const february = await read(partnerId, { from: '2026-02-01', to: '2026-02-28' });
      expect(january.orders.map((o) => o.id)).toEqual([lastJan.id]);
      expect(february.orders.map((o) => o.id)).toEqual([firstFeb.id]);
    });

    it('places orders by Cairo date in summer time (UTC+3)', async () => {
      const { partnerId, item } = await partnerWithItem();
      // 2026-07-31 23:30 Cairo
      const lastJul = await fixtures.seedOrder({ item, at: '2026-07-31T20:30:00Z' });
      // 2026-08-01 00:30 Cairo: UTC+2 arithmetic would put it in July
      const firstAug = await fixtures.seedOrder({ item, at: '2026-07-31T21:30:00Z' });

      const july = await read(partnerId, { from: '2026-07-01', to: '2026-07-31' });
      const august = await read(partnerId, { from: '2026-08-01', to: '2026-08-31' });
      expect(july.orders.map((o) => o.id)).toEqual([lastJul.id]);
      expect(august.orders.map((o) => o.id)).toEqual([firstAug.id]);
    });

    it('starts the day correctly when summer time skips local midnight', async () => {
      const { partnerId, item } = await partnerWithItem();
      // 2026-04-23 23:59 Cairo (UTC+2); clocks then jump from 00:00 to 01:00 on 24 April.
      const before = await fixtures.seedOrder({ item, at: '2026-04-23T21:59:00Z' });
      // 2026-04-24 01:00 Cairo (UTC+3), the first instant of 24 April.
      const after = await fixtures.seedOrder({ item, at: '2026-04-23T22:00:00Z' });

      const day = async (date: string) =>
        (await read(partnerId, { from: date, to: date })).orders.map((o) => o.id);
      expect(await day('2026-04-23')).toEqual([before.id]);
      expect(await day('2026-04-24')).toEqual([after.id]);
    });

    it('keeps the repeated hour in its day when summer time ends', async () => {
      const { partnerId, item } = await partnerWithItem();
      // 23:30 on 29 October happens twice in Cairo: first at UTC+3, then at UTC+2.
      const firstPass = await fixtures.seedOrder({ item, at: '2026-10-29T20:30:00Z' });
      const secondPass = await fixtures.seedOrder({ item, at: '2026-10-29T21:30:00Z' });
      // 2026-10-30 00:00 Cairo (UTC+2).
      const nextDay = await fixtures.seedOrder({ item, at: '2026-10-29T22:00:00Z' });

      const day = async (date: string) =>
        (await read(partnerId, { from: date, to: date })).orders.map((o) => o.id);
      expect(await day('2026-10-29')).toEqual([firstPass.id, secondPass.id]);
      expect(await day('2026-10-30')).toEqual([nextDay.id]);
    });

    it('includes both ends of the range, a single day included', async () => {
      const { partnerId, item } = await partnerWithItem();
      // 2026-05-10 00:00 and 23:59 Cairo (UTC+3)
      const start = await fixtures.seedOrder({ item, at: '2026-05-09T21:00:00Z' });
      const end = await fixtures.seedOrder({ item, at: '2026-05-10T20:59:59Z' });
      await fixtures.seedOrder({ item, at: '2026-05-10T21:00:00Z' });

      const day = await read(partnerId, { from: '2026-05-10', to: '2026-05-10' });
      expect(day.orders.map((o) => o.id)).toEqual([start.id, end.id]);
    });
  });

  describe('status filters', () => {
    it('filters by order status and by payment status, together or apart', async () => {
      const { partnerId, item } = await partnerWithItem();
      const at = '2026-04-10T10:00:00Z';
      const pending = await fixtures.seedOrder({ item, at });
      const deliveredPaid = await fixtures.seedOrder({
        item,
        at,
        status: 'delivered',
        paymentStatus: 'paid',
      });
      const deliveredUnpaid = await fixtures.seedOrder({ item, at, status: 'delivered' });
      const cancelled = await fixtures.seedOrder({ item, at, status: 'cancelled' });
      const period = { from: '2026-04-01', to: '2026-04-30' };
      const ids = async (filter: object) =>
        (await read(partnerId, { ...period, ...filter })).orders.map((o) => o.id);

      expect(await ids({})).toEqual([
        pending.id,
        deliveredPaid.id,
        deliveredUnpaid.id,
        cancelled.id,
      ]);
      expect(await ids({ orderStatuses: ['delivered'] })).toEqual([
        deliveredPaid.id,
        deliveredUnpaid.id,
      ]);
      expect(await ids({ paymentStatuses: ['paid'] })).toEqual([deliveredPaid.id]);
      expect(await ids({ orderStatuses: ['delivered'], paymentStatuses: ['unpaid'] })).toEqual([
        deliveredUnpaid.id,
      ]);
      expect(await ids({ orderStatuses: ['pending', 'cancelled'] })).toEqual([
        pending.id,
        cancelled.id,
      ]);

      const filtered = await read(partnerId, { ...period, orderStatuses: ['delivered'] });
      expect(filtered.totals.orderCount).toBe(2);
      expect(filtered.totals.chargedPiasters).toBe(5_000n);
    });
  });

  it('never returns another Business Partner’s orders', async () => {
    const mine = await partnerWithItem();
    const other = await partnerWithItem();
    const myOrder = await fixtures.seedOrder({ item: mine.item, at: '2026-06-10T10:00:00Z' });
    await fixtures.seedOrder({ item: other.item, at: '2026-06-10T10:00:00Z' });

    const data = await read(mine.partnerId, { from: '2026-06-01', to: '2026-06-30' });
    expect(data.orders.map((o) => o.id)).toEqual([myOrder.id]);
    expect(data.totals.orderCount).toBe(1);
  });

  it('excludes Cart orders', async () => {
    const { partnerId, item } = await partnerWithItem();
    const listOrder = await fixtures.seedOrder({ item, at: '2026-09-10T10:00:00Z' });
    await fixtures.seedCartOrder('2026-09-10T10:00:00Z');

    const data = await read(partnerId, { from: '2026-09-01', to: '2026-09-30' });
    expect(data.orders.map((o) => o.id)).toEqual([listOrder.id]);
  });

  it('returns zero totals for a period with no orders', async () => {
    const { partnerId } = await partnerWithItem();
    expect(await read(partnerId, { from: '2026-01-01', to: '2026-12-31' })).toEqual({
      orders: [],
      totals: { orderCount: 0, grossPiasters: 0n, discountPiasters: 0n, chargedPiasters: 0n },
    });
  });

  describe('validation and access', () => {
    it.each([
      [{ from: '2026-03-31', to: '2026-03-01' }],
      [{ from: '2026-3-1', to: '2026-03-31' }],
      [{ from: '2026-02-30', to: '2026-03-31' }],
      [{ from: '2026-03-01', to: '2026-03-31', orderStatuses: [] }],
      [{ from: '2026-03-01', to: '2026-03-31', orderStatuses: ['lost'] }],
      [{ from: '2026-03-01', to: '2026-03-31', paymentStatuses: ['partial'] }],
    ])('rejects %j', async (filter) => {
      const { partnerId } = await partnerWithItem();
      const result = await services.attributedOrders.getAttributedOrders(
        staff,
        partnerId,
        filter as never,
      );
      expect(result).toEqual({ success: false, error: 'invalid-input' });
    });

    it('requires the Partner Reports permission or system_admin', async () => {
      const { partnerId } = await partnerWithItem();
      const period = { from: '2026-03-01', to: '2026-03-31' };
      const get = (actor: PartnerSalesStaffActor) =>
        services.attributedOrders.getAttributedOrders(actor, partnerId, period);

      expect(await get({ userId: staff.userId, permissionCodes: ['partners.manage'] })).toEqual({
        success: false,
        error: 'forbidden',
      });
      expect((await get({ userId: staff.userId, activeRoleIds: ['system_admin'] })).success).toBe(
        true,
      );
    });

    it('returns not-found for an unknown Business Partner', async () => {
      const result = await services.attributedOrders.getAttributedOrders(staff, 999_999_999, {
        from: '2026-03-01',
        to: '2026-03-31',
      });
      expect(result).toEqual({ success: false, error: 'not-found' });
    });
  });
});
