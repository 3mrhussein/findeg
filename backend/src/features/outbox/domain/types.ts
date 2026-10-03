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
