import {
  businessPartners,
  categories,
  orderItems,
  orders,
  partnerInvitations,
  partnerMemberships,
  productVariants,
  products,
  schoolSupplyListItems,
  schoolSupplyLists,
  users,
  type PartnerRole,
} from '@findeg/db/schema';
import type { TestDatabase } from '../../../testing/postgres';

type OrderStatus = (typeof orders.$inferInsert)['status'];
type PaymentStatus = (typeof orders.$inferInsert)['paymentStatus'];

/** Rows for Partner Sales tests: partners, members, lists and Attributed Orders. */
export function partnerSalesFixtures(testDb: TestDatabase, prefix: string) {
  let sequence = 0;
  const next = () => (sequence += 1);
  let staffUserId: number | undefined;

  async function staffUser() {
    if (staffUserId !== undefined) return staffUserId;
    const [staff] = await testDb.db
      .insert(users)
      .values({ email: `${prefix}-staff@findeg.test`, portalRole: 'staff' })
      .returning();
    staffUserId = staff.id;
    return staffUserId;
  }

  async function createPartner(
    status: 'onboarding' | 'active' | 'suspended' | 'closed' = 'active',
  ) {
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: `${prefix}-school-${next()}`, nameEn: 'School', nameAr: 'مدرسة', status })
      .returning();
    return partner.id;
  }

  async function createMember(
    partnerId: number,
    roles: PartnerRole[],
    status: 'active' | 'suspended' | 'ended' = 'active',
  ) {
    const [user] = await testDb.db
      .insert(users)
      .values({ email: `${prefix}-member-${next()}@findeg.test` })
      .returning();
    const [invitation] = await testDb.db
      .insert(partnerInvitations)
      .values({
        businessPartnerId: partnerId,
        email: user.email,
        roles,
        status: 'accepted',
        invitedByUserId: await staffUser(),
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
    return user.id;
  }

  async function createListing(partnerId: number) {
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `${prefix}-cat-${next()}` })
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
    return { partnerId, listId: list.id, categoryId: category.id };
  }

  async function addListItem(
    listing: { partnerId: number; listId: number; categoryId: number },
    name: string,
  ) {
    const n = next();
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
        sku: `${prefix.toUpperCase()}-SKU-${n}`,
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
        productNameEnSnapshot: name,
      })
      .returning();
    return {
      partnerId: listing.partnerId,
      listId: listing.listId,
      listItemId: item.id,
      variantId: variant.id,
      productId: product.id,
    };
  }

  type ListItem = Awaited<ReturnType<typeof addListItem>>;

  /**
   * One Attributed Order accepted at `at`, shaped as checkout writes it: subtotal is the
   * charged (post-discount) total, `variant_snapshot` is the variant's localized label.
   */
  async function seedOrder(input: {
    item: ListItem;
    at: string;
    quantity?: number;
    /** EGP decimal strings, per line. */
    unitPrice?: string;
    discount?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    variantSnapshot?: Record<string, unknown> | null;
    /** Null for a line whose variant was deleted after acceptance. */
    variantId?: number | null;
  }) {
    const quantity = input.quantity ?? 1;
    const unitPrice = input.unitPrice ?? '25.00';
    const discount = input.discount ?? '0.00';
    const gross = (Number(unitPrice) * quantity).toFixed(2);
    const charged = (Number(gross) - Number(discount)).toFixed(2);
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-${prefix.slice(0, 1).toUpperCase()}${String(next()).padStart(5, '0')}`,
        guestEmail: `${prefix}-customer@example.com`,
        status: input.status ?? 'pending',
        paymentStatus: input.paymentStatus ?? 'unpaid',
        subtotal: charged,
        discountTotal: discount,
        shippingCost: '50.00',
        totalAmount: (Number(charged) + 50).toFixed(2),
        schoolSupplyListId: input.item.listId,
        schoolSupplyListPublicCode: 'a'.repeat(32),
        schoolSupplyListPublishedAt: new Date('2026-01-01T00:00:00Z'),
        businessPartnerId: input.item.partnerId,
        createdAt: new Date(input.at),
      })
      .returning();
    await testDb.db.insert(orderItems).values({
      orderId: order.id,
      productId: input.item.productId,
      variantId: input.variantId === undefined ? input.item.variantId : input.variantId,
      schoolSupplyListItemId: input.item.listItemId,
      isSubstitute: false,
      quantity,
      unitPrice,
      unitPriceSnapshot: unitPrice,
      discountAmount: discount,
      lineTotal: charged,
      totalPrice: charged,
      productNameSnapshot: 'Snapshot product',
      variantSnapshot:
        input.variantSnapshot === undefined
          ? { en: 'Snapshot blue', ar: 'أزرق محفوظ' }
          : input.variantSnapshot,
    });
    return order;
  }

  /** An ordinary Cart Order: no list, no Business Partner. */
  async function seedCartOrder(at: string) {
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-C${String(next()).padStart(5, '0')}`,
        subtotal: '10.00',
        totalAmount: '60.00',
        createdAt: new Date(at),
      })
      .returning();
    await testDb.db
      .insert(orderItems)
      .values({ orderId: order.id, quantity: 1, lineTotal: '10.00' });
    return order;
  }

  return {
    staffUser,
    createPartner,
    createMember,
    createListing,
    addListItem,
    seedOrder,
    seedCartOrder,
  };
}
