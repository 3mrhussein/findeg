import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  Attribute,
  AttributedOrder,
  Brand,
  BusinessPartner,
  Category,
  Collection,
  Customer,
  ListOffer,
  ListSelection,
  Order,
  OrderLine,
  PartnerInvitation,
  PartnerMembership,
  PartnerSchoolProfile,
  Product,
  ProductVariant,
  SchoolSupplyList,
  SchoolSupplyListItem,
  StockBalance,
  StockReservation,
  Tag,
  Warehouse,
} from '@findeg/domain';
import { ENTITY_DOMAINS, RELATIONS, type EntityName } from '@findeg/domain/relations';

const entities = Object.keys(ENTITY_DOMAINS) as EntityName[];

/** Every entity the map names, as the domain exports it. Nothing else belongs in the map. */
interface EntityTypes {
  Customer: Customer;
  BusinessPartner: BusinessPartner;
  PartnerSchoolProfile: PartnerSchoolProfile;
  PartnerMembership: PartnerMembership;
  PartnerInvitation: PartnerInvitation;
  SchoolSupplyList: SchoolSupplyList;
  SchoolSupplyListItem: SchoolSupplyListItem;
  ListSelection: ListSelection;
  ListOffer: ListOffer;
  Product: Product;
  ProductVariant: ProductVariant;
  Category: Category;
  Brand: Brand;
  Tag: Tag;
  Collection: Collection;
  Attribute: Attribute;
  Order: Order;
  OrderLine: OrderLine;
  AttributedOrder: AttributedOrder;
  StockBalance: StockBalance;
  StockReservation: StockReservation;
  Warehouse: Warehouse;
}

/** The keys of every member of a union. */
type KeysOf<T> = T extends unknown ? keyof T & string : never;
/** A field of `T`, or a field of that field (`buyer.customerId`), across union members. */
type FieldPath<T> = {
  [K in KeysOf<T>]: K | `${K}.${KeysOf<NonNullable<T extends Record<K, infer V> ? V : never>>}`;
}[KeysOf<T>];
/** The relations whose `via` is not a field of their `from` entity. */
type RelationsWithUnknownField<R = (typeof RELATIONS)[number]> = R extends {
  from: infer From extends EntityName;
  via: infer Via;
}
  ? Via extends FieldPath<EntityTypes[From]>
    ? never
    : R
  : R;

// Checked by `tsc` (the package type-check), like the identity types.
describe('the map against the domain types', () => {
  it('names exactly the entities the domain exports', () => {
    expectTypeOf<keyof EntityTypes>().toEqualTypeOf<EntityName>();
  });

  it('links each entity through a field it really has', () => {
    expectTypeOf<RelationsWithUnknownField>().toEqualTypeOf<never>();
  });

  it('holds no application plumbing or read projection', () => {
    for (const plumbing of [
      'OutboxMessage',
      'GuestOrderAccess',
      'IdempotencyKey',
      'PartnerReport',
    ]) {
      expect(entities).not.toContain(plumbing);
    }
    expect(new Set(Object.values(ENTITY_DOMAINS))).toEqual(
      new Set(['customers', 'partners', 'school-lists', 'catalog', 'orders', 'inventory']),
    );
  });
});

describe('business-domain map', () => {
  it('every relation points at a known entity', () => {
    for (const relation of RELATIONS) {
      expect(entities, `${relation.from} → ${relation.to}`).toContain(relation.from);
      expect(entities, `${relation.from} → ${relation.to}`).toContain(relation.to);
    }
  });

  it('no entity is orphaned', () => {
    const linked = new Set(RELATIONS.flatMap((r) => [r.from, r.to]));
    expect(entities.filter((e) => !linked.has(e))).toEqual([]);
  });

  it('no relation is declared twice', () => {
    const keys = RELATIONS.map((r) => `${r.from}|${r.to}|${r.via}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('cross-domain links are by id, never by object', () => {
    for (const relation of RELATIONS) {
      if (ENTITY_DOMAINS[relation.from] === ENTITY_DOMAINS[relation.to]) continue;
      expect(relation.via, `${relation.from} → ${relation.to}`).toMatch(/Id$/);
    }
  });

  it('an `…Id` field names one parent; an id list or an attribute map names many', () => {
    for (const relation of RELATIONS) {
      expect(relation.toPerFrom, `${relation.from}.${relation.via}`).toBe(
        relation.via.endsWith('Id') ? 'one' : 'many',
      );
    }
  });
});

describe('the catalogue in the map', () => {
  it('places every catalogue entity in the catalog area', () => {
    for (const entity of [
      'Product',
      'ProductVariant',
      'Category',
      'Brand',
      'Tag',
      'Collection',
      'Attribute',
    ]) {
      expect(ENTITY_DOMAINS, entity).toHaveProperty(entity, 'catalog');
    }
  });

  it('links a variant to its product, and a product to its category and optional brand', () => {
    expect(RELATIONS).toContainEqual({
      from: 'ProductVariant',
      to: 'Product',
      via: 'productId',
      toPerFrom: 'one',
      fromPerTo: 'many',
      required: true,
    });
    expect(RELATIONS).toContainEqual({
      from: 'Product',
      to: 'Category',
      via: 'categoryId',
      toPerFrom: 'one',
      fromPerTo: 'many',
      required: true,
    });
    expect(RELATIONS).toContainEqual({
      from: 'Product',
      to: 'Brand',
      via: 'brandId',
      toPerFrom: 'one',
      fromPerTo: 'many',
      required: false,
    });
  });

  it('nests a category under an optional parent category', () => {
    expect(RELATIONS).toContainEqual({
      from: 'Category',
      to: 'Category',
      via: 'parentId',
      toPerFrom: 'one',
      fromPerTo: 'many',
      required: false,
    });
  });

  it('tags products and fills collections by tag, both many-to-many', () => {
    expect(RELATIONS).toContainEqual({
      from: 'Product',
      to: 'Tag',
      via: 'tagIds',
      toPerFrom: 'many',
      fromPerTo: 'many',
      required: false,
    });
    expect(RELATIONS).toContainEqual({
      from: 'Collection',
      to: 'Tag',
      via: 'tagIds',
      toPerFrom: 'many',
      fromPerTo: 'many',
      required: false,
    });
  });

  it('keys a variant attribute value by its Attribute key', () => {
    expect(RELATIONS).toContainEqual({
      from: 'ProductVariant',
      to: 'Attribute',
      via: 'attributes',
      toPerFrom: 'many',
      fromPerTo: 'many',
      required: false,
    });
  });

  it("narrows a list item's specification to one category", () => {
    expect(RELATIONS).toContainEqual({
      from: 'SchoolSupplyListItem',
      to: 'Category',
      via: 'specification.categoryId',
      toPerFrom: 'one',
      fromPerTo: 'many',
      required: false,
    });
  });
});

describe('Order links', () => {
  it('reaches the Customer through the buyer; a guest buyer has none', () => {
    expect(RELATIONS).toContainEqual({
      from: 'Order',
      to: 'Customer',
      via: 'buyer.customerId',
      toPerFrom: 'one',
      fromPerTo: 'many',
      required: false,
    });
    expect(RELATIONS.filter((r) => r.from === 'Order' && r.to === 'Customer')).toHaveLength(1);
  });

  it('reaches its School Supply List through the source; a cart Order has none', () => {
    expect(RELATIONS).toContainEqual({
      from: 'Order',
      to: 'SchoolSupplyList',
      via: 'source.supplyListId',
      toPerFrom: 'one',
      fromPerTo: 'many',
      required: false,
    });
  });
});

describe('School Supply List links', () => {
  it('keeps the List Offer in the School Supply Lists area (story 51)', () => {
    expect(ENTITY_DOMAINS.ListOffer).toBe('school-lists');
  });

  it('gives a list at most one List Offer', () => {
    expect(RELATIONS).toContainEqual({
      from: 'ListOffer',
      to: 'SchoolSupplyList',
      via: 'supplyListId',
      toPerFrom: 'one',
      fromPerTo: 'one',
      required: true,
    });
  });
});
