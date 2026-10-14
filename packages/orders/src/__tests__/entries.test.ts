import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import * as root from '@findeg/orders';
import * as typesEntry from '@findeg/orders/types';
import type { Order, OrderStatus, OrderStatusUpdate, ShippingAddress } from '@findeg/orders/types';

vi.mock('@findeg/db/connection', () => {
  throw new Error('Public entries must not load the connection');
});

// The root runtime index is the public contract. Adding a name is a deliberate API change:
// update this list in the same change. Removing or renaming one breaks consumers.
const ROOT_RUNTIME_EXPORTS = [
  'CheckoutLineSchema',
  'CheckoutOrderSchema',
  'CheckoutService',
  'CheckoutShippingAddressSchema',
  'CheckoutValidateSchema',
  'DomainError',
  'InvalidOrderStatusTransitionError',
  'GUEST_ACCESS_KIND',
  'GUEST_ORDER_COOKIE',
  'GUEST_ORDER_TOKEN_SECONDS',
  'GuestAccessRequestSchema',
  'GuestAccessService',
  'GuestAccessVerifySchema',
  'InvalidPaymentStatusTransitionError',
  'ListCheckoutLineSchema',
  'ListUnavailableError',
  'NotAuthorizedError',
  'ORDER_ACCEPTED_KIND',
  'ORDER_STATUS_KIND',
  'ORDER_SUCCESS_MESSAGES',
  'OrderNotFoundError',
  'OrderStatusSchema',
  'OrderStatusUpdateSchema',
  'PaymentStatusSchema',
  'SelectionInvalidError',
  'ShippingAddressSchema',
  'UnavailableVariantError',
  'VariantSnapshotSchema',
  'assertCanWriteOrders',
  'canWriteOrders',
  'computeOrderFingerprint',
  'createCheckoutService',
  'createGuestAccessService',
  'createOrders',
  'guestAccessId',
  'hashCode',
  'mintCode',
  'orderAcceptedId',
  'orderStatusId',
];

describe('root runtime entry', () => {
  it('exposes exactly the pinned runtime names', () => {
    expect(Object.keys(root).sort()).toEqual([...ROOT_RUNTIME_EXPORTS].sort());
  });
});

describe('root types entry', () => {
  it('carries no runtime value', () => {
    expect(Object.keys(typesEntry)).toEqual([]);
  });

  it('exposes the same types as the root index', () => {
    expectTypeOf<import('@findeg/orders').Order>().toEqualTypeOf<Order>();
    expectTypeOf<import('@findeg/orders').OrderStatus>().toEqualTypeOf<OrderStatus>();
    expectTypeOf<import('@findeg/orders').OrderStatusUpdate>().toEqualTypeOf<OrderStatusUpdate>();
    expectTypeOf<import('@findeg/orders').ShippingAddress>().toEqualTypeOf<ShippingAddress>();
  });
});
