import { outboxQueries } from '@findeg/db/queries';
import { OutboxService } from './OutboxService';
import {
  GUEST_ACCESS_KIND,
  ORDER_ACCEPTED_KIND,
  ORDER_STATUS_KIND,
  type OutboxHandlers,
} from '../domain/types';
import { ResendEmailProvider, type EmailProvider } from '../infrastructure/EmailProvider';
import { createGuestAccessHandler } from '../infrastructure/guest-access-handler';
import { createOrderStatusHandler } from '../infrastructure/order-status-handler';
import { createOrderAcceptedHandler } from '../infrastructure/order-accepted-handler';

export interface OutboxOptions {
  /** Defaults to Resend; tests pass a fake. */
  emailProvider?: EmailProvider;
  /** Extra or overriding handlers, keyed by row kind. */
  handlers?: OutboxHandlers;
}

export function createOutbox(options: OutboxOptions = {}): OutboxService {
  const emailProvider = options.emailProvider ?? new ResendEmailProvider();
  return new OutboxService({
    [ORDER_ACCEPTED_KIND]: createOrderAcceptedHandler(emailProvider),
    [ORDER_STATUS_KIND]: createOrderStatusHandler(emailProvider),
    [GUEST_ACCESS_KIND]: createGuestAccessHandler(emailProvider),
    ...options.handlers,
  });
}

/** Drains due rows with the default (Resend) provider. */
export function drainOutbox(options?: { limit?: number }) {
  return createOutbox().drain(options);
}

/** Drain, purge and report: the once-a-minute sweeper body. */
export function sweepOutbox(options?: { limit?: number }) {
  return createOutbox().sweep(options);
}

/** Exhausted rows (delivery gave up), newest first, for the Dashboard. */
export function listExhaustedOutbox(limit?: number) {
  return outboxQueries.listExhausted(limit);
}

/** Staff retry: re-queues one exhausted row. False when it is no longer exhausted. */
export function retryOutbox(id: string) {
  return outboxQueries.requeueExhausted(id);
}

export async function countExhaustedOutbox() {
  return (await outboxQueries.countByStatus()).exhausted;
}
