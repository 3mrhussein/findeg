/** What a handler did with a row: send it, or decide it must never be sent. */
export type OutboxHandlerResult = 'delivered' | 'expired';

export interface OutboxHandlerContext {
  /** The row id, derived from the business fact; use it as the provider idempotency key. */
  rowId: string;
  /** 1-based attempt number (counts reclaimed leases too). */
  attempt: number;
}

/**
 * Delivers one outbox row. Throwing schedules a retry; returning `'expired'` ends the row without
 * sending (a secret-bearing row whose request has expired).
 */
export type OutboxHandler = (
  payload: Record<string, unknown>,
  context: OutboxHandlerContext,
) => Promise<OutboxHandlerResult>;

export type OutboxHandlers = Record<string, OutboxHandler>;

export interface DrainResult {
  claimed: number;
  delivered: number;
  retried: number;
  exhausted: number;
  expired: number;
  /** Rows whose lease was reclaimed by another drain before this one finished. */
  leaseLost: number;
}

export const ORDER_ACCEPTED_KIND = 'order-accepted';

/** Row id for an order's confirmation email: one per Order Reference. */
export const orderAcceptedId = (orderReference: string) =>
  `${ORDER_ACCEPTED_KIND}:${orderReference}`;

export const GUEST_ACCESS_KIND = 'guest-access';

/** Row id for a guest access code email: one per access request. */
export const guestAccessId = (requestId: string) => `${GUEST_ACCESS_KIND}:${requestId}`;

export const ORDER_STATUS_KIND = 'order-status';

/** Statuses that notify the customer; one email per status per order. */
export const NOTIFIED_ORDER_STATUSES = ['shipped', 'delivered', 'cancelled'] as const;
export type NotifiedOrderStatus = (typeof NOTIFIED_ORDER_STATUSES)[number];

export const isNotifiedOrderStatus = (status: string): status is NotifiedOrderStatus =>
  (NOTIFIED_ORDER_STATUSES as readonly string[]).includes(status);

/** Row id for a status email: one per Order Reference and status. */
export const orderStatusId = (orderReference: string, status: NotifiedOrderStatus) =>
  `${ORDER_STATUS_KIND}:${orderReference}:${status}`;
