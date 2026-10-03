import { OutboxService } from './OutboxService';
import { ORDER_ACCEPTED_KIND, type OutboxHandlers } from '../domain/types';
import { ResendEmailProvider, type EmailProvider } from '../infrastructure/EmailProvider';
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
