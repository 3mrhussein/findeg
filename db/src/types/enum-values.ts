// Shared literals for browser-safe validation and PostgreSQL enum definitions.
export const PORTAL_ROLE_VALUES = ['customer', 'staff'] as const;
export const ACTOR_TYPE_VALUES = ['guest', 'user', 'service'] as const;
export const ORDER_STATUS_VALUES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export const PAYMENT_STATUS_VALUES = ['unpaid', 'paid', 'refunded'] as const;
export const PAYMENT_METHOD_VALUES = ['cod', 'card'] as const;
