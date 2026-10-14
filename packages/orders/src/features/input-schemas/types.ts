import type {
  OrderStatus as DomainOrderStatus,
  PaymentStatus as DomainPaymentStatus,
} from '@findeg/domain/types';

export type OrderStatus = DomainOrderStatus;
export type PaymentStatus = DomainPaymentStatus;
export type { StoredShippingAddress as ShippingAddress, VariantSnapshot } from '@findeg/db/types';
