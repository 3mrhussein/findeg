import type { PaymentStatus } from '@findeg/backend/features/core/domain/types/common';

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ['unpaid', 'paid', 'refunded'];

/**
 *
 */
export function paymentStatus(value: string | undefined): value is PaymentStatus {
  if (!value) return false;
  return PAYMENT_STATUS_OPTIONS.includes(value as PaymentStatus);
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  refunded: 'Refunded',
};

const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  unpaid: ['paid'],
  paid: ['refunded'],
  refunded: [],
};

/**
 *
 */
export function normalizePaymentStatus(status: string | undefined): PaymentStatus {
  if (!status) return 'unpaid';
  return paymentStatus(status) ? status : 'unpaid';
}

/**
 *
 */
export function getAllowedPaymentStatusTransitions(currentStatus: PaymentStatus): PaymentStatus[] {
  return PAYMENT_STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 *
 */
export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) return true;
  return getAllowedPaymentStatusTransitions(from).includes(to);
}

/**
 *
 */
export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}
