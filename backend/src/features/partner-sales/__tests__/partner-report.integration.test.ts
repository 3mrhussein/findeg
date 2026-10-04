import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createPartnerSalesServices,
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
  type PartnerSalesServices,
  type PartnerSalesStaffActor,
} from '..';
import { partnerSalesFixtures } from './fixtures';

const NOW = new Date('2026-05-15T10:00:00.000Z');
const IN_MAY = '2026-05-05T10:00:00Z';

const serialize = (value: unknown) =>
  JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));

describe('Partner Reports sales view', () => {
  let testDb: TestDatabase;
  let services: PartnerSalesServices;
  let fixtures: ReturnType<typeof partnerSalesFixtures>;
  let staff: PartnerSalesStaffActor;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerSalesServices({ db: testDb.db, now: () => NOW });
    fixtures = partnerSalesFixtures(testDb, 'report');
    staff = {
      userId: await fixtures.staffUser(),
      permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW],
    };
  });
  afterAll(async () => testDb.close());

  async function report(userId: number, partnerId: number, month?: string) {
    return services.partnerReports.getPartnerReport({ userId }, partnerId, { month });
  }

  async function reportData(userId: number, partnerId: number, month?: string) {
    const result = await report(userId, partnerId, month);
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  async function seedOrders(
    item: Parameters<typeof fixtures.seedOrder>[0]['item'],
    count: number,
    input: Omit<Parameters<typeof fixtures.seedOrder>[0], 'item' | 'at'> & { at?: string } = {},
  ) {
    for (let i = 0; i < count; i += 1) await fixtures.seedOrder({ at: IN_MAY, ...input, item });
  }

  it('groups a month’s sales by list item × variant with units and charged amount', async () => {
    const partnerId = await fixtures.createPartner();
    const member = await fixtures.createMember(partnerId, ['report-viewer']);
    const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Notebook');
    await seedOrders(item, 2, { quantity: 2, unitPrice: '10.00', discount: '2.00' });
    await seedOrders(item, 1, { quantity: 1, unitPrice: '10.00' });

    const view = await reportData(member, partnerId);
    expect(view.month).toBe('2026-05');
    expect(view.sales).toEqual([
      {
        listName: 'Grade 1 list',
        listItemLabel: 'Notebook',
        productName: 'Notebook',
        variantLabel: 'Blue',
        quantity: 5,
        chargedPiasters: 4_600n,
      },
    ]);
    expect(view.otherItems).toBeNull();
  });

  it('counts neither cancelled nor refunded Orders', async () => {
    const partnerId = await fixtures.createPartner();
    const member = await fixtures.createMember(partnerId, ['report-viewer']);
    const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Notebook');
    await seedOrders(item, 3, { status: 'delivered', paymentStatus: 'paid' });
    await seedOrders(item, 1, { status: 'cancelled' });
    await seedOrders(item, 1, { status: 'refunded', paymentStatus: 'refunded' });
    await seedOrders(item, 1, { status: 'delivered', paymentStatus: 'refunded' });

    const view = await reportData(member, partnerId);
    expect(view.sales.map((row) => row.quantity)).toEqual([3]);
    expect(view.otherItems).toBeNull();
  });

  it('places Orders in their Cairo-time month', async () => {
    const partnerId = await fixtures.createPartner();
    const member = await fixtures.createMember(partnerId, ['report-viewer']);
    const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Notebook');
    // 2026-05-01 00:30 Cairo (UTC+3), still April in UTC.
    await seedOrders(item, 3, { at: '2026-04-30T21:30:00Z' });
    // 2026-04-30 23:30 Cairo.
    await seedOrders(item, 1, { at: '2026-04-30T20:30:00Z' });

    const may = await reportData(member, partnerId, '2026-05');
    const april = await reportData(member, partnerId, '2026-04');
    expect(may.sales.map((row) => row.quantity)).toEqual([3]);
    expect(april.sales).toEqual([]);
    expect(april.otherItems).toEqual({ quantity: 1, chargedPiasters: 2_500n });
    expect(may.months).toEqual(['2026-04', '2026-05']);
  });

  describe('suppression', () => {
    it('rolls rows under the Order threshold into Other items so totals still add up', async () => {
      const partnerId = await fixtures.createPartner();
      const member = await fixtures.createMember(partnerId, ['report-viewer']);
      const listing = await fixtures.createListing(partnerId);
      const popular = await fixtures.addListItem(listing, 'Popular');
      const rareA = await fixtures.addListItem(listing, 'RareA');
      const rareB = await fixtures.addListItem(listing, 'RareB');
      await seedOrders(popular, MIN_DISTINCT_ORDERS_PER_SALES_ROW);
      await seedOrders(rareA, 2, { quantity: 3 });
      await seedOrders(rareB, 1);

      const view = await reportData(member, partnerId);
      expect(view.sales.map((row) => row.productName)).toEqual(['Popular']);
      expect(view.otherItems).toEqual({ quantity: 7, chargedPiasters: 17_500n });

      const staffView = await services.partnerReports.getStaffReport(staff, partnerId);
      if (!staffView.success) throw new Error(staffView.error);
      const total = (rows: readonly { chargedPiasters: bigint }[]) =>
        rows.reduce((sum, row) => sum + row.chargedPiasters, 0n);
      expect(total(view.sales) + view.otherItems!.chargedPiasters).toBe(
        total(staffView.data.sales),
      );
    });

    it('counts distinct Orders, not lines or units', async () => {
      const partnerId = await fixtures.createPartner();
      const member = await fixtures.createMember(partnerId, ['report-viewer']);
      const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Bulk');
      await seedOrders(item, MIN_DISTINCT_ORDERS_PER_SALES_ROW - 1, { quantity: 50 });

      const view = await reportData(member, partnerId);
      expect(view.sales).toEqual([]);
      expect(view.otherItems).toEqual({ quantity: 100, chargedPiasters: 250_000n });
    });

    it('shows the Staff projection every row with its Order count', async () => {
      const partnerId = await fixtures.createPartner();
      const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Solo');
      await seedOrders(item, 1);

      const result = await services.partnerReports.getStaffReport(staff, partnerId);
      if (!result.success) throw new Error(result.error);
      expect(result.data.sales).toEqual([
        expect.objectContaining({
          listId: item.listId,
          listItemId: item.listItemId,
          variantId: item.variantId,
          productName: 'Solo',
          quantity: 1,
          orderCount: 1,
        }),
      ]);
    });
  });

  describe('isolation', () => {
    it('never shows another Business Partner’s sales', async () => {
      const mine = await fixtures.createPartner();
      const other = await fixtures.createPartner();
      const member = await fixtures.createMember(mine, ['report-viewer']);
      const myItem = await fixtures.addListItem(await fixtures.createListing(mine), 'Mine');
      const otherItem = await fixtures.addListItem(await fixtures.createListing(other), 'Theirs');
      await seedOrders(myItem, 3);
      await seedOrders(otherItem, 3, { quantity: 9 });
      await fixtures.seedCartOrder(IN_MAY);

      const view = await reportData(member, mine);
      expect(view.sales.map((row) => [row.productName, row.quantity])).toEqual([['Mine', 3]]);
      expect(view.otherItems).toBeNull();
      expect(serialize(view)).not.toMatch(/Theirs/);
    });

    it('carries no Order Reference, Customer data, Order count or ids', async () => {
      const partnerId = await fixtures.createPartner();
      const member = await fixtures.createMember(partnerId, ['partner-administrator']);
      const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Notebook');
      await seedOrders(item, 3);
      await seedOrders(await fixtures.addListItem(await fixtures.createListing(partnerId), 'X'), 1);

      const json = serialize(await reportData(member, partnerId));
      expect(json).not.toMatch(
        /FE-R\d{5}|customer@example\.com|orderReference|orderCount|listId|variantId|guest/,
      );
    });
  });

  describe('access', () => {
    it.each([
      [['partner-administrator'], 'active', true],
      [['report-viewer'], 'active', true],
      [['list-manager'], 'active', false],
      [['collection-staff'], 'active', false],
      [['list-manager', 'report-viewer'], 'active', true],
      [['report-viewer'], 'suspended', false],
      [['partner-administrator'], 'ended', false],
    ] as const)('roles %j, membership %s → allowed %s', async (roles, membership, allowed) => {
      const partnerId = await fixtures.createPartner();
      const member = await fixtures.createMember(partnerId, [...roles], membership);
      const result = await report(member, partnerId);
      expect(result.success).toBe(allowed);
      if (!result.success) expect(result.error).toBe('forbidden');
    });

    it('refuses a user with no membership and a member of another partner', async () => {
      const partnerId = await fixtures.createPartner();
      const other = await fixtures.createPartner();
      const outsider = await fixtures.createMember(other, ['partner-administrator']);
      expect(await report(outsider, partnerId)).toEqual({ success: false, error: 'forbidden' });
      expect(await report(999_999_999, partnerId)).toEqual({ success: false, error: 'forbidden' });
    });

    it.each(['onboarding', 'active', 'suspended', 'closed'] as const)(
      'reads while the Business Partner is %s',
      async (status) => {
        const partnerId = await fixtures.createPartner(status);
        const member = await fixtures.createMember(partnerId, ['report-viewer']);
        expect((await report(member, partnerId)).success).toBe(true);
      },
    );

    it('gives Staff the report with partner-reports.view or system_admin only', async () => {
      const partnerId = await fixtures.createPartner();
      const get = (actor: PartnerSalesStaffActor) =>
        services.partnerReports.getStaffReport(actor, partnerId);
      expect(await get({ userId: staff.userId, permissionCodes: ['partners.manage'] })).toEqual({
        success: false,
        error: 'forbidden',
      });
      expect((await get(staff)).success).toBe(true);
      expect((await get({ userId: staff.userId, activeRoleIds: ['system_admin'] })).success).toBe(
        true,
      );
      expect(await services.partnerReports.getStaffReport(staff, 999_999_999)).toEqual({
        success: false,
        error: 'not-found',
      });
    });
  });

  it('shows an empty state before the first Attributed Order', async () => {
    const partnerId = await fixtures.createPartner();
    const member = await fixtures.createMember(partnerId, ['report-viewer']);
    expect(await reportData(member, partnerId)).toEqual({
      asOf: NOW,
      months: [],
      month: '2026-05',
      sales: [],
      otherItems: null,
    });
  });

  it('rejects a month outside the picker or malformed', async () => {
    const partnerId = await fixtures.createPartner();
    const member = await fixtures.createMember(partnerId, ['report-viewer']);
    const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Notebook');
    await seedOrders(item, 1);
    const invalid = { success: false, error: 'invalid-input' };
    expect(await report(member, partnerId, '2020-01')).toEqual(invalid);
    expect(await report(member, partnerId, '2026-06')).toEqual(invalid);
    expect(await report(member, partnerId, 'May')).toEqual(invalid);
  });

  describe('names', () => {
    it('uses live names in the viewer’s locale', async () => {
      const partnerId = await fixtures.createPartner();
      const member = await fixtures.createMember(partnerId, ['report-viewer']);
      const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Live');
      await seedOrders(item, 3);
      const read = async (locale: 'en' | 'ar') => {
        const result = await services.partnerReports.getPartnerReport(
          { userId: member },
          partnerId,
          { locale },
        );
        if (!result.success) throw new Error(result.error);
        return result.data.sales[0];
      };
      expect(await read('en')).toMatchObject({
        listName: 'Grade 1 list',
        listItemLabel: 'Notebook',
        productName: 'Live',
        variantLabel: 'Blue',
      });
      expect(await read('ar')).toMatchObject({
        listName: 'قائمة الصف الأول',
        listItemLabel: 'كشكول',
        productName: 'Live ع',
        variantLabel: 'أزرق',
      });
    });

    it('falls back to the variant label checkout snapshotted when the variant is gone', async () => {
      const partnerId = await fixtures.createPartner();
      const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Gone');
      // Deleting a variant nulls its order lines' variant_id: the snapshot is all that remains.
      await seedOrders(item, 3, { variantId: null });

      const read = async (locale: 'en' | 'ar') => {
        const result = await services.partnerReports.getStaffReport(staff, partnerId, { locale });
        if (!result.success) throw new Error(result.error);
        return result.data.sales[0];
      };
      expect((await read('en')).variantLabel).toBe('Snapshot blue');
      expect((await read('ar')).variantLabel).toBe('أزرق محفوظ');
    });

    it('keeps two deleted variants of one list item apart by their snapshots', async () => {
      const partnerId = await fixtures.createPartner();
      const item = await fixtures.addListItem(await fixtures.createListing(partnerId), 'Pen');
      await seedOrders(item, 3, { variantId: null, variantSnapshot: { en: 'Red' } });
      await seedOrders(item, 3, { variantId: null, variantSnapshot: { en: 'Green' } });

      const result = await services.partnerReports.getStaffReport(staff, partnerId);
      if (!result.success) throw new Error(result.error);
      expect(result.data.sales.map((row) => [row.variantLabel, row.orderCount]).sort()).toEqual([
        ['Green', 3],
        ['Red', 3],
      ]);
    });
  });
});
