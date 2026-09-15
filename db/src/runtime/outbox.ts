import { sql } from 'drizzle-orm';
import { createTransactionDatabase, type TransactionDatabaseConfig } from './transactions.js';

export interface OutboxMessage {
  readonly id: string;
  readonly kind: string;
  readonly payload: unknown;
}

export interface OutboxClaim extends OutboxMessage {
  readonly attempts: number;
  readonly lease_token: string;
}

export interface OutboxStatus {
  pending: number;
  processing: number;
  delivered: number;
  exhausted: number;
}

/** Runtime-owned persistence. Each call ends its transaction before delivery. */
export function createOutboxPersistence(config: TransactionDatabaseConfig) {
  const database = createTransactionDatabase(config);
  return {
    claim: (token: string, maxAttempts: number) =>
      database.transaction(async (transaction) => {
        await transaction.execute(sql`
          UPDATE system.checkout_outbox
          SET status = 'exhausted', lease_token = NULL, lease_until = NULL, last_error = 'lease-expired'
          WHERE status = 'processing' AND lease_until <= now() AND attempts >= ${maxAttempts}
        `);
        const rows = await transaction.execute<OutboxClaim & Record<string, unknown>>(sql`
          WITH next AS (
            SELECT id FROM system.checkout_outbox
            WHERE (
              (status = 'pending' AND next_attempt_at <= now())
              OR (status = 'processing' AND lease_until <= now())
            ) AND attempts < ${maxAttempts}
            ORDER BY created_at, id FOR UPDATE SKIP LOCKED LIMIT 1
          )
          UPDATE system.checkout_outbox AS message
          SET status = 'processing', attempts = attempts + 1,
              lease_token = ${token}::uuid, lease_until = now() + interval '60 seconds'
          FROM next WHERE message.id = next.id
          RETURNING message.id, kind, payload, attempts, lease_token
        `);
        return rows[0];
      }),
    delivered: (claim: OutboxClaim) =>
      database.transaction(async (transaction) => {
        await transaction.execute(sql`
          UPDATE system.checkout_outbox SET status = 'delivered', delivered_at = now(),
            lease_token = NULL, lease_until = NULL, last_error = NULL
          WHERE id = ${claim.id} AND lease_token = ${claim.lease_token}::uuid AND status = 'processing'
        `);
      }),
    failed: (
      claim: OutboxClaim,
      errorCategory: string,
      retryDelayMs: number,
      maxAttempts: number,
    ) =>
      database.transaction(async (transaction) => {
        await transaction.execute(sql`
          UPDATE system.checkout_outbox
          SET status = CASE WHEN attempts >= ${maxAttempts} THEN 'exhausted' ELSE 'pending' END,
              next_attempt_at = now() + (${retryDelayMs} || ' milliseconds')::interval,
              lease_token = NULL, lease_until = NULL,
              last_error = ${errorCategory}
          WHERE id = ${claim.id} AND lease_token = ${claim.lease_token}::uuid AND status = 'processing'
        `);
      }),
    sink: (message: OutboxMessage) =>
      database.transaction(async (transaction) => {
        await transaction.execute(sql`
          INSERT INTO system.notification_sink (id, kind, payload)
          VALUES (${message.id}, ${message.kind}, ${JSON.stringify(message.payload)}::jsonb)
          ON CONFLICT (id) DO NOTHING
        `);
      }),
    status: () =>
      database.transaction(async (transaction): Promise<OutboxStatus> => {
        const [counts] = await transaction.execute<OutboxStatus & Record<string, unknown>>(sql`
          SELECT count(*) FILTER (WHERE status = 'pending')::int AS pending,
            count(*) FILTER (WHERE status = 'processing')::int AS processing,
            count(*) FILTER (WHERE status = 'delivered')::int AS delivered,
            count(*) FILTER (WHERE status = 'exhausted')::int AS exhausted
          FROM system.checkout_outbox
        `);
        return counts!;
      }),
    close: database.close,
  };
}
