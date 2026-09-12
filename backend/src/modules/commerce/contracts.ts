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

export interface CheckoutInput {
  readonly key: string;
  readonly confirmation: string;
  readonly address: DeliveryAddress;
  readonly paymentMethod: 'cash-on-delivery';
  readonly deliveryMethod: 'home-delivery';
}

export interface CheckoutQuote extends CartQuote {
  readonly zone: DeliveryZone;
  readonly total: string;
  readonly confirmation: string;
}

export interface CheckoutReceipt {
  readonly status: 'accepted';
  readonly reference: string;
  readonly accessReference: string;
  readonly total: string;
}

export type CartResult =
  | { readonly status: 'quoted'; readonly quote: CartQuote }
  | { readonly status: 'invalid-input' | 'variant-unavailable' | 'insufficient-stock' };

export type CheckoutQuoteResult =
  | ({ readonly status: 'quoted' } & CheckoutQuote)
  | {
      readonly status:
        | 'invalid-input'
        | 'empty-cart'
        | 'delivery-unavailable'
        | 'variant-unavailable'
        | 'insufficient-stock';
    };

export type CheckoutResult =
  | CheckoutReceipt
  | {
      readonly status:
        | 'invalid-input'
        | 'empty-cart'
        | 'delivery-unavailable'
        | 'variant-unavailable'
        | 'insufficient-stock'
        | 'reconfirmation-required'
        | 'idempotency-conflict';
    };

export type GuestOrderResult =
  | { readonly status: 'verified'; readonly order: AcceptedOrder }
  | { readonly status: 'invalid-input' | 'not-found' };
