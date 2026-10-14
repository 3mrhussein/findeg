/**
 * The business-domain map's values: entity ownership and every relation. Checked against the
 * domain types by `__tests__/relations.test.ts`.
 */

import type { Relation } from './types';

/** Entity name → owning domain. Every entity the map mentions must appear here exactly once. */
export const ENTITY_DOMAINS = {
  Customer: 'customers',
  BusinessPartner: 'partners',
  PartnerSchoolProfile: 'partners',
  PartnerMembership: 'partners',
  PartnerInvitation: 'partners',
  SchoolSupplyList: 'school-lists',
  SchoolSupplyListItem: 'school-lists',
  ListSelection: 'school-lists',
  ListOffer: 'school-lists',
  Product: 'catalog',
  ProductVariant: 'catalog',
  Category: 'catalog',
  Brand: 'catalog',
  Tag: 'catalog',
  Collection: 'catalog',
  Attribute: 'catalog',
  Order: 'orders',
  OrderLine: 'orders',
  AttributedOrder: 'orders',
  StockBalance: 'inventory',
  StockReservation: 'inventory',
  Warehouse: 'inventory',
} as const;

/**
 * Every link in the domain. Declared `as const` so that the relation tests can check each `via`
 * against the real field of its `from` entity.
 */
export const RELATIONS = [
  // Catalogue
  {
    from: 'ProductVariant',
    to: 'Product',
    via: 'productId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'Product',
    to: 'Category',
    via: 'categoryId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'Product',
    to: 'Brand',
    via: 'brandId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: false,
  },
  // The category tree: a top-level category has no parent.
  {
    from: 'Category',
    to: 'Category',
    via: 'parentId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: false,
  },
  {
    from: 'Product',
    to: 'Tag',
    via: 'tagIds',
    toPerFrom: 'many',
    fromPerTo: 'many',
    required: false,
  },
  // A Collection is filled by the products that carry any of its tags.
  {
    from: 'Collection',
    to: 'Tag',
    via: 'tagIds',
    toPerFrom: 'many',
    fromPerTo: 'many',
    required: false,
  },
  // A variant's attribute values are keyed by Attribute key, not id.
  {
    from: 'ProductVariant',
    to: 'Attribute',
    via: 'attributes',
    toPerFrom: 'many',
    fromPerTo: 'many',
    required: false,
  },
  // Partners and people
  {
    from: 'PartnerMembership',
    to: 'Customer',
    via: 'customerId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'PartnerMembership',
    to: 'BusinessPartner',
    via: 'businessPartnerId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'PartnerInvitation',
    to: 'BusinessPartner',
    via: 'businessPartnerId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'PartnerSchoolProfile',
    to: 'BusinessPartner',
    via: 'businessPartnerId',
    toPerFrom: 'one',
    fromPerTo: 'one',
    required: true,
  },
  // School Supply Lists
  {
    from: 'SchoolSupplyList',
    to: 'BusinessPartner',
    via: 'businessPartnerId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'SchoolSupplyListItem',
    to: 'SchoolSupplyList',
    via: 'supplyListId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  // Every item has a default variant; only a draft may still lack one.
  {
    from: 'SchoolSupplyListItem',
    to: 'ProductVariant',
    via: 'defaultVariantId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: false,
  },
  // An Exact Item has no specification; any other item names exactly one category.
  {
    from: 'SchoolSupplyListItem',
    to: 'Category',
    via: 'specification.categoryId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: false,
  },
  // A list has at most one List Offer; a List Replacement copies it to the new list.
  {
    from: 'ListOffer',
    to: 'SchoolSupplyList',
    via: 'supplyListId',
    toPerFrom: 'one',
    fromPerTo: 'one',
    required: true,
  },
  {
    from: 'ListSelection',
    to: 'SchoolSupplyList',
    via: 'supplyListId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  // Orders. A guest buyer has no Customer; a cart Order has no School Supply List.
  {
    from: 'Order',
    to: 'Customer',
    via: 'buyer.customerId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: false,
  },
  {
    from: 'Order',
    to: 'SchoolSupplyList',
    via: 'source.supplyListId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: false,
  },
  {
    from: 'OrderLine',
    to: 'Order',
    via: 'orderId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'OrderLine',
    to: 'ProductVariant',
    via: 'variantId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'OrderLine',
    to: 'SchoolSupplyListItem',
    via: 'supplyListItemId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: false,
  },
  {
    from: 'AttributedOrder',
    to: 'Order',
    via: 'orderId',
    toPerFrom: 'one',
    fromPerTo: 'one',
    required: true,
  },
  {
    from: 'AttributedOrder',
    to: 'SchoolSupplyList',
    via: 'supplyListId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'AttributedOrder',
    to: 'BusinessPartner',
    via: 'businessPartnerId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  // Inventory
  {
    from: 'StockBalance',
    to: 'ProductVariant',
    via: 'variantId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'StockBalance',
    to: 'Warehouse',
    via: 'warehouseId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'StockReservation',
    to: 'Order',
    via: 'orderId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'StockReservation',
    to: 'ProductVariant',
    via: 'variantId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
  {
    from: 'StockReservation',
    to: 'Warehouse',
    via: 'warehouseId',
    toPerFrom: 'one',
    fromPerTo: 'many',
    required: true,
  },
] as const satisfies readonly Relation[];
