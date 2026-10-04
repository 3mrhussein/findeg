import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  businessPartners,
  categories,
  orderItems,
  orders,
  partnerInvitations,
  partnerMemberships,
  productVariants,
  products,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
  rewardSettlements,
  schoolSupplyListItems,
  schoolSupplyLists,
  users,
  type PartnerRole,
  type RewardEventType,
} from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createPartnerRewardsServices,
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
  type PartnerRewardsServices,
} from '..';

const NOW = new Date('2026-05-15T10:00:00.000Z');

describe('Partner projection of the Reward Statement and sales', () => {
  let testDb: TestDatabase;
  let services: PartnerRewardsServices;
  let sequence = 0;
  let staffUserId: number;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerRewardsServices({ db: testDb.db, now: () => NOW });
    const [staff] = await testDb.db
      .insert(users)
      .values({ email: 'partner-report-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staffUserId = staff.id;
  });
  afterAll(async () => testDb.close());

  async function createPartner(
    status: 'onboarding' | 'active' | 'suspended' | 'closed' = 'active',
  ) {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: `pr-school-${sequence}`, nameEn: 'School', nameAr: 'مدرسة', status })
      .returning();
    const [rate] = await testDb.db
      .insert(rewardRates)
      .values({ businessPartnerId: partner.id, pointsPerEgp: '1.000000', egpPerPoint: '0.0100' })
      .returning();
    return { partnerId: partner.id, rateId: rate.id };
  }

  async function createMember(
    partnerId: number,
    roles: PartnerRole[],
    status: 'active' | 'suspended' | 'ended' = 'active',
  ) {
    sequence += 1;
    const [user] = await testDb.db
      .insert(users)
      .values({ email: `pr-member-${sequence}@findeg.test` })
      .returning();
    const [invitation] = await testDb.db
      .insert(partnerInvitations)
      .values({
        businessPartnerId: partnerId,
        email: user.email,
        roles,
        status: 'accepted',
        invitedByUserId: staffUserId,
        expiresAt: new Date('2027-01-01'),
      })
      .returning();
    await testDb.db.insert(partnerMemberships).values({
      businessPartnerId: partnerId,
      userId: user.id,
      invitationId: invitation.id,
      roles,
      status,
    });
    return { userId: user.id };
  }

  async function createListing(partnerId: number) {
    sequence += 1;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `pr-cat-${sequence}` })
      .returning();
    const [list] = await testDb.db
      .insert(schoolSupplyLists)
      .values({
        businessPartnerId: partnerId,
        grade: 'Grade 1',
        academicYear: '2026/2027',
        localizedTitle: { en: 'Grade 1 list', ar: 'قائمة الصف الأول' },
      })
      .returning();
    return { listId: list.id, categoryId: category.id };
  }

  async function addListItem(listing: { listId: number; categoryId: number }, name: string) {
    sequence += 1;
    const [product] = await testDb.db
      .insert(products)
      .values({
        localizedName: { en: name, ar: `${name} ع` },
        localizedDescription: { en: 'd' },
        localizedLongDescription: { en: 'd' },
        categoryId: listing.categoryId,
      })
      .returning();
    const [variant] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `PR-SKU-${sequence}`,
        basePrice: '25.00',
        localizedLabel: { en: 'Blue', ar: 'أزرق' },
      })
      .returning();
    const [item] = await testDb.db
      .insert(schoolSupplyListItems)
      .values({
        listId: listing.listId,
        variantId: variant.id,
        localizedLabel: { en: 'Notebook', ar: 'كشكول' },
        productNameEnSnapshot: 'x',
      })
      .returning();
    return {
      listId: listing.listId,
      listItemId: item.id,
      variantId: variant.id,
      productId: product.id,
    };
  }

  type Item = Awaited<ReturnType<typeof addListItem>>;

  /** One Order with one attributed line, an entitlement and events at exact instants. */
  async function seedSale(
    partner: { partnerId: number; rateId: number },
    item: Item,
    input: { egpPiasters: bigint; events: readonly { type: RewardEventType; at: string }[] },
  ) {
    sequence += 1;
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-S${String(sequence).padStart(5, '0')}`,
        totalAmount: '100.00',
        schoolSupplyListId: item.listId,
        schoolSupplyListPublicCode: 'a'.repeat(32),
        schoolSupplyListPublishedAt: new Date('2026-01-01T00:00:00Z'),
        businessPartnerId: partner.partnerId,
      })
      .returning();
    const [line] = await testDb.db
      .insert(orderItems)
      .values({
        orderId: order.id,
        quantity: 1,
        lineTotal: '100.00',
        productId: item.productId,
        variantId: item.variantId,
        schoolSupplyListItemId: item.listItemId,
        isSubstitute: false,
        productNameSnapshot: 'Snapshot',
        variantSnapshot: { label: 'Snapshot variant' },
      })
      .returning();
    const [entitlement] = await testDb.db
      .insert(rewardEntitlements)
      .values({
        businessPartnerId: partner.partnerId,
        orderItemId: line.id,
        rewardRateId: partner.rateId,
        chargedLineTotalPiasters: 10_000n,
        points: input.egpPiasters / 100n,
        egpValuePiasters: input.egpPiasters,
      })
      .returning();
    await testDb.db.insert(rewardEvents).values(
      input.events.map((event) => ({
        businessPartnerId: partner.partnerId,
        entitlementId: entitlement.id,
        eventType: event.type,
        points: input.egpPiasters / 100n,
        egpValuePiasters: input.egpPiasters,
        createdAt: new Date(event.at),
      })),
    );
  }

  const earned = (egp: bigint) => ({
    egpPiasters: egp,
    events: [
      { type: 'accepted' as const, at: '2026-05-01T10:00:00Z' },
      { type: 'paid' as const, at: '2026-05-05T10:00:00Z' },
    ],
  });

  async function report(userId: number, partnerId: number, month?: string) {
    return services.partnerReports.getPartnerReport({ userId }, partnerId, { month });
  }

  it('never shows another partner’s rows', async () => {
    const mine = await createPartner();
    const other = await createPartner();
    const member = await createMember(mine.partnerId, ['report-viewer']);
    const myItem = await addListItem(await createListing(mine.partnerId), 'Mine');
    const otherItem = await addListItem(await createListing(other.partnerId), 'Theirs');
    for (let i = 0; i < 3; i += 1) await seedSale(mine, myItem, earned(1_000n));
    for (let i = 0; i < 3; i += 1) await seedSale(other, otherItem, earned(7_000n));
    await testDb.db.insert(rewardSettlements).values({
      businessPartnerId: other.partnerId,
      kind: 'settlement',
      amountPiasters: 500n,
      transferReference: 'OTHER-TRX',
      paidAt: '2026-05-06',
      idempotencyKey: 'other-settle',
    });

    const result = await report(member.userId, mine.partnerId);
    if (!result.success) throw new Error(result.error);
    const view = result.data;
    expect(view.statement.earned.egpPiasters).toBe(3_000n);
    expect(view.availableBalanceEgpPiasters).toBe(3_000n);
    expect(view.sales.map((row) => row.productName)).toEqual(['Mine']);
    expect(view.settlements).toEqual([]);
    expect(JSON.stringify(view, (_, v) => (typeof v === 'bigint' ? v.toString() : v))).not.toMatch(
      /Theirs|OTHER-TRX/,
    );
  });

  it('carries no Order Reference, note, actor or reason', async () => {
    const partner = await createPartner();
    const member = await createMember(partner.partnerId, ['partner-administrator']);
    const item = await addListItem(await createListing(partner.partnerId), 'Notebook');
    for (let i = 0; i < 3; i += 1) await seedSale(partner, item, earned(1_000n));
    const [settlement] = await testDb.db
      .insert(rewardSettlements)
      .values({
        businessPartnerId: partner.partnerId,
        kind: 'settlement',
        amountPiasters: 1_000n,
        transferReference: 'TRX-1',
        paidAt: '2026-05-08',
        notes: 'STAFF-NOTE',
        idempotencyKey: 's1',
        actorUserId: staffUserId,
        createdAt: new Date('2026-05-09T10:00:00Z'),
      })
      .returning();
    await testDb.db.insert(rewardSettlements).values({
      businessPartnerId: partner.partnerId,
      kind: 'void',
      amountPiasters: -1_000n,
      voidsSettlementId: settlement.id,
      reason: 'VOID-REASON',
      actorUserId: staffUserId,
      createdAt: new Date('2026-05-10T10:00:00Z'),
    });
    await testDb.db.insert(rewardEvents).values({
      businessPartnerId: partner.partnerId,
      eventType: 'adjustment',
      points: 0n,
      egpValuePiasters: 250n,
      reason: 'ADJUST-REASON',
      idempotencyKey: 'a1',
      actorUserId: staffUserId,
      createdAt: new Date('2026-05-11T10:00:00Z'),
    });

    const result = await report(member.userId, partner.partnerId);
    if (!result.success) throw new Error(result.error);
    const json = JSON.stringify(result.data, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
    expect(json).not.toMatch(/FE-S\d{5}|STAFF-NOTE|VOID-REASON|ADJUST-REASON|orderReference|actor/);
    expect(result.data.statement.adjustmentsEgpPiasters).toBe(250n);
    expect(result.data.settlements.map((line) => [line.kind, line.amountPiasters])).toEqual([
      ['void', -1_000n],
      ['settlement', 1_000n],
    ]);
    expect(result.data.settlements[0].voidsTransferReference).toBe('TRX-1');
    expect(result.data.settlements[1]).toMatchObject({
      transferReference: 'TRX-1',
      paidAt: '2026-05-08',
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
      [['report-viewer'], 'ended', false],
    ] as const)('roles %j, membership %s → allowed %s', async (roles, membership, allowed) => {
      const partner = await createPartner();
      const member = await createMember(partner.partnerId, [...roles], membership);
      const result = await report(member.userId, partner.partnerId);
      expect(result.success).toBe(allowed);
      if (!result.success) expect(result.error).toBe('forbidden');
    });

    it('refuses a user with no membership and a member of another partner', async () => {
      const partner = await createPartner();
      const other = await createPartner();
      const outsider = await createMember(other.partnerId, ['partner-administrator']);
      expect((await report(outsider.userId, partner.partnerId)).success).toBe(false);
      expect((await report(999_999_999, partner.partnerId)).success).toBe(false);
    });

    it.each(['onboarding', 'active', 'suspended', 'closed'] as const)(
      'reads while the Business Partner is %s',
      async (status) => {
        const partner = await createPartner(status);
        const member = await createMember(partner.partnerId, ['report-viewer']);
        expect((await report(member.userId, partner.partnerId)).success).toBe(true);
      },
    );
  });

  it('shows an empty state before the first Reward Event', async () => {
    const partner = await createPartner();
    const member = await createMember(partner.partnerId, ['report-viewer']);
    const result = await report(member.userId, partner.partnerId);
    if (!result.success) throw new Error(result.error);
    expect(result.data.months).toEqual([]);
    expect(result.data.sales).toEqual([]);
    expect(result.data.otherItems).toBeNull();
    expect(result.data.asOf).toEqual(NOW);
  });

  it('rolls rows under the Order threshold into Other items so totals reconcile', async () => {
    const partner = await createPartner();
    const member = await createMember(partner.partnerId, ['report-viewer']);
    const listing = await createListing(partner.partnerId);
    const popular = await addListItem(listing, 'Popular');
    const rareA = await addListItem(listing, 'RareA');
    const rareB = await addListItem(listing, 'RareB');
    for (let i = 0; i < MIN_DISTINCT_ORDERS_PER_SALES_ROW; i += 1) {
      await seedSale(partner, popular, earned(1_000n));
    }
    await seedSale(partner, rareA, earned(200n));
    await seedSale(partner, rareA, earned(300n));
    await seedSale(partner, rareB, {
      egpPiasters: 400n,
      events: [
        { type: 'accepted', at: '2026-05-01T10:00:00Z' },
        { type: 'paid', at: '2026-05-05T10:00:00Z' },
        { type: 'reversal', at: '2026-05-06T10:00:00Z' },
      ],
    });
    // Reward value that is not part of the sales table: an adjustment stays on the statement.
    const result = await report(member.userId, partner.partnerId);
    if (!result.success) throw new Error(result.error);
    const { sales, otherItems, statement } = result.data;

    expect(sales.map((row) => row.productName)).toEqual(['Popular']);
    expect(otherItems).toEqual({
      earned: { points: 9n, egpPiasters: 900n },
      reversed: { points: 4n, egpPiasters: 400n },
    });
    const earnedTotal = sales.reduce(
      (n, row) => n + row.earned.egpPiasters,
      otherItems!.earned.egpPiasters,
    );
    const reversedTotal = sales.reduce(
      (n, row) => n + row.reversed.egpPiasters,
      otherItems!.reversed.egpPiasters,
    );
    expect(earnedTotal).toBe(statement.earned.egpPiasters);
    expect(reversedTotal).toBe(statement.reversed.egpPiasters);
    expect(statement.earned.egpPiasters).toBe(3_900n);
  });

  it('keeps statement lines unsuppressed for a single Order', async () => {
    const partner = await createPartner();
    const member = await createMember(partner.partnerId, ['report-viewer']);
    const item = await addListItem(await createListing(partner.partnerId), 'Solo');
    await seedSale(partner, item, earned(1_234n));
    const result = await report(member.userId, partner.partnerId);
    if (!result.success) throw new Error(result.error);
    expect(result.data.statement.earned.egpPiasters).toBe(1_234n);
    expect(result.data.sales).toEqual([]);
    expect(result.data.otherItems?.earned.egpPiasters).toBe(1_234n);
  });

  it('shows a signed negative balance and agrees with the Staff projection', async () => {
    const partner = await createPartner();
    const member = await createMember(partner.partnerId, ['report-viewer']);
    const item = await addListItem(await createListing(partner.partnerId), 'Notebook');
    await seedSale(partner, item, {
      egpPiasters: 5_000n,
      events: [
        { type: 'accepted', at: '2026-04-01T10:00:00Z' },
        { type: 'paid', at: '2026-04-05T10:00:00Z' },
        { type: 'reversal', at: '2026-05-06T10:00:00Z' },
      ],
    });
    await testDb.db.insert(rewardSettlements).values({
      businessPartnerId: partner.partnerId,
      kind: 'settlement',
      amountPiasters: 5_000n,
      transferReference: 'TRX-NEG',
      paidAt: '2026-04-20',
      idempotencyKey: 'neg',
      createdAt: new Date('2026-04-21T10:00:00Z'),
    });

    const result = await report(member.userId, partner.partnerId);
    if (!result.success) throw new Error(result.error);
    expect(result.data.availableBalanceEgpPiasters).toBe(-5_000n);

    const staff = await services.statement.getStaffReport(
      { userId: staffUserId, permissionCodes: ['rewards.view'] },
      partner.partnerId,
    );
    if (!staff.success) throw new Error(staff.error);
    expect(result.data.statement).toEqual(staff.data.statement);
    expect(result.data.pending).toEqual(staff.data.pending);
    expect(result.data.availableBalanceEgpPiasters).toBe(staff.data.availableBalanceEgpPiasters);
    expect(result.data.months).toEqual(staff.data.months);
  });

  it('rejects a month outside the picker', async () => {
    const partner = await createPartner();
    const member = await createMember(partner.partnerId, ['report-viewer']);
    const item = await addListItem(await createListing(partner.partnerId), 'Notebook');
    await seedSale(partner, item, earned(100n));
    const result = await report(member.userId, partner.partnerId, '2020-01');
    expect(result).toEqual({ success: false, error: 'invalid-input' });
    const malformed = await report(member.userId, partner.partnerId, 'May');
    expect(malformed).toEqual({ success: false, error: 'invalid-input' });
  });

  it('uses live names in the viewer’s locale', async () => {
    const partner = await createPartner();
    const member = await createMember(partner.partnerId, ['report-viewer']);
    const item = await addListItem(await createListing(partner.partnerId), 'Live name');
    for (let i = 0; i < 3; i += 1) await seedSale(partner, item, earned(100n));
    const en = await services.partnerReports.getPartnerReport(
      { userId: member.userId },
      partner.partnerId,
      { locale: 'en' },
    );
    const ar = await services.partnerReports.getPartnerReport(
      { userId: member.userId },
      partner.partnerId,
      { locale: 'ar' },
    );
    if (!en.success || !ar.success) throw new Error('expected success');
    expect(en.data.sales[0]).toMatchObject({ listName: 'Grade 1 list', productName: 'Live name' });
    expect(ar.data.sales[0]).toMatchObject({
      listName: 'قائمة الصف الأول',
      productName: 'Live name ع',
    });
  });
});
