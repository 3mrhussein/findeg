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
