import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * DATABASE_URL from the environment, falling back to the repo-root .env that db:migrate uses
 * (Cypress runs from frontend/dashboard).
 */
function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envFile = readFileSync(path.resolve(process.cwd(), '../../.env'), 'utf8');
  const line = envFile.split('\n').find((l) => l.startsWith('DATABASE_URL='));
  if (!line) throw new Error('DATABASE_URL is not set');
  return line.slice('DATABASE_URL='.length).trim();
}

function orderReference(): string {
  const bytes = randomBytes(6);
  return `FE-${Array.from(bytes, (b) => CROCKFORD[b % 32]).join('')}`;
}

export interface CreatedTestOrder {
  id: number;
  orderReference: string;
}

/**
 * Cypress tasks that give each spec its own Order, so no spec depends on (or mutates) a
 * seeded Order. Orders are retained by design (the database refuses to delete them), so each
 * fixture keeps a unique reference and is never reused.
 */
export const orderFixtureTasks = {
  async createTestOrder(): Promise<CreatedTestOrder> {
    const sql = postgres(databaseUrl(), { max: 1 });
    try {
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
    } finally {
      await sql.end();
    }
  },

  /** Moves an Order out-of-band, as a second Staff session would, to make an open page stale. */
  async setTestOrderStatus({ id, status }: { id: number; status: string }): Promise<null> {
    const sql = postgres(databaseUrl(), { max: 1 });
    try {
      await sql`update sales.orders set status = ${status}::sales.order_status where id = ${id}`;
      return null;
    } finally {
      await sql.end();
    }
  },

  async setTestOrderPaymentStatus({ id, status }: { id: number; status: string }): Promise<null> {
    const sql = postgres(databaseUrl(), { max: 1 });
    try {
      await sql`update sales.orders set payment_status = ${status}::sales.payment_status where id = ${id}`;
      return null;
    } finally {
      await sql.end();
    }
  },
};
