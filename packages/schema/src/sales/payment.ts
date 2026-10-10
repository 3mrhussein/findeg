/** Payment vocabulary (GLOSSARY: Refund; ADR-0005). Payment status is separate from Order status. */

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_TRANSITIONS: Readonly<Record<PaymentStatus, readonly PaymentStatus[]>> =
  {
    unpaid: ['paid'],
    paid: ['refunded'],
    refunded: [],
  };

/**
 * Phase one accepts cash on delivery only (GLOSSARY, ADR-0005). `card` exists in the database
 * enum but has no accepted path; re-add it here only with a decision record.
 */
export const PAYMENT_METHODS = ['cod'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
