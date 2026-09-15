import { randomUUID } from 'node:crypto';
import { createOutboxPersistence, type OutboxMessage } from '@findeg/db/outbox';
import { readWorkerConfig } from './config.js';

/** Delivery IDs must be forwarded as provider deduplication keys where supported. */
export interface NotificationAdapter {
  deliver(message: OutboxMessage, signal: AbortSignal): Promise<void>;
}

export function createOutboxDelivery(
  environment: Readonly<Record<string, string | undefined>>,
  adapter?: NotificationAdapter,
) {
  const config = readWorkerConfig(environment);
  const persistence = createOutboxPersistence({
    url: config.DATABASE_URL,
    ssl: config.DB_SSL,
    max: 2,
  });
  const delivery = adapter ?? { deliver: persistence.sink };
  return {
    async deliverNext(signal?: AbortSignal) {
      const claim = await persistence.claim(randomUUID(), config.OUTBOX_MAX_ATTEMPTS);
      if (!claim) return 'idle' as const;
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(new Error('delivery-timeout')),
        config.OUTBOX_DELIVERY_TIMEOUT_MS,
      );
      const onAbort = () => controller.abort(signal?.reason);
      if (signal) signal.addEventListener('abort', onAbort, { once: true });
      try {
        await delivery.deliver(
          { id: claim.id, kind: claim.kind, payload: claim.payload },
          controller.signal,
        );
        await persistence.delivered(claim);
        return 'delivered' as const;
      } catch (error) {
        const isTimeout =
          controller.signal.aborted ||
          Boolean(signal?.aborted) ||
          (error instanceof Error &&
            (error.name === 'AbortError' || /timeout/i.test(error.message)));
        const errorCategory = isTimeout ? 'delivery-timeout' : 'delivery-failed';
        const retryDelay = Math.min(
          3600000,
          config.OUTBOX_RETRY_MS * Math.pow(2, Math.max(0, claim.attempts - 1)),
        );
        await persistence.failed(claim, errorCategory, retryDelay, config.OUTBOX_MAX_ATTEMPTS);
        return 'failed' as const;
      } finally {
        clearTimeout(timeoutId);
        if (signal) signal.removeEventListener('abort', onAbort);
      }
    },
    status: persistence.status,
    close: persistence.close,
  };
}
