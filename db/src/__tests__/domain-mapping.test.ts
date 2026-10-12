import { describe, expect, expectTypeOf, it } from 'vitest';
import type { OrderId, VariantId, SupplyListId, Money } from '@findeg/domain';
import { moneyFromDecimal } from '@findeg/domain';
import {
  mapBusinessPartner,
  mapPartnerMembership,
  mapStockBalance,
  mapWarehouse,
  mapSupplyListItem,
  domainId,
  mapOrderRow,
  mapOrderItemRow,
  mapProductVariant,
  mapProductVariantRow,
  mapDiscountRuleRow,
  mapSupplyList,
  nullableMoney,
} from '../mapping';
import {
  orders,
  orderItems,
  productVariants,
  schoolSupplyLists,
  businessPartners,
  partnerMemberships,
  schoolSupplyListItems,
  discountRules,
} from '../schema';

describe('persistence domain projections', () => {
  it('maps decimal strings exactly and preserves nullable amounts', () => {
    expect(nullableMoney('9999999999.99')).toBe(999999999999n);
    expect(nullableMoney('0.01')).toBe(1n);
    expect(nullableMoney(null)).toBeNull();
    expectTypeOf(nullableMoney('1.00')).toEqualTypeOf<Money | null>();
    expect(() => nullableMoney('1.001')).toThrow();
    expect(() => nullableMoney('-1.00')).toThrow();
  });
  it('brands identities while rejecting invalid storage identities', () => {
    expect(domainId<'Order'>(17)).toBe(17);
    expectTypeOf(domainId<'Order'>(17)).toEqualTypeOf<OrderId>();
    expect(() => domainId(0)).toThrow();
    expect(() => domainId(1.5)).toThrow();
  });
  it('maps an Order read projection without fabricating a historical buyer or list', () => {
    const row: typeof orders.$inferSelect = {
      id: 3,
      orderReference: 'FE-012ABC',
      userId: null,
      guestEmail: null,
      status: 'pending',
      paymentStatus: 'unpaid',
      subtotal: '37.50',
      shippingCost: null,
      totalAmount: '37.50',
      currency: 'EGP',
      paymentMethod: null,
      schoolSupplyListId: null,
      schoolSupplyListPublicCode: null,
      schoolSupplyListPublishedAt: null,
      businessPartnerId: null,
      listOfferBasisPoints: null,
      discountTotal: '0.00',
      shippingAddressSnapshot: null,
      trackingNumber: null,
      adminNotes: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    const mapped = mapOrderRow(row);
    expect(mapped).toMatchObject({
      id: 3,
      totalAmount: 3750n,
      shippingCost: null,
      userId: null,
      schoolSupplyListId: null,
      paymentMethod: null,
    });
    expectTypeOf(mapped.id).toEqualTypeOf<OrderId>();
    expect(row.totalAmount).toBe('37.50');
    expect(
      mapOrderRow({
        ...row,
        schoolSupplyListId: 11,
        schoolSupplyListPublicCode: 'a'.repeat(32),
        businessPartnerId: 7,
      }).schoolSupplyListId,
    ).toBe(11);
    expect(() => mapOrderRow({ ...row, orderReference: 'invalid' })).toThrow();
    expect(() => mapOrderRow({ ...row, currency: 'USD' })).toThrow();
  });
  it('preserves deleted-variant and nullable snapshot references on historical Order lines', () => {
    const row: typeof orderItems.$inferSelect = {
      id: 1,
      orderId: 3,
      productId: null,
      variantId: null,
      schoolSupplyListItemId: null,
      isSubstitute: null,
      quantity: 2,
      productNameSnapshot: null,
      productSkuSnapshot: null,
      variantSkuSnapshot: null,
      unitPriceSnapshot: null,
      unitPrice: '18.75',
      discountAmount: '0.00',
      lineTotal: '37.50',
      variantSnapshot: null,
      totalPrice: '37.50',
      totalAmount: '37.50',
    };
    expect(mapOrderItemRow(row)).toMatchObject({
      productId: null,
      variantId: null,
      unitPriceSnapshot: null,
      unitPrice: 1875n,
      lineTotal: 3750n,
    });
    const mapped = mapOrderItemRow({
      ...row,
      variantId: 5,
      productId: 2,
      schoolSupplyListItemId: 8,
      unitPriceSnapshot: '18.75',
    });
    expectTypeOf(mapped.variantId).toEqualTypeOf<VariantId | null>();
    expect(mapped.variantId).toBe(5);
    expect(mapped.unitPriceSnapshot).toBe(moneyFromDecimal('18.75'));
  });
  it('maps variant prices and rejects an invalid compare-at price through the domain', () => {
    const row: typeof productVariants.$inferSelect = {
      id: 4,
      productId: 2,
      sku: 'Pen / Blue',
      variantKey: 'blue',
      localizedLabel: { en: 'Blue' },
      isDefault: true,
      sortOrder: 0,
      isActive: true,
      basePrice: '37.50',
      strikePrice: '50.00',
      costPrice: null,
      weightGrams: null,
      barcode: null,
      mediaSet: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    expect(mapProductVariant(row, { colour: 'blue' })).toMatchObject({
      id: 4,
      productId: 2,
      price: 3750n,
      compareAtPrice: 5000n,
      status: 'active',
      attributes: { colour: 'blue' },
    });
    expectTypeOf(mapProductVariant(row).id).toEqualTypeOf<VariantId>();
    expect(() => mapProductVariant({ ...row, strikePrice: '20.00' })).toThrow();
    expect(mapProductVariant({ ...row, strikePrice: null }).compareAtPrice).toBeNull();
    expect(mapProductVariantRow({ ...row, costPrice: '0.01' })).toMatchObject({
      basePrice: 3750n,
      strikePrice: 5000n,
      costPrice: 1n,
    });
    expect(mapProductVariantRow(row).costPrice).toBeNull();
  });
  it('maps a draft list without inventing publication or provenance references', () => {
    const row: typeof schoolSupplyLists.$inferSelect = {
      id: 7,
      businessPartnerId: 2,
      grade: '1',
      academicYear: '2026',
      localizedTitle: { en: 'Grade 1' },
      localizedDescription: null,
      heroImageUrl: null,
      status: 'draft',
      publicCode: null,
      sourceListId: null,
      replacesListId: null,
      replacedById: null,
      publishedAt: null,
      archivedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    expect(mapSupplyList(row)).toMatchObject({
      id: 7,
      publicCode: null,
      sourceListId: null,
      replacesListId: null,
      replacedById: null,
    });
    expectTypeOf(mapSupplyList(row).id).toEqualTypeOf<SupplyListId>();
    expect(
      mapSupplyList({
        ...row,
        publicCode: 'a'.repeat(32),
        sourceListId: 3,
        replacesListId: 4,
        replacedById: 5,
      }),
    ).toMatchObject({ sourceListId: 3, replacesListId: 4, replacedById: 5 });
  });
  it('maps Partner and Membership identities and keeps domain status and roles', () => {
    const partner: typeof businessPartners.$inferSelect = {
      id: 2,
      code: 'school',
      nameEn: 'School',
      nameAr: 'مدرسة',
      status: 'active',
      authorizationVersion: 1,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    expect(mapBusinessPartner(partner)).toEqual({
      id: 2,
      code: 'school',
      name: { en: 'School', ar: 'مدرسة' },
      status: 'active',
    });
    const member: typeof partnerMemberships.$inferSelect = {
      id: 3,
      businessPartnerId: 2,
      userId: 5,
      invitationId: 6,
      roles: ['partner-administrator'],
      status: 'active',
      authorizationVersion: 1,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    expect(mapPartnerMembership(member)).toEqual({
      id: 3,
      businessPartnerId: 2,
      customerId: 5,
      roles: ['partner-administrator'],
      status: 'active',
    });
  });
  it('maps draft items and turns Exact Items into a null specification', () => {
    const item: typeof schoolSupplyListItems.$inferSelect = {
      id: 8,
      listId: 7,
      variantId: null,
      exactItem: false,
      specification: { categoryId: 2, attributes: { colour: 'blue' } },
      required: true,
      quantity: 2,
      localizedLabel: { en: 'Pen' },
      localizedNote: null,
      sortOrder: 0,
      productNameEnSnapshot: null,
      productNameArSnapshot: null,
      skuSnapshot: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    expect(mapSupplyListItem(item)).toMatchObject({
      defaultVariantId: null,
      specification: { categoryId: 2, attributes: { colour: 'blue' } },
    });
    expect(mapSupplyListItem({ ...item, variantId: 5, exactItem: true })).toMatchObject({
      defaultVariantId: 5,
      specification: null,
    });
  });
  it('maps inventory balances and active/inactive warehouses without changing units', () => {
    expect(mapStockBalance({ variantId: 5, warehouseId: 3, onHand: 7, reserved: 2 })).toEqual({
      variantId: 5,
      warehouseId: 3,
      onHand: 7,
      reserved: 2,
    });
    expect(mapWarehouse({ id: 3, name: 'Main', isActive: true })).toEqual({
      id: 3,
      name: 'Main',
      status: 'active',
    });
    expect(mapWarehouse({ id: 3, name: 'Main', isActive: false }).status).toBe('inactive');
  });
  it('maps legacy monetary discounts without interpreting percentages as Money', () => {
    const row: typeof discountRules.$inferSelect = {
      id: 1,
      code: 'TEST',
      description: null,
      type: 'fixed',
      value: '0.01',
      minOrderAmount: '99.99',
      startDate: null,
      endDate: null,
      usageLimit: null,
      usageCount: 0,
      perUserLimit: 1,
      isActive: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    expect(mapDiscountRuleRow(row)).toMatchObject({ value: 1n, minOrderAmount: 9999n });
    expect(
      mapDiscountRuleRow({ ...row, type: 'percentage', value: '5.00', minOrderAmount: null }),
    ).toMatchObject({ value: '5.00', minOrderAmount: null });
  });
});
