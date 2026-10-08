import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import type { OrderStatus, PaymentStatus } from '@findeg/backend/features/core';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * DATABASE_URL from the environment, falling back to the repo-root .env that db:migrate uses
 * (Cypress runs from frontend/dashboard).
 */
function databaseUrl(): string {
  const url = readDatabaseUrl();
  assertLocalDatabase(url);
  return url;
}

function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envFile = readFileSync(path.resolve(process.cwd(), '../../.env'), 'utf8');
  const line = envFile.split('\n').find((l) => l.startsWith('DATABASE_URL='));
  if (!line) throw new Error('DATABASE_URL is not set');
  return line.slice('DATABASE_URL='.length).trim();
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/** These tasks insert and mutate Orders directly, so they must never run against a remote database. */
function assertLocalDatabase(url: string): void {
  const host = new URL(url).hostname;
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `Refusing to run order fixture tasks against non-local database host "${host}"`,
    );
  }
}

/** Runs `fn` with a single-connection client on the (local) test database, always closing it. */
async function withSql<T>(fn: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    return await fn(sql);
  } finally {
    await sql.end();
  }
}

function orderReference(): string {
  const bytes = randomBytes(6);
  return `FE-${Array.from(bytes, (b) => CROCKFORD[b % 32]).join('')}`;
}

export interface CreatedTestOrder {
  id: number;
  orderReference: string;
}

interface SetOrderStateArgs<S extends string = OrderStatus> {
  id: number;
  status: S;
}

/** Column and enum names are fixed internal literals, never caller input. */
function setOrderState(
  column: 'status' | 'payment_status',
  enumType: 'order_status' | 'payment_status',
  { id, status }: { id: number; status: OrderStatus | PaymentStatus },
): Promise<null> {
  return withSql(async (sql) => {
    await sql`update sales.orders set ${sql(column)} = ${status}::${sql(`sales.${enumType}`)} where id = ${id}`;
    return null;
  });
}

/**
 * Cypress tasks that give each spec its own Order, so no spec depends on (or mutates) a
 * seeded Order. Orders are retained by design (the database refuses to delete them), so each
 * fixture keeps a unique reference and is never reused.
 */
export const orderFixtureTasks = {
  createTestOrder(): Promise<CreatedTestOrder> {
    return withSql(async (sql) => {
      const reference = orderReference();
      const [row] = await sql<{ id: number }[]>`
        insert into sales.orders
          (order_reference, guest_email, status, payment_status, subtotal, total_amount, currency,
           shipping_address_snapshot)
        values
          (${reference}, ${`order-ops-${reference.toLowerCase()}@example.test`}, 'pending', 'unpaid',
           '100.00', '100.00', 'EGP',
           ${sql.json({
             fullName: 'Order Operations Tester',
             phone: '01012345678',
             city: 'Cairo',
             area: 'Maadi',
             street: 'Road 9',
           })})
        returning id`;
      return { id: row.id, orderReference: reference };
    });
  },

  /** Moves an Order out-of-band, as a second Staff session would, to make an open page stale. */
  setTestOrderStatus(args: SetOrderStateArgs): Promise<null> {
    return setOrderState('status', 'order_status', args);
  },

  setTestOrderPaymentStatus(args: SetOrderStateArgs<PaymentStatus>): Promise<null> {
    return setOrderState('payment_status', 'payment_status', args);
  },
};
