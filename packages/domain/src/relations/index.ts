/**
 * The business-domain map: which entity belongs to which domain, and how entities relate.
 *
 * Cross-domain links are by id (ADR-0016 boundary rule), never by object reference. The
 * `__tests__/relations.test.ts` suite checks this map against the schema, so a relation that
 * points at a missing entity fails the build.
 */

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
  ListOffer: 'orders',
  ProductVariant: 'catalog',
  Order: 'orders',
  OrderLine: 'orders',
  AttributedOrder: 'orders',
  StockReservation: 'inventory',
  Warehouse: 'inventory',
} as const;

export type EntityName = keyof typeof ENTITY_DOMAINS;
export type DomainName = (typeof ENTITY_DOMAINS)[EntityName];

/** How many entities sit on each side of a link. `one` means at most one, `many` means any number. */
export type Multiplicity = 'one' | 'many';

/**
 * `from` stores the link: it holds the id field `via`, which references `to`. Every relation is
 * therefore child → parent, and it is the child's field that carries the id.
 */
export interface Relation {
  from: EntityName;
  to: EntityName;
  /** The field on `from` that holds the id of `to`. */
  via: string;
  /** How many `to` one `from` may reference. Always `one` here, since a link names a single parent. */
  toPerFrom: Multiplicity;
  /** How many `from` may reference one `to`. */
  fromPerTo: Multiplicity;
  /** The link is mandatory: every `from` must reference a `to`. Optional links are nullable fields. */
  required: boolean;
}

export const RELATIONS: readonly Relation[] = [
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
  {
    from: 'ListOffer',
    to: 'SchoolSupplyList',
    via: 'supplyListId',
    toPerFrom: 'one',
    fromPerTo: 'many',
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
  // Orders (guests have no Customer)
  {
    from: 'Order',
    to: 'Customer',
    via: 'customerId',
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
];
