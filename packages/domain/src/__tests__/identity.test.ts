import { describe, expectTypeOf, it } from 'vitest';
import type {
  BusinessPartner,
  BusinessPartnerId,
  Customer,
  CustomerId,
  ListOffer,
  ListOfferId,
  Order,
  OrderId,
  OrderLine,
  OrderLineId,
  PartnerInvitation,
  PartnerInvitationId,
  PartnerMembership,
  PartnerMembershipId,
  ProductId,
  ProductVariant,
  SchoolSupplyList,
  SchoolSupplyListItem,
  SupplyListId,
  SupplyListItemId,
  VariantId,
  Warehouse,
  WarehouseId,
} from '@findeg/domain';

// These checks run under `tsc` (the package type-check): a raw number or another entity's id
// in an id's place is a compile error.
describe('identity types', () => {
  it('every entity is identified by its own branded id', () => {
    expectTypeOf<Customer['id']>().toEqualTypeOf<CustomerId>();
    expectTypeOf<BusinessPartner['id']>().toEqualTypeOf<BusinessPartnerId>();
    expectTypeOf<PartnerMembership['id']>().toEqualTypeOf<PartnerMembershipId>();
    expectTypeOf<PartnerInvitation['id']>().toEqualTypeOf<PartnerInvitationId>();
    expectTypeOf<SchoolSupplyList['id']>().toEqualTypeOf<SupplyListId>();
    expectTypeOf<SchoolSupplyListItem['id']>().toEqualTypeOf<SupplyListItemId>();
    expectTypeOf<ListOffer['id']>().toEqualTypeOf<ListOfferId>();
    expectTypeOf<ProductVariant['id']>().toEqualTypeOf<VariantId>();
    expectTypeOf<ProductVariant['productId']>().toEqualTypeOf<ProductId>();
    expectTypeOf<Order['id']>().toEqualTypeOf<OrderId>();
    expectTypeOf<OrderLine['id']>().toEqualTypeOf<OrderLineId>();
    expectTypeOf<Warehouse['id']>().toEqualTypeOf<WarehouseId>();
  });

  it('ids of different entities cannot be mixed up', () => {
    expectTypeOf<OrderId>().not.toExtend<CustomerId>();
    expectTypeOf<VariantId>().not.toExtend<ProductId>();
    expectTypeOf<SupplyListId>().not.toExtend<SupplyListItemId>();
  });

  it('a raw number is not an id', () => {
    expectTypeOf<number>().not.toExtend<OrderId>();
    expectTypeOf<number>().not.toExtend<BusinessPartnerId>();
  });

  it('links between entities use the parent id type', () => {
    expectTypeOf<OrderLine['orderId']>().toEqualTypeOf<OrderId>();
    expectTypeOf<OrderLine['variantId']>().toEqualTypeOf<VariantId>();
    expectTypeOf<PartnerMembership['customerId']>().toEqualTypeOf<CustomerId>();
    expectTypeOf<SchoolSupplyList['businessPartnerId']>().toEqualTypeOf<BusinessPartnerId>();
  });
});
