export type PaymentMethod = 'cod' | 'card';

export interface CustomerAddressInput {
  readonly fullName: string;
  readonly phone: string;
  readonly city: string;
  readonly area: string;
  readonly street: string;
}

export interface GuestOrderItemInput {
  readonly variantId: number;
  readonly quantity: number;
}

export interface GuestOrderRequest {
  readonly idempotencyKey: string;
  readonly email: string;
  readonly customer: CustomerAddressInput;
  readonly shippingAddress: {
    readonly city: string;
    readonly area: string;
    readonly street: string;
  };
  readonly items: readonly GuestOrderItemInput[];
  readonly paymentMethod: PaymentMethod;
}

export interface GuestOrderLine {
  readonly variantId: number;
  readonly quantity: number;
  readonly unitPrice: string;
  readonly total: string;
}

export interface GuestOrderReservation {
  readonly status: 'reserved';
  readonly createdAt: string;
}

export interface GuestAccess {
  readonly reference: string;
  readonly verificationCode: string;
  readonly used: boolean;
}

export interface GuestOrderRecord {
  readonly id: string;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly email: string;
  readonly customer: CustomerAddressInput;
  readonly shippingAddress: {
    readonly city: string;
    readonly area: string;
    readonly street: string;
  };
  readonly items: readonly GuestOrderLine[];
  readonly total: string;
  readonly reservation: GuestOrderReservation;
  readonly paymentMethod: PaymentMethod;
  readonly guestAccess: GuestAccess;
  readonly createdAt: string;
  readonly status: 'accepted' | 'pending' | 'paid' | 'fulfilled' | 'cancelled';
}

/** Browser-safe ordinary Storefront commerce; List Selection has a separate contract. */
export interface CartItem {
  readonly variantId: number;
  readonly quantity: number;
}

export interface PricedItem extends CartItem {
  readonly sku: string;
  readonly name: { readonly en?: string; readonly ar?: string };
  readonly label: { readonly en?: string; readonly ar?: string };
  readonly unitPrice: string;
  readonly lineTotal: string;
}

export interface CartQuote {
  readonly items: readonly PricedItem[];
  readonly subtotal: string;
}

export interface DeliveryZone {
  readonly id: number;
  readonly name: { readonly en: string; readonly ar: string };
  readonly fee: string;
}

export interface DeliveryAddress {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly street: string;
  readonly city: string;
  readonly zoneId: number;
}

export interface AcceptedOrder {
  readonly reference: string;
  readonly status: 'accepted';
  readonly paymentMethod: 'cash-on-delivery';
  readonly paymentStatus: 'unpaid';
  readonly deliveryMethod: 'home-delivery';
  readonly items: readonly PricedItem[];
  readonly subtotal: string;
  readonly deliveryFee: string;
  readonly total: string;
  readonly address: DeliveryAddress;
  readonly guestAccess: { readonly reference: string };
}
