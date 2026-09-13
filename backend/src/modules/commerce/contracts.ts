/** Browser-safe ordinary Storefront commerce; List Selection has a separate contract. */
export interface CartItem {
  readonly variantId: number;
  readonly quantity: number;
}

export interface PricedItem extends CartItem {
  readonly reward?: import('../partner-rewards/contracts.js').RewardSnapshot;
  readonly attribution?: ListAttribution;
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
  readonly currentState?: OrderState;
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

export interface ListChoice extends CartItem {
  readonly listItemId: number;
}
export interface ListSelection {
  readonly setCount: number;
  readonly items: readonly ListChoice[];
}

export interface ListAttribution {
  readonly listId: number;
  readonly businessPartnerId: number;
  readonly listItemId: number;
  readonly specification?: import('../school-supply-lists/contracts.js').ListItemSpecification;
  readonly defaultVariantId: number;
  readonly alternative: boolean;
  readonly catalogUnitPrice: string;
  readonly offerBasisPoints: number;
  readonly discountAmount: string;
}
export interface ListCompleteness {
  readonly complete: boolean;
  readonly required: readonly { listItemId: number; expected: number; selected: number }[];
}

export interface ListSelectionView {
  readonly status: 'found';
  readonly list: import('../school-supply-lists/contracts.js').SchoolSupplyList;
  readonly selection: ListSelection;
  readonly options: readonly {
    listItemId: number;
    variants: readonly import('../catalog/contracts.js').ListCatalogVariant[];
  }[];
  readonly offerBasisPoints: number;
  readonly pricing?: CartQuote & { readonly completeness: ListCompleteness };
}
export type ListSelectionResult =
  | ListSelectionView
  | {
      readonly status: 'invalid-input' | 'not-found' | 'list-unavailable' | 'selection-unavailable';
    };

/** Current lifecycle projection; the original AcceptedOrder remains an immutable snapshot. */
export interface OrderState {
  readonly reference: string;
  readonly fulfillmentStatus: 'accepted' | 'delivered';
  readonly paymentStatus: 'unpaid' | 'paid';
  readonly total: string;
  readonly deliveredAt?: string;
  readonly paidAt?: string;
}
export interface OrderLifecycleReceipt {
  readonly status: 'delivered' | 'paid';
  readonly state: OrderState;
}
