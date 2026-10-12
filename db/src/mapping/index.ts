/** Explicit persistence-to-domain projections. Raw Drizzle rows remain available. */
import {
  DEFAULT_CURRENCY,
  moneyFromDecimal,
  orderReference,
  publicCode,
  productVariant,
  type Id,
  type Money,
  type BusinessPartner,
  type PartnerMembership,
  type SchoolSupplyList,
  type SchoolSupplyListItem,
  type StockBalance,
  type Warehouse,
  type ProductVariant,
} from '@findeg/domain';
import type {
  orders,
  orderItems,
  businessPartners,
  partnerMemberships,
  schoolSupplyLists,
  schoolSupplyListItems,
  inventoryBalances,
  warehouses,
  productVariants,
  discountRules,
} from '../schema';

/** Storage ids are branded once at this boundary, never by the domain. */
export function domainId<Entity extends string>(value: number): Id<Entity> {
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new TypeError('Expected a positive safe integer id');
  return value as Id<Entity>;
}

export function nullableMoney(value: string | null): Money | null {
  return value === null ? null : moneyFromDecimal(value);
}

export function mapBusinessPartner(row: typeof businessPartners.$inferSelect): BusinessPartner {
  return {
    id: domainId<'BusinessPartner'>(row.id),
    code: row.code,
    name: { en: row.nameEn, ar: row.nameAr },
    status: row.status,
  };
}

export function mapPartnerMembership(
  row: typeof partnerMemberships.$inferSelect,
): PartnerMembership {
  return {
    id: domainId<'PartnerMembership'>(row.id),
    businessPartnerId: domainId<'BusinessPartner'>(row.businessPartnerId),
    customerId: domainId<'Customer'>(row.userId),
    roles: row.roles,
    status: row.status,
  };
}

export function mapSupplyList(row: typeof schoolSupplyLists.$inferSelect): SchoolSupplyList {
  return {
    id: domainId<'SchoolSupplyList'>(row.id),
    businessPartnerId: domainId<'BusinessPartner'>(row.businessPartnerId),
    academicYear: row.academicYear,
    grade: row.grade,
    title: { ...row.localizedTitle, en: row.localizedTitle.en ?? '' },
    status: row.status,
    publicCode: row.publicCode === null ? null : publicCode(row.publicCode),
    sourceListId: row.sourceListId === null ? null : domainId<'SchoolSupplyList'>(row.sourceListId),
    replacesListId:
      row.replacesListId === null ? null : domainId<'SchoolSupplyList'>(row.replacesListId),
    replacedById: row.replacedById === null ? null : domainId<'SchoolSupplyList'>(row.replacedById),
  };
}

export function mapSupplyListItem(
  row: typeof schoolSupplyListItems.$inferSelect,
): SchoolSupplyListItem {
  return {
    id: domainId<'SchoolSupplyListItem'>(row.id),
    supplyListId: domainId<'SchoolSupplyList'>(row.listId),
    defaultVariantId: row.variantId === null ? null : domainId<'ProductVariant'>(row.variantId),
    specification:
      row.exactItem || row.specification === null
        ? null
        : {
            categoryId: domainId<'Category'>(row.specification.categoryId),
            attributes: row.specification.attributes,
          },
    required: row.required,
    quantity: row.quantity,
  };
}

export function mapStockBalance(
  row: Pick<
    typeof inventoryBalances.$inferSelect,
    'variantId' | 'warehouseId' | 'onHand' | 'reserved'
  >,
): StockBalance {
  return {
    variantId: domainId<'ProductVariant'>(row.variantId),
    warehouseId: domainId<'Warehouse'>(row.warehouseId),
    onHand: row.onHand,
    reserved: row.reserved,
  };
}

export function mapWarehouse(
  row: Pick<typeof warehouses.$inferSelect, 'id' | 'name' | 'isActive'>,
): Warehouse {
  return {
    id: domainId<'Warehouse'>(row.id),
    name: row.name,
    status: row.isActive ? 'active' : 'inactive',
  };
}

/** Catalogue read projection includes internal cost; it is not a public domain entity. */
export function mapProductVariantRow(row: typeof productVariants.$inferSelect) {
  return {
    ...row,
    id: domainId<'ProductVariant'>(row.id),
    productId: domainId<'Product'>(row.productId),
    basePrice: moneyFromDecimal(row.basePrice),
    strikePrice: nullableMoney(row.strikePrice),
    costPrice: nullableMoney(row.costPrice),
  };
}

/** Legacy percentage values remain decimal strings; fixed discounts and minimum spend are Money. */
export function mapDiscountRuleRow(row: typeof discountRules.$inferSelect) {
  return {
    ...row,
    value: row.type === 'fixed' ? moneyFromDecimal(row.value) : row.value,
    minOrderAmount: nullableMoney(row.minOrderAmount),
  };
}

export function mapProductVariant(
  row: typeof productVariants.$inferSelect,
  attributes: Readonly<Record<string, string>> = {},
): ProductVariant {
  return productVariant({
    id: domainId<'ProductVariant'>(row.id),
    productId: domainId<'Product'>(row.productId),
    sku: row.sku,
    label: row.localizedLabel.en ? { ...row.localizedLabel, en: row.localizedLabel.en } : null,
    attributes,
    price: moneyFromDecimal(row.basePrice),
    compareAtPrice: nullableMoney(row.strikePrice),
    isDefault: row.isDefault,
    status: row.isActive ? 'active' : 'inactive',
  });
}

/** Historical Orders are projections: deleted variants and incomplete snapshots cannot form an accepted Order. */
export function mapOrderRow(row: typeof orders.$inferSelect) {
  if (row.currency !== DEFAULT_CURRENCY) throw new TypeError('Domain Money requires EGP');
  return {
    ...row,
    currency: DEFAULT_CURRENCY,
    id: domainId<'Order'>(row.id),
    userId: row.userId === null ? null : domainId<'Customer'>(row.userId),
    orderReference: orderReference(row.orderReference),
    subtotal: moneyFromDecimal(row.subtotal),
    shippingCost: nullableMoney(row.shippingCost),
    totalAmount: moneyFromDecimal(row.totalAmount),
    discountTotal: moneyFromDecimal(row.discountTotal),
    schoolSupplyListId:
      row.schoolSupplyListId === null ? null : domainId<'SchoolSupplyList'>(row.schoolSupplyListId),
    schoolSupplyListPublicCode:
      row.schoolSupplyListPublicCode === null ? null : publicCode(row.schoolSupplyListPublicCode),
    businessPartnerId:
      row.businessPartnerId === null ? null : domainId<'BusinessPartner'>(row.businessPartnerId),
  };
}

export function mapOrderItemRow(row: typeof orderItems.$inferSelect) {
  return {
    ...row,
    id: domainId<'OrderLine'>(row.id),
    orderId: domainId<'Order'>(row.orderId),
    productId: row.productId === null ? null : domainId<'Product'>(row.productId),
    variantId: row.variantId === null ? null : domainId<'ProductVariant'>(row.variantId),
    schoolSupplyListItemId:
      row.schoolSupplyListItemId === null
        ? null
        : domainId<'SchoolSupplyListItem'>(row.schoolSupplyListItemId),
    unitPriceSnapshot: nullableMoney(row.unitPriceSnapshot),
    unitPrice: moneyFromDecimal(row.unitPrice),
    discountAmount: moneyFromDecimal(row.discountAmount),
    lineTotal: moneyFromDecimal(row.lineTotal),
    totalPrice: moneyFromDecimal(row.totalPrice),
    totalAmount: moneyFromDecimal(row.totalAmount),
  };
}

export type DomainOrderRow = ReturnType<typeof mapOrderRow>;
export type DomainOrderItemRow = ReturnType<typeof mapOrderItemRow>;
