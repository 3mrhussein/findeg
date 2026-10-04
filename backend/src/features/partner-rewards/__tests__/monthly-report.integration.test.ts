import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  businessPartners,
  categories,
  orderItems,
  orders,
  productVariants,
  products,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
  rewardSettlements,
  schoolSupplyListItems,
  schoolSupplyLists,
  users,
  type RewardEventType,
} from '@findeg/db/schema';
import { transitionOrderStatus } from '../../order/application/services/transition-order-status';
import { transitionPaymentStatus } from '../../order/application/services/transition-payment-status';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createPartnerRewardsServices,
  type PartnerRewardsServices,
  type RewardsStaffActor,
} from '..';

const NOW = new Date('2026-05-15T10:00:00.000Z');

describe('monthly Reward Statement and Staff report projection', () => {
  let testDb: TestDatabase;
  let services: PartnerRewardsServices;
  let sequence = 0;
  let staffUserId: number;
  let viewer: RewardsStaffActor;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerRewardsServices({ db: testDb.db, now: () => NOW });
    const [staff] = await testDb.db
      .insert(users)
      .values({ email: 'reward-report-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staffUserId = staff.id;
    viewer = { userId: staff.id, permissionCodes: ['rewards.view'] };
  });
  afterAll(async () => testDb.close());

  async function createPartner() {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: `report-school-${sequence}`, nameEn: 'Report School', nameAr: 'مدرسة' })
      .returning();
    const [rate] = await testDb.db
      .insert(rewardRates)
      .values({ businessPartnerId: partner.id, pointsPerEgp: '1.000000', egpPerPoint: '0.0100' })
      .returning();
    return { partnerId: partner.id, rateId: rate.id };
  }

  interface SeedEvent {
    readonly type: RewardEventType;
    readonly at: string;
  }

  /** One Order whose single line has an entitlement and events recorded at exact instants. */
  async function seedEntitlement(
    partner: { partnerId: number; rateId: number },
    input: {
      points: bigint;
      egpPiasters: bigint;
      events: readonly SeedEvent[];
      /** Order to add the line to; defaults to a fresh Order. */
      orderId?: number;
      /** Attributes the line to a School Supply List item and variant. */
      listing?: Listing;
    },
  ) {
    const orderId = input.orderId ?? (await seedOrder(partner, input.listing)).orderId;
    const { listing } = input;
    const [item] = await testDb.db
      .insert(orderItems)
      .values({
        orderId,
        quantity: 1,
        lineTotal: '100.00',
        productId: listing?.productId ?? null,
        variantId: listing?.variantId ?? null,
        schoolSupplyListItemId: listing?.listItemId ?? null,
        isSubstitute: listing ? false : null,
        productNameSnapshot: listing ? `Snapshot ${listing.productId}` : null,
        variantSnapshot: listing ? { label: `Snapshot variant ${listing.variantId}` } : null,
      })
      .returning();
    const [entitlement] = await testDb.db
      .insert(rewardEntitlements)
      .values({
        businessPartnerId: partner.partnerId,
        orderItemId: item.id,
        rewardRateId: partner.rateId,
        chargedLineTotalPiasters: 10_000n,
        points: input.points,
        egpValuePiasters: input.egpPiasters,
      })
      .returning();
    await testDb.db.insert(rewardEvents).values(
      input.events.map((event) => ({
        businessPartnerId: partner.partnerId,
        entitlementId: entitlement.id,
        eventType: event.type,
        points: input.points,
        egpValuePiasters: input.egpPiasters,
        createdAt: new Date(event.at),
      })),
    );
    return { orderId, orderItemId: item.id, entitlementId: entitlement.id };
  }

  async function seedOrder(partner: { partnerId: number }, listing?: Listing) {
    sequence += 1;
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-M${String(sequence).padStart(5, '0')}`,
        totalAmount: '100.00',
        ...(listing
          ? {
              schoolSupplyListId: listing.listId,
              schoolSupplyListPublicCode: 'a'.repeat(32),
              schoolSupplyListPublishedAt: new Date('2026-01-01T00:00:00Z'),
              businessPartnerId: partner.partnerId,
            }
          : {}),
      })
      .returning();
    return { orderId: order.id, orderReference: order.orderReference };
  }

  interface Listing {
    readonly listId: number;
    readonly listItemId: number;
    readonly variantId: number;
    readonly productId: number;
  }

  /** A School Supply List with one item, backed by a real product and variant. */
  async function createListing(
    partnerId: number,
    names: { list?: string; item?: string; product?: string; variant?: string } = {},
  ) {
    sequence += 1;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `report-cat-${sequence}` })
      .returning();
    const [list] = await testDb.db
      .insert(schoolSupplyLists)
      .values({
        businessPartnerId: partnerId,
        grade: 'Grade 1',
        academicYear: '2026/2027',
        localizedTitle: { en: names.list ?? 'Grade 1 list', ar: 'قائمة الصف الأول' },
      })
      .returning();
    const listing = await addListItem(list.id, category.id, names);
    return { categoryId: category.id, ...listing };
  }

  async function addListItem(
    listId: number,
    categoryId: number,
    names: { item?: string; product?: string; variant?: string } = {},
  ): Promise<Listing> {
    sequence += 1;
    const [product] = await testDb.db
      .insert(products)
      .values({
        localizedName: { en: names.product ?? `Notebook ${sequence}`, ar: `كشكول ${sequence}` },
        localizedDescription: { en: 'd' },
        localizedLongDescription: { en: 'd' },
        categoryId,
      })
      .returning();
    const [variant] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `REPORT-SKU-${sequence}`,
        basePrice: '25.00',
        localizedLabel: { en: names.variant ?? 'Blue', ar: 'أزرق' },
      })
      .returning();
    const [item] = await testDb.db
      .insert(schoolSupplyListItems)
      .values({
        listId,
        variantId: variant.id,
        localizedLabel: { en: names.item ?? 'Notebook', ar: 'كشكول' },
        productNameEnSnapshot: 'x',
      })
      .returning();
    return { listId, listItemId: item.id, variantId: variant.id, productId: product.id };
  }

  async function seedAdjustment(
    partnerId: number,
    egpPiasters: bigint,
    at: string,
    reason = 'fix',
  ) {
    sequence += 1;
    await testDb.db.insert(rewardEvents).values({
      businessPartnerId: partnerId,
      eventType: 'adjustment',
      points: 0n,
      egpValuePiasters: egpPiasters,
      reason,
      idempotencyKey: `adj-${sequence}`,
      actorUserId: staffUserId,
      createdAt: new Date(at),
    });
  }

  async function seedSettlement(
    partnerId: number,
    input: { amountPiasters: bigint; at: string; paidAt: string; notes?: string },
  ) {
    sequence += 1;
    const [row] = await testDb.db
      .insert(rewardSettlements)
      .values({
        businessPartnerId: partnerId,
        kind: 'settlement',
        amountPiasters: input.amountPiasters,
        transferReference: `TRX-${sequence}`,
        paidAt: input.paidAt,
        notes: input.notes ?? null,
        idempotencyKey: `settle-${sequence}`,
        actorUserId: staffUserId,
        createdAt: new Date(input.at),
      })
      .returning();
    return row;
  }

  async function seedVoid(partnerId: number, settlementId: number, amount: bigint, at: string) {
    await testDb.db.insert(rewardSettlements).values({
      businessPartnerId: partnerId,
      kind: 'void',
      amountPiasters: -amount,
      voidsSettlementId: settlementId,
      reason: 'wrong school',
      actorUserId: staffUserId,
      createdAt: new Date(at),
    });
  }

  async function seedDebtForgiveness(partnerId: number, amount: bigint, at: string) {
    sequence += 1;
    await testDb.db.insert(rewardSettlements).values({
      businessPartnerId: partnerId,
      kind: 'debt-forgiveness',
      amountPiasters: amount,
      reason: 'uncollectable',
      idempotencyKey: `forgive-${sequence}`,
      actorUserId: staffUserId,
      createdAt: new Date(at),
    });
  }

  async function report(partnerId: number, options?: { month?: string; locale?: 'en' | 'ar' }) {
    const result = await services.statement.getStaffReport(viewer, partnerId, options);
    if (!result.success) throw new Error(`expected success, got ${result.error}`);
    return result.data;
  }

  const earnedInFebruary = (partner: { partnerId: number; rateId: number }, listing: Listing) =>
    seedEntitlement(partner, {
      points: 40n,
      egpPiasters: 4_000n,
      listing,
      events: [
        { type: 'accepted', at: '2026-02-01T10:00:00Z' },
        { type: 'paid', at: '2026-02-10T10:00:00Z' },
      ],
    });

  /** A partner with a ledger spanning Jan–May 2026 across Cairo's winter and summer offsets. */
  async function seedLedger() {
    const partner = await createPartner();
    const { partnerId } = partner;
    // A: earned in February, then reversed in March.
    await seedEntitlement(partner, {
      points: 50n,
      egpPiasters: 5_000n,
      events: [
        { type: 'accepted', at: '2026-01-20T10:00:00Z' },
        { type: 'paid', at: '2026-02-03T10:00:00Z' },
        { type: 'reversal', at: '2026-03-02T10:00:00Z' },
      ],
    });
    // B: 22:30 UTC on 28 Feb is 00:30 on 1 March in Cairo (UTC+2).
    await seedEntitlement(partner, {
      points: 30n,
      egpPiasters: 3_000n,
      events: [
        { type: 'accepted', at: '2026-01-21T10:00:00Z' },
        { type: 'paid', at: '2026-02-28T22:30:00Z' },
      ],
    });
    // C and D straddle the April/May boundary under Cairo summer time (UTC+3).
    await seedEntitlement(partner, {
      points: 10n,
      egpPiasters: 1_000n,
      events: [
        { type: 'accepted', at: '2026-04-01T10:00:00Z' },
        { type: 'paid', at: '2026-04-30T20:59:00Z' },
      ],
    });
    await seedEntitlement(partner, {
      points: 7n,
      egpPiasters: 700n,
      events: [
        { type: 'accepted', at: '2026-04-02T10:00:00Z' },
        { type: 'paid', at: '2026-04-30T21:30:00Z' },
      ],
    });
    // E stays pending.
    await seedEntitlement(partner, {
      points: 20n,
      egpPiasters: 2_000n,
      events: [{ type: 'accepted', at: '2026-05-01T10:00:00Z' }],
    });
    await seedAdjustment(partnerId, 1_000n, '2026-02-10T10:00:00Z', 'bonus');
    await seedAdjustment(partnerId, -250n, '2026-03-10T10:00:00Z', 'correction');
    // Recorded in March although paid in February: placed by recorded-at.
    const settlement = await seedSettlement(partnerId, {
      amountPiasters: 2_000n,
      at: '2026-03-05T10:00:00Z',
      paidAt: '2026-02-27',
    });
    await seedVoid(partnerId, settlement.id, 2_000n, '2026-04-02T10:00:00Z');
    await seedDebtForgiveness(partnerId, 400n, '2026-05-02T10:00:00Z');
    return partnerId;
  }

  describe('monthly statement', () => {
    it('runs opening + movements = closing for every month, placed by recorded-at in Cairo time', async () => {
      const partnerId = await seedLedger();

      const expected = [
        ['2026-01', 0n, 0n, 0n, 0n, 0n, 0n],
        ['2026-02', 0n, 5_000n, 0n, 1_000n, 0n, 6_000n],
        ['2026-03', 6_000n, 3_000n, 5_000n, -250n, 2_000n, 1_750n],
        ['2026-04', 1_750n, 1_000n, 0n, 0n, -2_000n, 4_750n],
        ['2026-05', 4_750n, 700n, 0n, 400n, 0n, 5_850n],
      ] as const;

      for (const [month, opening, earned, reversed, adjustments, settled, closing] of expected) {
        const { statement } = await report(partnerId, { month });
        expect(statement).toMatchObject({
          month,
          openingEgpPiasters: opening,
          earned: { egpPiasters: earned },
          reversed: { egpPiasters: reversed },
          adjustmentsEgpPiasters: adjustments,
          settledEgpPiasters: settled,
          closingEgpPiasters: closing,
        });
        expect(opening + earned - reversed + adjustments - settled).toBe(closing);
      }
    });

    it('shows points on the earned and reversed lines and pending as a separate point-in-time figure', async () => {
      const partnerId = await seedLedger();

      const march = await report(partnerId, { month: '2026-03' });
      expect(march.statement.earned).toEqual({ points: 30n, egpPiasters: 3_000n });
      expect(march.statement.reversed).toEqual({ points: 50n, egpPiasters: 5_000n });
      // Pending is not a month movement and never moves the balance.
      expect(march.pending).toEqual({ points: 20n, egpPiasters: 2_000n });
      expect(march.statement.closingEgpPiasters).toBe(1_750n);
    });

    it("makes the current month's closing balance equal the live Available Balance", async () => {
      const partnerId = await seedLedger();

      const current = await report(partnerId);
      const live = await services.statement.getAvailableBalance(viewer, partnerId);

      expect(current.statement.month).toBe('2026-05');
      expect(live).toEqual({ success: true, data: { egpPiasters: 5_850n } });
      expect(current.statement.closingEgpPiasters).toBe(5_850n);
      expect(current.availableBalanceEgpPiasters).toBe(5_850n);
    });

    it('never changes a past month when later movements are recorded', async () => {
      const partnerId = await seedLedger();
      const before = await report(partnerId, { month: '2026-03' });

      // Backdated settlement paid in March but recorded in May lands in May.
      await seedSettlement(partnerId, {
        amountPiasters: 100n,
        at: '2026-05-10T10:00:00Z',
        paidAt: '2026-03-15',
      });

      await expect(report(partnerId, { month: '2026-03' })).resolves.toMatchObject({
        statement: before.statement,
      });
      const may = await report(partnerId, { month: '2026-05' });
      expect(may.statement.settledEgpPiasters).toBe(100n);
      expect(may.statement.closingEgpPiasters).toBe(5_750n);
    });

    it('runs the month picker from the first event month to the current month', async () => {
      const partnerId = await seedLedger();

      const { months } = await report(partnerId);

      expect(months).toEqual(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05']);
    });

    it('opens the first month at 0 even for a partner whose first event is its latest month', async () => {
      const partner = await createPartner();
      await seedEntitlement(partner, {
        points: 10n,
        egpPiasters: 1_000n,
        events: [
          { type: 'accepted', at: '2026-05-02T10:00:00Z' },
          { type: 'paid', at: '2026-05-03T10:00:00Z' },
        ],
      });

      const { months, statement } = await report(partner.partnerId);

      expect(months).toEqual(['2026-05']);
      expect(statement).toMatchObject({ openingEgpPiasters: 0n, closingEgpPiasters: 1_000n });
    });

    it('has an empty month list and a zero current-month statement before the first Reward Event', async () => {
      const { partnerId } = await createPartner();

      const empty = await report(partnerId);

      expect(empty.months).toEqual([]);
      expect(empty.statement).toMatchObject({
        month: '2026-05',
        openingEgpPiasters: 0n,
        closingEgpPiasters: 0n,
      });
      expect(empty.sales).toEqual([]);
    });

    it('rejects a month outside the picker range or in the wrong format', async () => {
      const partnerId = await seedLedger();
      for (const month of ['2025-12', '2026-06', '2026-5', 'march', '2026-13']) {
        await expect(
          services.statement.getStaffReport(viewer, partnerId, { month }),
        ).resolves.toEqual({ success: false, error: 'invalid-input' });
      }
    });

    it('carries an as-of timestamp', async () => {
      const { partnerId } = await createPartner();
      expect((await report(partnerId)).asOf).toEqual(NOW);
    });
  });

  describe('sales table', () => {
    const earnedAndReversed = (partner: { partnerId: number; rateId: number }, listing: Listing) =>
      seedEntitlement(partner, {
        points: 40n,
        egpPiasters: 4_000n,
        listing,
        events: [
          { type: 'accepted', at: '2026-02-01T10:00:00Z' },
          { type: 'paid', at: '2026-02-10T10:00:00Z' },
          { type: 'reversal', at: '2026-03-04T10:00:00Z' },
        ],
      });

    it('has one row per month × list × list item × variant with earned and reversed columns placed by their own event', async () => {
      const partner = await createPartner();
      const first = await createListing(partner.partnerId, { item: 'Notebook', variant: 'Blue' });
      const secondVariant = await addListItem(first.listId, first.categoryId, {
        item: 'Pens',
        variant: 'Black',
      });
      await earnedAndReversed(partner, first);
      await seedEntitlement(partner, {
        points: 10n,
        egpPiasters: 1_000n,
        listing: secondVariant,
        events: [
          { type: 'accepted', at: '2026-02-01T10:00:00Z' },
          { type: 'paid', at: '2026-02-12T10:00:00Z' },
        ],
      });

      const february = await report(partner.partnerId, { month: '2026-02' });
      expect(february.sales).toEqual([
        expect.objectContaining({
          month: '2026-02',
          listId: first.listId,
          listItemId: first.listItemId,
          variantId: first.variantId,
          earned: { points: 40n, egpPiasters: 4_000n },
          reversed: { points: 0n, egpPiasters: 0n },
          orderCount: 1,
        }),
        expect.objectContaining({
          listItemId: secondVariant.listItemId,
          variantId: secondVariant.variantId,
          earned: { points: 10n, egpPiasters: 1_000n },
          reversed: { points: 0n, egpPiasters: 0n },
        }),
      ]);

      const march = await report(partner.partnerId, { month: '2026-03' });
      expect(march.sales).toEqual([
        expect.objectContaining({
          month: '2026-03',
          variantId: first.variantId,
          earned: { points: 0n, egpPiasters: 0n },
          reversed: { points: 40n, egpPiasters: 4_000n },
        }),
      ]);
    });

    it("totals equal the statement's earned and reversed movements, with pending left out", async () => {
      const partner = await createPartner();
      const listing = await createListing(partner.partnerId);
      await earnedAndReversed(partner, listing);
      await seedEntitlement(partner, {
        points: 99n,
        egpPiasters: 9_900n,
        listing,
        events: [{ type: 'accepted', at: '2026-02-05T10:00:00Z' }],
      });
      await seedEntitlement(partner, {
        points: 5n,
        egpPiasters: 500n,
        listing,
        events: [
          { type: 'accepted', at: '2026-02-05T10:00:00Z' },
          { type: 'cancellation', at: '2026-02-06T10:00:00Z' },
        ],
      });

      for (const month of ['2026-02', '2026-03']) {
        const { sales, statement } = await report(partner.partnerId, { month });
        const total = (pick: 'earned' | 'reversed') =>
          sales.reduce((sum, row) => sum + row[pick].egpPiasters, 0n);
        expect(total('earned')).toBe(statement.earned.egpPiasters);
        expect(total('reversed')).toBe(statement.reversed.egpPiasters);
      }
    });

    it('counts the distinct Orders that contributed to a row', async () => {
      const partner = await createPartner();
      const listing = await createListing(partner.partnerId);
      const shared = await seedOrder(partner, listing);
      for (const orderId of [shared.orderId, shared.orderId, undefined]) {
        await seedEntitlement(partner, {
          points: 10n,
          egpPiasters: 1_000n,
          listing,
          orderId,
          events: [
            { type: 'accepted', at: '2026-02-01T10:00:00Z' },
            { type: 'paid', at: '2026-02-02T10:00:00Z' },
          ],
        });
      }

      const { sales } = await report(partner.partnerId, { month: '2026-02' });

      expect(sales).toHaveLength(1);
      expect(sales[0]).toMatchObject({ orderCount: 2, earned: { egpPiasters: 3_000n } });
    });

    it('labels rows with live names in the requested locale', async () => {
      const partner = await createPartner();
      const listing = await createListing(partner.partnerId, {
        list: 'Grade 1 list',
        item: 'Notebook',
        product: 'Spiral notebook',
        variant: 'Blue',
      });
      await earnedAndReversed(partner, listing);

      const english = (await report(partner.partnerId, { month: '2026-02' })).sales[0];
      expect(english).toMatchObject({
        listName: 'Grade 1 list',
        listItemLabel: 'Notebook',
        productName: 'Spiral notebook',
        variantLabel: 'Blue',
      });

      const arabic = (await report(partner.partnerId, { month: '2026-02', locale: 'ar' })).sales[0];
      expect(arabic).toMatchObject({
        listName: 'قائمة الصف الأول',
        listItemLabel: 'كشكول',
        variantLabel: 'أزرق',
      });
      expect(arabic.productName).toMatch(/^كشكول/);
    });

    it('falls back to the order snapshot when the catalog row is gone', async () => {
      const partner = await createPartner();
      const listing = await createListing(partner.partnerId);
      await earnedAndReversed(partner, listing);
      // Deleting the product cascades to its variant; order items keep their snapshots.
      await testDb.db.delete(products).where(eq(products.id, listing.productId));

      const [row] = (await report(partner.partnerId, { month: '2026-02' })).sales;

      expect(row).toMatchObject({
        productName: `Snapshot ${listing.productId}`,
        variantLabel: `Snapshot variant ${listing.variantId}`,
        earned: { egpPiasters: 4_000n },
      });
    });

    it("never includes another partner's rows", async () => {
      const mine = await createPartner();
      const theirs = await createPartner();
      await earnedAndReversed(mine, await createListing(mine.partnerId));
      await earnedAndReversed(theirs, await createListing(theirs.partnerId));

      const { sales, statement } = await report(mine.partnerId, { month: '2026-02' });

      expect(sales).toHaveLength(1);
      expect(statement.earned.egpPiasters).toBe(4_000n);
    });
  });

  describe('Staff projection', () => {
    it('lists Order References and every event of each entitlement active in the month', async () => {
      const partner = await createPartner();
      const listing = await createListing(partner.partnerId);
      const order = await seedOrder(partner, listing);
      const { entitlementId } = await seedEntitlement(partner, {
        points: 40n,
        egpPiasters: 4_000n,
        listing,
        orderId: order.orderId,
        events: [
          { type: 'accepted', at: '2026-02-01T10:00:00Z' },
          { type: 'paid', at: '2026-02-10T10:00:00Z' },
          { type: 'reversal', at: '2026-03-04T10:00:00Z' },
        ],
      });

      const march = await report(partner.partnerId, { month: '2026-03' });
      expect(march.entitlements).toEqual([
        expect.objectContaining({
          id: entitlementId,
          orderReference: order.orderReference,
          points: 40n,
          egpValuePiasters: 4_000n,
          listItemId: listing.listItemId,
          variantId: listing.variantId,
          events: [
            expect.objectContaining({
              type: 'accepted',
              recordedAt: new Date('2026-02-01T10:00:00Z'),
            }),
            expect.objectContaining({ type: 'paid', recordedAt: new Date('2026-02-10T10:00:00Z') }),
            expect.objectContaining({
              type: 'reversal',
              recordedAt: new Date('2026-03-04T10:00:00Z'),
            }),
          ],
        }),
      ]);

      // No event in April: the entitlement is not part of that month's detail.
      await seedAdjustment(partner.partnerId, 1n, '2026-04-10T10:00:00Z');
      expect((await report(partner.partnerId, { month: '2026-04' })).entitlements).toEqual([]);
    });

    it('lists the month adjustments with their reason and Staff actor', async () => {
      const { partnerId } = await createPartner();
      await seedAdjustment(partnerId, 1_250n, '2026-05-02T10:00:00Z', 'goodwill bonus');
      await seedAdjustment(partnerId, -300n, '2026-04-02T10:00:00Z', 'other month');

      const { adjustments } = await report(partnerId, { month: '2026-05' });

      expect(adjustments).toEqual([
        expect.objectContaining({
          egpPiasters: 1_250n,
          reason: 'goodwill bonus',
          actor: { userId: staffUserId, email: 'reward-report-staff@findeg.test' },
          recordedAt: new Date('2026-05-02T10:00:00Z'),
        }),
      ]);
    });

    it('lists settlement history with notes, actor, paid-at and void reasons, newest first', async () => {
      const { partnerId } = await createPartner();
      const settlement = await seedSettlement(partnerId, {
        amountPiasters: 2_000n,
        at: '2026-03-05T10:00:00Z',
        paidAt: '2026-02-27',
        notes: 'Paid via branch transfer',
      });
      await seedVoid(partnerId, settlement.id, 2_000n, '2026-04-02T10:00:00Z');
      await seedDebtForgiveness(partnerId, 400n, '2026-05-02T10:00:00Z');

      const { settlements } = await report(partnerId);

      expect(settlements).toEqual([
        expect.objectContaining({
          kind: 'debt-forgiveness',
          amountPiasters: 400n,
          reason: 'uncollectable',
        }),
        expect.objectContaining({
          kind: 'void',
          amountPiasters: -2_000n,
          reason: 'wrong school',
          voidsSettlementId: settlement.id,
          actor: { userId: staffUserId, email: 'reward-report-staff@findeg.test' },
        }),
        expect.objectContaining({
          id: settlement.id,
          kind: 'settlement',
          amountPiasters: 2_000n,
          transferReference: settlement.transferReference,
          paidAt: '2026-02-27',
          notes: 'Paid via branch transfer',
          recordedAt: new Date('2026-03-05T10:00:00Z'),
        }),
      ]);
    });

    it('applies no suppression: a sales row from a single Order is shown', async () => {
      const partner = await createPartner();
      await earnedInFebruary(partner, await createListing(partner.partnerId));

      const { sales } = await report(partner.partnerId, { month: '2026-02' });

      expect(sales).toEqual([expect.objectContaining({ orderCount: 1 })]);
    });
  });

  describe('lifecycle', () => {
    it('reflects real order transitions in the current month on the system clock', async () => {
      const live = createPartnerRewardsServices({ db: testDb.db });
      const partner = await createPartner();
      const { orderId } = await seedEntitlement(partner, {
        points: 40n,
        egpPiasters: 4_000n,
        events: [{ type: 'accepted', at: new Date().toISOString() }],
      });
      await testDb.db.update(orders).set({ status: 'shipped' }).where(eq(orders.id, orderId));

      await transitionOrderStatus(orderId, { status: 'delivered' });
      await transitionPaymentStatus(orderId, 'paid');
      const earned = await live.statement.getStaffReport(viewer, partner.partnerId);
      expect(earned).toMatchObject({
        success: true,
        data: {
          statement: { earned: { egpPiasters: 4_000n }, closingEgpPiasters: 4_000n },
          pending: { egpPiasters: 0n },
          availableBalanceEgpPiasters: 4_000n,
        },
      });

      await transitionPaymentStatus(orderId, 'refunded');
      const reversed = await live.statement.getStaffReport(viewer, partner.partnerId);
      expect(reversed).toMatchObject({
        success: true,
        data: {
          statement: { reversed: { egpPiasters: 4_000n }, closingEgpPiasters: 0n },
          availableBalanceEgpPiasters: 0n,
        },
      });
    });
  });

  describe('access', () => {
    it('is gated by rewards.view and reports an unknown partner as not found', async () => {
      const { partnerId } = await createPartner();
      for (const permissionCodes of [[], ['rewards.adjust', 'rewards.settle']] as const) {
        await expect(
          services.statement.getStaffReport({ userId: staffUserId, permissionCodes }, partnerId),
        ).resolves.toEqual({ success: false, error: 'forbidden' });
      }
      await expect(services.statement.getStaffReport(viewer, 999_999_999)).resolves.toEqual({
        success: false,
        error: 'not-found',
      });
    });
  });
});
