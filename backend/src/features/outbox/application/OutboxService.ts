import { outboxQueries, checkoutIdempotencyQueries } from '@findeg/db/queries';
import type { OutboxStatus } from '@findeg/db/schema';
import type { DrainResult, OutboxHandlers } from '../domain/types';

export const DEFAULT_DRAIN_LIMIT = 25;

export interface SweepResult {
  drain: DrainResult;
  purged: { delivered: number; idempotency: number };
  counts: Record<OutboxStatus, number>;
}

export class OutboxService {
  constructor(private readonly handlers: OutboxHandlers) {}

  /** Claims and delivers up to `limit` due rows, one at a time. */
  async drain({ limit = DEFAULT_DRAIN_LIMIT }: { limit?: number } = {}): Promise<DrainResult> {
    const result: DrainResult = {
      claimed: 0,
      delivered: 0,
      retried: 0,
      exhausted: 0,
      expired: 0,
      leaseLost: 0,
    };

    for (let i = 0; i < limit; i++) {
      const claimed = await outboxQueries.claimNext();
      if (!claimed) break;
      result.claimed++;
      await this.deliver(claimed, result);
    }
    return result;
  }

  /** Scheduled once a minute by the host: drain, purge old rows, report counts per status. */
  async sweep({ limit }: { limit?: number } = {}): Promise<SweepResult> {
    const drain = await this.drain({ limit });
    const [delivered, idempotency] = await Promise.all([
      outboxQueries.purgeDelivered(),
      checkoutIdempotencyQueries.purgeExpired(),
    ]);
    return {
      drain,
      purged: { delivered, idempotency },
      counts: await outboxQueries.countByStatus(),
    };
  }

  private async deliver(
    { row, leaseToken }: outboxQueries.ClaimedOutboxRow,
    result: DrainResult,
  ): Promise<void> {
    try {
      const handler = this.handlers[row.kind];
      if (!handler) throw new Error(`No outbox handler for kind "${row.kind}"`);
      const outcome = await handler(row.payload, { rowId: row.id, attempt: row.attempts });

      if (outcome === 'expired') {
        const owned = await outboxQueries.markExpired(row.id, leaseToken);
        owned ? result.expired++ : result.leaseLost++;
      } else {
        const owned = await outboxQueries.markDelivered(row.id, leaseToken);
        owned ? result.delivered++ : result.leaseLost++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const owned = await outboxQueries.markFailed(row.id, leaseToken, row.attempts, message);
      if (!owned) result.leaseLost++;
      else if (row.attempts >= outboxQueries.OUTBOX_MAX_ATTEMPTS) result.exhausted++;
      else result.retried++;
    }
  }
}
